'use strict';
/**
 * pack-leveldb.cjs
 * Writes an array of Foundry Item documents into a LevelDB compendium pack.
 * Usage: node pack-leveldb.cjs <items.json> <out-dir>
 */
const { ClassicLevel } = require('classic-level');
const fs  = require('fs');
const path = require('path');

// docType: 'Item' (default) | 'RollTable' | 'Actor' | ...
const [,, srcJson, outDir, docType = 'Item'] = process.argv;
if (!srcJson || !outDir) {
  console.error('Usage: node pack-leveldb.cjs <items.json> <outDir> [docType]');
  process.exit(1);
}

// Map Foundry document type → compendium key prefix
const collectionPrefixMap = {
  'Item':      '!items!',
  'RollTable': '!tables!',
  'Actor':     '!actors!',
  'Scene':     '!scenes!',
  'JournalEntry': '!journal!',
  'Macro':     '!macros!',
};
const docPrefix = collectionPrefixMap[docType] || `!${docType.toLowerCase()}s!`;

const raw = JSON.parse(fs.readFileSync(srcJson, 'utf-8'));
// Accept both legacy array format and new { folders, items } format
const items   = Array.isArray(raw) ? raw : (raw.items   || []);
const folders = Array.isArray(raw) ? []  : (raw.folders || []);

(async () => {
  try {
    // Remove previous pack and start fresh
    if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });

    const db = new ClassicLevel(outDir);
    await db.open();  // classic-level v2 (abstract-level) requires explicit open
    const batch = db.batch();

    // Foundry v13 key formats:  !folders!<_id>  and  !<collection>!<_id>
    // In compendium packs, embedded sub-documents (results, items, pages…)
    // are stored INLINE in the parent document JSON — NOT as separate entries.
    for (const folder of folders) {
      batch.put(`!folders!${folder._id}`, JSON.stringify(folder));
    }
    for (const doc of items) {
      if (docType === 'RollTable') {
        // Foundry v13: store parent with results as array of IDs,
        // then each result as a separate entry: !tables.results!<tableId>.<resultId>
        const results = doc.results || [];
        const resultIds = results.map(r => r._id);
        batch.put(`${docPrefix}${doc._id}`, JSON.stringify({ ...doc, results: resultIds }));
        for (const result of results) {
          const fullResult = {
            type: 'text',
            weight: result.weight ?? 1,
            range: result.range,
            _id: result._id,
            name: result.name,
            img: result.img ?? 'icons/svg/d20-grey.svg',
            description: result.description ?? '',
            drawn: result.drawn ?? false,
            flags: result.flags ?? {},
            _stats: { compendiumSource: null, duplicateSource: null, exportSource: null },
            documentUuid: result.documentUuid ?? null,
          };
          batch.put(`!tables.results!${doc._id}.${result._id}`, JSON.stringify(fullResult));
        }
      } else {
        batch.put(`${docPrefix}${doc._id}`, JSON.stringify(doc));
      }
    }

    await batch.write();
    await db.close();
    console.log(`  OK: ${folders.length} folders + ${items.length} items -> ${outDir}`);
  } catch (err) {
    console.error('Error packing:', err.message);
    process.exit(1);
  }
})();
