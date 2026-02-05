# 🎒 Guide des types d'objets (Items)

## Vue d'ensemble

Le Système Mercenaire supporte **5 types d'objets** différents permettant d'équiper et de personnaliser les personnages.

| Type | Icône | Usage | Équipable |
|------|-------|-------|-----------|
| **Weapon** | ⚔️ | Armes de combat | Oui |
| **Armor** | 🛡️ | Armures protectrices | Oui |
| **Equipment** | 🎒 | Équipement général | Oui |
| **Ammo** | 💥 | Munitions | Non |
| **Feature** | ⭐ | Traits/capacités spéciales | Non |

---

## ⚔️ Weapon (Armes)

### Description
Les armes sont les outils de combat des mercenaires. Chaque arme a des caractéristiques qui affectent le combat.

### Champs disponibles

```javascript
weapon: {
  name: string,           // Nom (ex: "Épée Courte")
  type: "weapon",         // Type d'item
  img: string,            // Image/icône
  system: {
    // Statistiques de l'arme
    force_bonus: number,    // Bonus à la Force pour dégâts
    degree_bonus: number,   // Bonus au Degré (accuracy)
    skill_type: string,     // Compétence associée (ex: "melee")
    weight: number,         // Poids en kg
    reach: number,          // Portée (0=contact, 1-5=distance)
    rof: number,            // Cadence de tir (pour armes à feu)
    ammo_type: string,      // Type de munition requise
    damage_formula: string, // Formule de dégâts personnalisée
    cost: number,           // Coût en unité monétaire
    quality: string,        // Qualité (standard, fine, excellente)
    description: string     // Notes/description détaillée
  }
}
```

### Feuille personnalisée
**Localisation :** [templates/item/weapon-sheet.hbs](templates/item/weapon-sheet.hbs)

Affiche tous les champs avec interface de saisie dédiée.

### Exemple : Épée courte
```json
{
  "name": "Épée Courte",
  "type": "weapon",
  "img": "modules/merc/icons/sword.png",
  "system": {
    "force_bonus": 1,
    "degree_bonus": 0,
    "skill_type": "melee",
    "weight": 1.2,
    "reach": 1,
    "damage_formula": "1d6+1",
    "quality": "standard"
  }
}
```

---

## 🛡️ Armor (Armures)

### Description
Les armures protègent les mercenaires en réduisant les dégâts reçus. Elles affectent aussi les mouvements.

### Champs disponibles

```javascript
armor: {
  name: string,           // Nom (ex: "Gilet pare-balles")
  type: "armor",          // Type d'item
  img: string,            // Image
  system: {
    // Protection
    protection: number,     // Valeur de réduction dégâts
    coverage: string,       // Zone couverte (head, torso, limbs, full)
    
    // Impact physique
    weight: number,         // Poids (affecte encombrement)
    encumbrance: number,    // Pénalité à la discrétion/dissimulation
    speed_penalty: number,  // Pénalité aux mouvements
    
    // Qualité
    quality: string,        // standard, reinforced, advanced
    material: string,       // Matériau (leather, kevlar, ceramic, etc)
    cost: number,           // Coût
    
    // Notes
    description: string     // Description détaillée
  }
}
```

### Zones de couverture
- `head` - Casque/heaume
- `torso` - Torse/poitrine
- `limbs` - Membres (bras/jambes)
- `full` - Protection intégrale

### Exemple : Gilet pare-balles
```json
{
  "name": "Gilet Pare-Balles Kevlar",
  "type": "armor",
  "system": {
    "protection": 3,
    "coverage": "torso",
    "weight": 2.5,
    "encumbrance": 1,
    "speed_penalty": 0,
    "material": "kevlar",
    "quality": "advanced"
  }
}
```

---

## 🎒 Equipment (Équipement)

### Description
Équipement général : outils, vêtements, sacs, appareils électroniques, etc. Tout ce qui n'est pas une arme ou armure.

### Champs disponibles

