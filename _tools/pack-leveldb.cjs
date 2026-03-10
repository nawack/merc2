'use strict';
/**
 * pack-leveldb.cjs
 * Writes an array of Foundry Item documents into a LevelDB compendium pack.
 * Usage: node pack-leveldb.cjs <items.json> <out-dir>
 */
const { ClassicLevel } = require('classic-level');
const fs  = require('fs');
const path = require('path');

const [,, srcJson, outDir] = process.argv;
if (!srcJson || !outDir) {
  console.error('Usage: node pack-leveldb.cjs <items.json> <outDir>');
  process.exit(1);
}

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

    // Foundry v13 key formats:  !folders!<_id>  and  !items!<_id>
    for (const folder of folders) {
      batch.put(`!folders!${folder._id}`, JSON.stringify(folder));
    }
    for (const item of items) {
      batch.put(`!items!${item._id}`, JSON.stringify(item));
    }

    await batch.write();
    await db.close();
    console.log(`  OK: ${folders.length} folders + ${items.length} items -> ${outDir}`);
  } catch (err) {
    console.error('Error packing:', err.message);
    process.exit(1);
  }
})();
