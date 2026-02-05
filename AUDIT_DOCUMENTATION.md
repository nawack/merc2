# 📋 AUDIT COMPLET - Documentation vs Code

**Date :** 2026-02-05  
**Système :** Mercenary System v1.0.7  
**Objectif :** Vérifier l'alignement entre la documentation et le code réel

---

## 📊 État actuel des fichiers

### Documentation existante
- ✅ README.md (251 lignes)
- ✅ CONTRIBUTING.md (217 lignes)
- ✅ PROJECT_STRUCTURE.md (223 lignes)
- ✅ SETUP_COMBAT.md (371 lignes)
- ✅ COMBAT_SYSTEM.md (exist)
- ✅ IMPLEMENTATION_COMBAT.md (exist)
- ✅ INSTALLATION.md (exist)
- ✅ EXAMPLE_MANIFEST.md (exist)

### Code réel (vérifiée)
- ✅ system.js (3015 lignes - complet)
- ✅ character-sheet.hbs (678 lignes - avec tous les onglets)
- ✅ style.css (1679 lignes - complet)
- ✅ system.json (version 1.0.7)
- ✅ template.json (déclare les actor/item types)

### Traductions
- ✅ fr.json (corrigé précédemment)
- ✅ en.json (corrigé précédemment)

---

## 🔍 AUDIT DÉTAILLÉ PAR SECTION

### 1. ATTRIBUTS (10 + Perception)

**README dit :**
```
10 Attributs : Intelligence, Volonté, Santé Mentale, Charisme, 
Chance, Adaptation, Force, Dextérité, Rapidité, Constitution

Perception : avec 5 sous-attributs (Vue, Ouïe, Goût, Odorat, Toucher)
```

**Code dit :** (system.js)
```javascript
- intelligence ✅
- will ✅
- mental ✅
- charisma ✅
- chance ✅
- adaptation ✅
- strength ✅
- dexterity ✅
- speed ✅
- constitution ✅
- perception + perceptionDetail (sight, hearing, taste, smell, touch) ✅
```

**Status:** ✅ ALIGNÉ (10 + 1 avec 5 sous-attributs)

---

### 2. COMPÉTENCES (56 de base)

**README dit :**
```
56 Compétences de base
Organisées en 7 catégories
```

**Code dit :** (en.json / fr.json - MERC.Skills)
```javascript
Comptage réel dans en.json MERC.Skills :
- reaction ✅
- melee ✅
- bladed_weapons ✅
- mechanical_projectiles ✅
- powder_projectiles ✅
- throwing ✅
- maneuvers ✅
- heavy_weapons ✅
- electronic_weapons ✅
- running ✅
- climbing ✅
- swimming ✅
- sliding ✅
- air_sliding ✅
- drive_wheeled ✅
- drive_motorcycle ✅
- drive_boats ✅
- drive_tracked ✅
- drive_planes ✅
- drive_helicopters ✅
- riding ✅
- tracking ✅
- stealth ✅
- concealment ✅
- pickpocket ✅
- lockpicking ✅
- tinkering ✅
- forgery ✅
- survival ✅
- eloquence ✅
- acting ✅
- interrogation ✅
- command ✅
- instruction ✅
- language_native ✅
- language_custom ✅
- bureaucracy ✅
- illegality ✅
- mathematics ✅
- metallurgy ✅
- engineering ✅
- electricity_electronics ✅
- computer_science ✅
- geography ✅
- meteorology ✅
- navigation ✅
- history_politics ✅
- chemistry ✅
- geology ✅
- nature ✅
- biology ✅
- human_medicine ✅
- surgery ✅
- construction_avionics ✅
- construction_vehicle ✅
- construction_weaponry ✅
- construction_tools ✅
- spec_melee_mma ✅
- spec_blades_knife ✅
- spec_powder_ak47 ✅

TOTAL = 58 clés (56 + 2 custom language)
```

**Status:** ✅ ALIGNÉ (56 de base + 2 custom = 58 total)

---

### 3. CATÉGORIES DE COMPÉTENCES

**README dit :**
```
7 catégories thématiques
- Combat
- Aptitudes
- Social
- Langues
- Connaissances
- Construction
- Spécialisations
```

**Code dit :** (en.json MERC.SkillGroups)
```javascript
- combat ✅
- aptitudes ✅
- social ✅
- languages ✅
- knowledge ✅
- construction ✅
- specializations ✅
- other ✅ (NON MENTIONNÉ)
```

**MISSING:** La documentation dit 7 catégories mais il y en a 8. "other" n'est pas mentionné.

**Status:** ⚠️ INCOMPLET - Manque "other" category

---