```javascript
equipment: {
  name: string,           // Nom (ex: "Grappin électrique")
  type: "equipment",      // Type d'item
  img: string,            // Image
  system: {
    // Propriétés
    weight: number,         // Poids en kg
    quantity: number,       // Nombre (pour articles consommables)
    cost: number,           // Prix unitaire
    
    // Utilité
    category: string,       // Catégorie (tools, electronics, gear, etc)
    purpose: string,        // Utilité (ex: "escalade", "piratage", "santé")
    bonus_skill: string,    // Compétence boostée (ex: "lockpicking")
    bonus_value: number,    // Bonus en degré si applicable
    
    // Consommable?
    consumable: boolean,    // Oui/non
    uses: number,           // Nombre d'utilisations (si consumable)
    uses_max: number,       // Utilisations maximales
    
    // Notes
    description: string     // Description complète
  }
}
```

### Catégories courantes
- `tools` - Outils (pied-de-biche, lockpick, trousse de survie)
- `electronics` - Électronique (jammer, scanner, drone)
- `gear` - Équipement général (corde, lampe, VTT)
- `medical` - Équipement médical (trousse, stim, antidote)
- `special` - Équipement spécial (jetpack, téléporteur)

### Exemple : Trousse de crochetage
```json
{
  "name": "Trousse de Crochetage Professionnelle",
  "type": "equipment",
  "system": {
    "weight": 0.5,
    "quantity": 1,
    "category": "tools",
    "purpose": "crochetage",
    "bonus_skill": "lockpicking",
    "bonus_value": 2,
    "consumable": false,
    "description": "Outils professionnels pour crochetage"
  }
}
```

---

## 💥 Ammo (Munitions)

### Description
Munitions pour les armes à feu. Généralement consommables et empilables.

### Champs disponibles

```javascript
ammo: {
  name: string,           // Nom (ex: "Balles 9mm")
  type: "ammo",           // Type d'item
  img: string,            // Image
  system: {
    // Type
    ammo_type: string,      // Type (9mm, .45, .308, 12ga, etc)
    weapon_type: string,    // Armes compatibles (pistol, rifle, shotgun)
    
    // Quantité
    quantity: number,       // Nombre de balles
    quantity_max: number,   // Max par unité d'ammo
    
    // Effets
    damage_bonus: number,   // Dégâts additionnels
    armor_penetration: number, // Pénétration d'armure (0-10)
    special_effect: string, // Effet spécial (explosive, incendiary, etc)
    
    // Coût
    cost: number,           // Prix par round (ex: 100 balles = 50)
    cost_per_round: number, // Coût unitaire
    
    // Notes
    description: string     // Description
  }
}
```

### Types de munitions courants
- `9mm` - Munition standard pour pistolets
- `.45` - Munition puissante pour pistolets
- `.308` - Munition de fusil
- `12ga` - Munition de fusil à pompe
- `5.56` - Munition de fusil d'assaut

### Effets spéciaux
- `explosive` - Dégâts AoE
- `incendiary` - Feu
- `armor_piercing` - Ignore armure
- `hollow_point` - Dégâts augmentés
- `tracer` - Luminescent (utile pour repérage)

### Exemple : Balles 9mm standard
```json
{
  "name": "Munitions 9mm (100 rounds)",
  "type": "ammo",
  "system": {
    "ammo_type": "9mm",
    "weapon_type": "pistol",
    "quantity": 100,
    "damage_bonus": 0,
    "armor_penetration": 2,
    "special_effect": "none",
    "cost": 50
  }
}
```

---

## ⭐ Feature (Traits/Capacités)

### Description
Traits spéciaux, capacités surhumaines, mutations, augmentations cybernétiques, ou pouvoirs. Non équipables mais affectent le personnage.

### Champs disponibles

```javascript
feature: {
  name: string,           // Nom (ex: "Vision Nocturne Cybernétique")
  type: "feature",        // Type d'item
  img: string,            // Image
  system: {
    // Classification
    feature_type: string,   // Type (mutation, cybernetic, power, trait)
    category: string,       // Catégorie (vision, combat, mental, etc)
    
    // Effets
    skill_bonus: string,    // Compétence bonifiée (ex: "stealth")
    bonus_value: number,    // Valeur du bonus
    attribute_bonus: string, // Attribut bonifié (ex: "strength")
    attribute_bonus_value: number,
    
    // Limitations
    cost: number,           // Coût (pour l'installation)
    maintenance: number,    // Coût de maintenance annuel
    activation_cost: number, // Coût d'activation par utilisation
    
    // Mécanique
    passive: boolean,       // Toujours actif?
    recharge: number,       // Recharge (en heures, -1 = jamais)
    uses: number,           // Utilisations actuelles
    uses_max: number,       // Max utilisations
    
    // Notes
    description: string,    // Description complète
    limitations: string     // Limites/restrictions
  }
}
```

