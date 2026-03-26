# Guide des types d'objets (Items) et Acteurs

## Vue d'ensemble

### Items

| Type | Usage | Équipable |
|------|-------|-----------|
| **Weapon** | Armes de combat | Oui |
| **Armor** | Armures protectrices | Oui |
| **Equipment** | Équipement général | Oui |
| **Ammo** | Munitions | Non (lié aux armes) |
| **Feature** | Traits/capacités spéciales | Non |

### Acteurs

| Type | Description |
|------|-------------|
| **Character** | Fiche personnage joueur |
| **NPC** | Hérité de Character |
| **Vehicle** | Véhicule avec armes et équipage |

---

## Weapon (Armes)

Les armes supportent deux sous-systèmes selon leur type :
- **Corps-à-corps / projectiles mécaniques** : dégâts via table `BASE_DAMAGE_TABLE` (Force × Degré)
- **Armes à feu** : dégâts calculés en temps réel par le moteur balistique physique

### Schéma (`system`)

```json
{
  "damage": "",                // Formule de dégâts manuelle (si non balistique)
  "rarity": "common",          // Rareté : common | uncommon | rare | epic
  "price": 0,
  "weightKg": 0,
  "weaponSubtype": "",         // Sous-type (pistol, rifle, smg, shotgun, melee…)
  "weaponSkill": "",           // Clé de compétence (powder_projectiles, melee…)
  "proficiency": 0,            // Maîtrise (+3 au jet de compétence si > 0)
  "barrelLength": 0,           // Longueur de canon (mm) — pour la balistique
  "range": {
    "short": 0,                // Portée courte (m)
    "medium": 0,
    "long": 0,
    "extreme": 0
  },
  "caliber": "",               // Calibre requis (ex: "9x19mm")
  "recoil": {
    "singleShot": "",          // Malus recul coup par coup
    "burst": ""                // Malus recul rafale
  },
  "magazine": 0,               // Capacité chargeur standard (référence)
  "rofMode": "",               // Mode de tir (single, burst, auto)
  "rofLimited": 0,             // Cadence limitée (nb coups maxi / round)
  "defaultAmmoName": "",       // Nom de la munition par défaut
  "defaultAmmoId": "",         // ID de la munition par défaut
  "defaultAmmoMagCapacity": 0, // Capacité chargeur (munition par défaut)
  "defaultAmmoInMag": 0,       // Balles dans le chargeur en cours
  "defaultAmmoMagFull": 0,     // Chargeurs pleins en stock
  "defaultAmmoMagTotal": 0,    // Total chargeurs
  "defaultAmmoStock": 0        // Balles en vrac
}
```

### Feuille personnalisée
`templates/item/weapon-sheet.hbs` — Onglets : **Général / Tactique / Balistique / Munitions**

### Balistique (armes à feu)

La fiche arme affiche les valeurs calculées (en lecture seule) à partir des propriétés physiques de la munition liée :
- Vitesse initiale (m/s), Énergie (J)
- Dégâts par portée (C/M/L/X)
- Malus de pénétration blindage par portée

> Voir [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md) pour le détail du moteur balistique.

---

## Armor (Armures)

### Schéma (`system`)

```json
{
  "rarity": "common",     // common | uncommon | rare | epic
  "price": 0,             // Prix
  "weightKg": 0,          // Poids en kg
  "description": "",      // Description libre
  "locations": {
    // Points de blindage par zone corporelle (20 zones)
    "crane": 0,           // 20 — Crâne
    "visage": 0,          // 19 — Visage
    "cou": 0,             // 18 — Cou
    "poitrine_gch": 0,    // 16 — Poitrine GCH
    "poitrine_dr": 0,     // 17 — Poitrine DR
    "abdomen_gch": 0,     // 14 — Abdomen GCH
    "abdomen_dr": 0,      // 15 — Abdomen DR
    "bas_ventre": 0,      // 13 — Bas-ventre
    "bras_gch": 0,        // 11 — Bras GCH
    "bras_dr": 0,         // 12 — Bras DR
    "av_bras_gch": 0,     //  7 — Avant-bras GCH
    "av_bras_dr": 0,      //  8 — Avant-bras DR
    "main_gch": 0,        //  3 — Main GCH
    "main_dr": 0,         //  4 — Main DR
    "cuisse_gch": 0,      //  9 — Cuisse GCH
    "cuisse_dr": 0,       // 10 — Cuisse DR
    "jambe_gch": 0,       //  5 — Jambe GCH
    "jambe_dr": 0,        //  6 — Jambe DR
    "pied_gch": 0,        //  1 — Pied GCH
    "pied_dr": 0          //  2 — Pied DR
  }
}
```

### Feuille personnalisée
`templates/item/armor-sheet.hbs` — Sections : **Champs généraux** (Rareté / Prix / Poids / Description) + **Schéma de corps SVG** (20 zones interactives, inputs GCH à gauche, DR à droite)

> Le numéro de chaque zone est affiché à la fois dans le SVG et dans le label de l'input.

---

## Equipment (Équipement)

### Schéma (`system`)

```json
{
  "rarity": "common",   // common | uncommon | rare | epic
  "price": 0,           // Prix
  "weightKg": 0,        // Poids en kg
  "description": ""     // Description libre
}
```

### Feuille personnalisée
`templates/item/equipment-sheet.hbs`

---

## Ammo (Munitions)