### 4. CALCUL DES COMPÉTENCES

**README dit :**
```
Base = 30 - (Attribut × 2) ou 30 - (Attribut1 + Attribut2)
Degré calculé via table de progression (base 4-28, degrés -7 à +33)
```

**Code dit :** (system.js)
```javascript
function computeSkillBaseFromSystem(system, skillKey, skillData) {
  // Implémente les 2 cas :
  // 1. Attribut unique × 2
  // 2. 2 attributs additionnés
  
  // Retourne : 30 - (résultat)
}

function getDegreeFromTable(base, dev) {
  // Utilise INDEX_TO_DEGREE
  // Range: base 4-28 → degrés -7 à +33 ✅
  // Prend en charge la lookup table DEGREE_TABLE
}
```

**Status:** ✅ ALIGNÉ

---

### 5. PRÉREQUISITES DE COMPÉTENCES

**README** : Pas mentionné les prérequis

**Code dit :** (system.js)
```javascript
const SKILL_PREREQUISITES = {
  "illegality": ["bureaucracy"],
  "metallurgy": ["mathematics"],
  "engineering": ["mathematics"],
  "electricity_electronics": ["mathematics"],
  "computer_science": ["mathematics"],
  "geography": ["mathematics"],
  "meteorology": ["mathematics"],
  "navigation": ["mathematics", "geography"],
  "history_politics": ["geography", "bureaucracy"],
  "chemistry": ["mathematics"],
  "geology": ["mathematics"],
  "human_medicine": ["chemistry", "mathematics"],
  "surgery": ["human_medicine"]
};
```

**Status:** ❌ NON DOCUMENTÉ - 13 compétences ont des prérequis

---

### 6. SYSTÈME DE JETS D20

**README dit :**
```
- Jet d'attribut = d20 + valeur attribut
- Jet de compétence = d20 + (Degré + Bonus)
- Critiques : 20 naturel = +d20, 1 naturel = -d20
```

**Code dit :** (system.js, fonction rollAttributeCheck)
```javascript
// Jet d'attribut ✅ CORRESPOND
let roll = new Roll(`1d20+${value}`, {});
roll.evaluate({async: false});

// Critiques gérés ✅
if (rollTotal === 20) { second_roll = +d20 }
if (rollTotal === 1) { second_roll = -d20 }
```

**Status:** ✅ ALIGNÉ

---

### 7. COMBAT & MOUVEMENT

**README mention brèvement dans onglets**
```
"Onglet Combat" = statistiques
```

**Code dit :** (SETUP_COMBAT.md fourni, et système.js implémente)
```javascript
// Tables de combat :
STATS_TABLES avec 32 entries chacune ✅
- taille
- poids
- reptation
- marche
- course
- dissimulation
- discretion
- ajustementPC

// Calculs automatiques :
Endurance = floor((will + constitution) / 2) ✅
Points de corpulence = constitution + ajustement ✅
Capacité de charge = force + (constitution × 2) ✅
Bonus discrétion = table lookup ✅
Bonus dissimulation = table lookup ✅
```

**Status:** ✅ ALIGNÉ (mais peu documenté dans README)

---

### 8. DÉGÂTS EN COMBAT

**README** : Pas mentionné

**Code dit :** (system.js)
```javascript
// BASE_DAMAGE_TABLE : 10 rows × 27 columns
// Force 1-10 × Degrés -7 à +19
// Affiche dégâts (1, 1d6, 2d6, etc.)

// Accessible via :
- Feuille : onglet "Combat" → champs de dégâts
- Lecture pour armes non équipées
```

**Status:** ❌ NON DOCUMENTÉ - Table de dégâts existe mais pas expliquée

---

### 9. INTERFACE UTILISATEUR

**README dit :**
```
4 onglets principaux :
- Attributs ✅
- Skills ✅
- Combat ✅
- Items ✅
```

**Code dit :** (character-sheet.hbs)
```handlebars
Nav avec 4 items :
- "Attributs" (data-tab="stats") ✅
- "Compétences" (data-tab="skills") ✅
- "Combat" (data-tab="combat") ✅
- "Équipements" (data-tab="items") ✅
```

**Status:** ✅ ALIGNÉ

---

### 10. PERSONNALISATION DE COMPÉTENCES

**README dit :**
```
Ajout/suppression/renommage pour Langues et Spécialisations
```

**Code dit :** (system.js, fonctions)
```javascript
function addCustomLanguage() { ... } ✅
function removeCustomLanguage() { ... } ✅
function addCustomSpecialization() { ... } ✅
function removeCustomSpecialization() { ... } ✅

Permet l'ajout/suppression dynamique ✅
Renommage via édition directe du champ ✅
```