### Types de features
- `mutation` - Mutation génétique
- `cybernetic` - Augmentation cybernétique
- `power` - Super-pouvoir/magie
- `trait` - Trait naturel/apprenti (talent)

### Catégories
- `vision` - Vision améliorée (infrarouge, UV, etc)
- `combat` - Bonus au combat
- `mental` - Pouvoir mental (télépathie, telekinesis)
- `physical` - Amélioration physique (force, vitesse)
- `survival` - Survie/adaptation
- `special` - Autres

### Exemple : Implant de vision infrarouge
```json
{
  "name": "Implant Vision Infrarouge",
  "type": "feature",
  "system": {
    "feature_type": "cybernetic",
    "category": "vision",
    "skill_bonus": "stealth",
    "bonus_value": 2,
    "passive": true,
    "cost": 5000,
    "maintenance": 500,
    "description": "Implant oculaire permettant vision dans l'infrarouge",
    "limitations": "Interfère avec les dégâts de lumière vive"
  }
}
```

### Exemple : Talent de guerrier
```json
{
  "name": "Maître du Combat",
  "type": "feature",
  "system": {
    "feature_type": "trait",
    "category": "combat",
    "skill_bonus": "melee",
    "bonus_value": 3,
    "passive": true,
    "description": "Entraînement martial avancé",
    "cost": 0
  }
}
```

---

## 📋 Gestion des items

### Ajouter un item à un personnage

1. Ouvrir la feuille du personnage
2. Onglet "Équipements"
3. Cliquer "Ajouter un item"
4. Sélectionner le type (Weapon, Armor, Equipment, Ammo, Feature)
5. Remplir les champs
6. Sauvegarder

### Équiper un item

Certains types (Weapon, Armor, Equipment) peuvent être **équipés**:
- Cliquer l'icône d'équipement sur l'item
- L'item passe en gras/surligné (actif)
- Les bonus s'appliquent au personnage

### Supprimer un item

- Cliquer le bouton "Supprimer" sur l'item
- Confirmation requise

---

## 🔧 Champs personnalisables

Chaque type d'item peut avoir des **champs supplémentaires** définis dans [template.json](template.json).

### Ajouter un nouveau champ

Modifier `template.json`:
```json
{
  "Item": {
    "weapon": {
      "templates": ["base"],
      "custom_field": ""
    }
  }
}
```

---

## 💾 Données stockées en base

Les items sont stockés dans la propriété `items` de chaque acteur:

```javascript
actor.items
  ├─ Item(type: "weapon", name: "Épée")
  ├─ Item(type: "armor", name: "Gilet")
  ├─ Item(type: "equipment", name: "Grappin")
  ├─ Item(type: "ammo", name: "Balles 9mm")
  └─ Item(type: "feature", name: "Vision IR")
```

---

## 📖 Exemples complets

### Équipement complet d'un mercenaire

```json
{
  "items": [
    {
      "name": "Fusil d'Assaut M4",
      "type": "weapon",
      "system": {
        "skill_type": "powder_projectiles",
        "damage_formula": "2d6+2",
        "weight": 3.5,
        "rof": 3,
        "ammo_type": "5.56"
      }
    },
    {
      "name": "Gilet Pare-Balles",
      "type": "armor",
      "system": {
        "protection": 3,
        "coverage": "torso",
        "weight": 2.5
      }
    },
    {
      "name": "Munitions 5.56 (200)",
      "type": "ammo",
      "system": {
        "quantity": 200,
        "ammo_type": "5.56"
      }
    },
    {
      "name": "Vision Nocturne",
      "type": "feature",
      "system": {
        "feature_type": "cybernetic",
        "bonus_skill": "stealth",
        "bonus_value": 2
      }
    }
  ]
}
```

---

**Dernière mise à jour :** 2026-02-05  
**Version du système :** 1.0.6  
**Statut :** Documenté complètement