Les munitions stockent leurs propriétés **physiques balistiques** ainsi que leur **stock**. Les dégâts ne sont jamais stockés — ils sont calculés en temps réel par le moteur balistique.

### Schéma (`system`)

```json
{
  // Identification
  "ammoType": "",             // Type fonctionnel (ball, hp, ap, tracer…)
  "caliber": "",              // Calibre (ex: "9x19mm")
  "parentWeaponId": "",       // ID de l'arme propriétaire (si lié)

  // Stock
  "magCapacity": 0,           // Capacité d'un chargeur
  "inMag": 0,                 // Balles dans le chargeur en cours
  "magFull": 0,               // Nombre de chargeurs pleins
  "magTotal": 0,              // Total de chargeurs (pleins + partiels)
  "stock": 0,                 // Balles en vrac (hors chargeurs)

  // Propriétés physiques (pour le moteur balistique)
  "mass": 0,                  // Masse de la balle (g)
  "diameter": 0,              // Diamètre (mm)
  "coeff_trainee": 0,         // Coefficient de traînée balistique (Cd)
  "rho": 1.225,               // Densité de l'air (kg/m³) — 1.225 par défaut
  "perforation_index": 1,     // Indice de perforation (blindage)
  "barrel_length_std": 0,     // Longueur de canon de référence (mm)
  "velocity": 0,              // Vitesse initiale au canon de référence (m/s)
  "weight": 0,                // Masse totale de la cartouche (g)

  // Valeurs déduites (calculées, stockées en cache)
  "braking_index": 0,         // Indice de freinage — calculé par calcAmmoDerived()
  "sectional_density": 0,     // Densité de section — calculée par calcAmmoDerived()

  // Logistique
  "price": 0,
  "rarity": "common",
  "description": ""
}
```

### Calcul des valeurs déduites

```javascript
calcAmmoDerived(mass, diameter, coeff_trainee, rho)
// → braking_index      = (coeff_trainee × rho × π × (diameter/2000)²) / (2 × mass/1000)
// → sectional_density  = (mass/1000) / (π × (diameter/2000)²)
```

Ces valeurs sont recalculées et affichées en lecture seule sur la fiche munition dès qu'une propriété physique change.

### Feuille personnalisée
`templates/item/ammo-sheet.hbs` — Sections : **Balistique** (grille 4 colonnes) + **Stock** (Rareté + Prix)

### Liaison arme ↔ munition

- Glisser-déposer une munition sur une arme dans la fiche personnage ou véhicule
- Le calibre de la munition doit correspondre à celui de l'arme (sinon rejet)
- Les munitions liées apparaissent dans l'onglet **Munitions** de la fiche arme et dans l'onglet **Combat** de la fiche personnage

---

## Feature (Traits/Capacités)

Traits spéciaux, augmentations cybernétiques, talents. Non équipables, mais modifient les capacités du personnage.

### Schéma (`system`)

```json
{
  "rarity": "common",   // common | uncommon | rare | epic
  "price": 0,           // Prix
  "weightKg": 0,        // Poids en kg
  "description": ""     // Description libre du trait
}
```

### Feuille personnalisée
`templates/item/feature-sheet.hbs`

---

## Acteur — Vehicle (Véhicule)

Les véhicules ont leur propre type d'acteur avec une fiche dédiée (`templates/actor/vehicle-sheet.hbs`). Ils supportent la gestion complète des armes et munitions (identique à la fiche personnage).

### Schéma (`system`)

```json
{
  "price": 0,
  "rarity": "common",
  "fireControlBonus": 0,   // Bonus contrôle de tir (modificateur aux jets arme)
  "fuelType": "diesel",    // diesel | petrol | electric | hybrid | nuclear | jet | biofuel
  "stabilization": "none", // none | basic | advanced | gyro
  "load": 0,               // Chargement utile (T)
  "ptac": 0,               // PTAC (T)
  "crew": "",              // Équipage (description libre)
  "maintenance": "",       // Maintenance (description libre)
  "nightVision": "headlights", // headlights | passive_nv | active_nv | thermal
  "nrbc": "open",          // open | filtered | sealed
  "trMov": 0,              // Vitesse transit (km/h)
  "comMov": 0,             // Vitesse combat (km/h)
  "fuelCap": 0,            // Réservoir (L)
  "fuelCons": 0,           // Consommation (L/100km)
  "notes": ""
}
```

### Fiche véhicule
- Image cliquable (FilePicker natif Foundry)
- Boutons +/− sur tous les champs numériques avec unités
- Zone de notes libre
- Section armes et munitions avec jets de dégâts au chat (format "arme (munition)")
- Drag & drop munitions sur les armes
- Suppression en cascade arme → munitions liées
- `fireControlBonus` utilisé comme modificateur aux jets de compétence arme

---

## Gestion des items dans la fiche personnage

### Ajouter un item
1. Onglet **Items** → bouton **+** dans la section correspondante, ou
2. Glisser-déposer depuis le panneau **Items** de Foundry

### Équiper / désactiver
Cliquer sur l'icône d'état dans la liste des items.

### Modifier / Supprimer
- Cliquer sur le nom de l'item pour ouvrir sa fiche
- Icône de corbeille pour supprimer

### Lier des munitions à une arme
Glisser-déposer une munition (ammo) sur une arme dans l'onglet **Combat**. Le calibre doit correspondre.