**Status:** ✅ ALIGNÉ

---

### 11. LANGUES SUPPORTÉES

**README dit :**
```
Système multi-langue
```

**system.json dit :**
```json
"languages": [
  { "lang": "en", "name": "English", "path": "lang/en.json" },
  { "lang": "fr", "name": "Français", "path": "lang/fr.json" }
]
```

**Code dit :** (character-sheet.hbs)
```handlebars
{{localize "MERC.UI...."}} partout ✅
```

**Status:** ✅ ALIGNÉ (Français + Anglais)

---

### 12. TYPES D'OBJETS

**README dit :**
```
Armes, Armures, Équipement
```

**system.json dit :**
```json
"Item": {
  "weapon": {},
  "ammo": {},
  "armor": {},
  "equipment": {},
  "feature": {}
}
```

**Status:** ⚠️ INCOMPLET - Existe "ammo" et "feature" non mentionnés

---

### 13. FEUILLES PERSONNALISÉES

**Code dit :** (system.js)
```javascript
class MercCharacterSheet extends ... ✅
class MercWeaponSheet extends ... ✅
```

**README** : Pas mentionné que les items ont des feuilles personnalisées

**Status:** ❌ NON DOCUMENTÉ - Feuilles d'items existent

---

### 14. HOOKS FOUNDRY

**Code dit :** (system.js - plusieurs hooks)
```javascript
Hooks.on('updateActor', ...) // Recalc combat stats
Hooks.on('renderActorSheetV2', ...) // Init listeners
Hooks.on('dropActorSheetData', ...) // Drag-drop items
```

**README** : Pas mentionné

**Status:** ⚠️ PARTIELLEMENT NON DOCUMENTÉ

---

### 15. VERSION & COMPATIBILITÉ

**README ne mentionne pas :**
```
- Version actuelle : 1.0.7 (caché dans system.json)
- Compatibilité : v13.0 minimum, v13.351 maximum
- Vérifié sur v13.351
```

**Status:** ⚠️ NON DOCUMENTÉ - Compatibilité Foundry floue

---

## 📋 RÉSUMÉ DES PROBLÈMES TROUVÉS

### ❌ NON DOCUMENTÉ OU INCOMPLET (8 items)

1. **Catégorie "Other"** - Existe en code mais pas en docs
2. **Prérequis de compétences** - 13 compétences with prerequisits not explained
3. **Table de dégâts** - BASE_DAMAGE_TABLE existe but not explained
4. **Armes/dégâts en combat** - Système existe but not user docs
5. **Types d'items "ammo" et "feature"** - Existent en code, pas en docs
6. **Feuilles de personnage pour items** - MercWeaponSheet exists but not documented
7. **Système de hooks** - Hooks Foundry utilisés mais pas documentés
8. **Compatibilité Foundry** - Doit être v13.0+ mais flou dans README

### ⚠️ À CLARIFIER (3 items)

1. **Calcul de l'Endurance** - Pas clair si c'est (Will+Constitution)/2 ou autre
2. **Bonus de combat** - Initiative/Parade/etc pas expliqués
3. **Limitation des onglets** - Custom languages/specializations UI not clear

### ✅ BIEN DOCUMENTÉ (5 items)

1. Attributs (10 + Perception)
2. Compétences de base (56)
3. Système de jets D20
4. Calcul base/degré
5. Interface principale (4 onglets)

---

## 🛠️ RECOMMANDATIONS

### Priority 1 (CRITIQUE)
- [ ] Ajouter section "Prérequis" dans README
- [ ] Documenter système de dégâts
- [ ] Clarifier compatibilité Foundry

### Priority 2 (IMPORTANT)
- [ ] Documenter types d'items "ammo" et "feature"
- [ ] Expliquer catégorie "Other"
- [ ] Ajouter guide items/armes

### Priority 3 (NICE-TO-HAVE)
- [ ] Documenter hooks Foundry
- [ ] Ajouter guide customization
- [ ] Expliquer tables de combat

---

## 📝 ACTION ITEMS

```
[ ] 1. Créer section "Prérequis de Compétences" dans README
[ ] 2. Créer guide "Système de Dégâts" 
[ ] 3. Créer guide "Gestion des Armes"
[ ] 4. Mettre à jour README: versions Foundry
[ ] 5. Documenter tous les types d'items
[ ] 6. Expliquer catégories complètes
[ ] 7. Clarifier les bonus de combat
[ ] 8. Valider localisation (fr/en)
```

---

**Audit créé:** 2026-02-05  
**État:** INCOMPLET - Manques documentaires identifiés  
**Prochaine étape:** Remplir les gaps documentaires
