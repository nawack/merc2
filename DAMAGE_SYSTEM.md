# ⚔️ Système de Dégâts en Combat

## Vue d'ensemble

Le système de dégâts du Mercenary System utilise une **table de référence** combinant la **Force** du personnage et son **Degré** de compétence de combat pour déterminer les dégâts infligés au combat rapproché.

**Formule :** Dégâts = `TABLE[Force][Degré]`

---

## 📊 Table de dégâts (BASE_DAMAGE_TABLE)

### Dimensions
- **Lignes (Force) :** 1 à 10
- **Colonnes (Degré) :** -7 à +19 (27 colonnes total)
- **Entrées :** Formules de dégâts (ex: "1d6", "2d6+1")

### Table complète

```
         Deg: -7   -6   -5   -4   -3   -2   -1    0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19
Force 1:  "1"  "1"  "1"  "1"  "1"  "1"  "2"  "2"  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1"
Force 2:  "1"  "1"  "1"  "1"  "1"  "2"  "2"  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1"
Force 3:  "1"  "1"  "1"  "1"  "2"  "2"  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1" "2d6+1"
Force 4:  "1"  "1"  "1"  "2"  "2"  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1" "2d6+1" "2d6+1"
Force 5:  "1"  "1"  "2"  "2"  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1" "2d6+1" "2d6+1" "2d6+2"
Force 6:  "1"  "2"  "2"  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1" "2d6+1" "2d6+1" "2d6+2" "2d6+2"
Force 7:  "2"  "2"  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1" "2d6+1" "2d6+1" "2d6+2" "2d6+2" "2d6+2"
Force 8:  "2"  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1" "2d6+1" "2d6+1" "2d6+2" "2d6+2" "2d6+2" "2d6+2"
Force 9:  "2"  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1" "2d6+1" "2d6+1" "2d6+2" "2d6+2" "2d6+2" "2d6+2" "3d6"
Force10:  "2" "1d6""1d6""1d6""1d6""1d6+1""1d6+1""1d6+1""1d6+1""1d6+2""1d6+2""1d6+2""1d6+2" "2d6" "2d6" "2d6" "2d6" "2d6+1" "2d6+1" "2d6+1" "2d6+1" "2d6+2" "2d6+2" "2d6+2" "2d6+2" "3d6" "3d6"
```

### Lecture de la table

**Exemple :** Personnage avec Force 5 et Degré +8

```
Force:  5 (index ligne = 5-1 = 4)
Degré: +8 (index colonne = 8+7 = 15)
Résultat: TABLE[4][15] = "1d6+2"
```

---

## 🔢 Formules de dégâts courantes

| Formule | Signification | Dégâts moyens |
|---------|---------------|--------------|
| "1" | 1 point fixe | 1 |
| "2" | 2 points fixes | 2 |
| "1d6" | 1 dé à 6 faces | 3.5 |
| "1d6+1" | 1d6 + 1 bonus | 4.5 |
| "1d6+2" | 1d6 + 2 bonus | 5.5 |
| "2d6" | 2 dés à 6 faces | 7 |
| "2d6+1" | 2d6 + 1 bonus | 8 |
| "2d6+2" | 2d6 + 2 bonus | 9 |
| "3d6" | 3 dés à 6 faces | 10.5 |

---

## 📈 Progression des dégâts

### Par Force (Degré fixe à +5)

| Force | Dégâts | Progression |
|-------|--------|------------|
| 1 | "1d6+1" | Base |
| 2 | "1d6+1" | Identique |
| 3 | "1d6+1" | Identique |
| 4 | "1d6+2" | +1 |
| 5 | "1d6+2" | Identique |
| 6 | "2d6" | +2 |
| 7 | "2d6+1" | +1 |
| 8 | "2d6+1" | Identique |
| 9 | "2d6+1" | Identique |
| 10 | "2d6+2" | +1 |

### Par Degré (Force fixe à 5)

| Degré | Dégâts | Progression |
|-------|--------|------------|
| -7 | "1" | Minimal |
| -5 | "2" | +1 |
| -3 | "2" | Identique |
| -1 | "1d6" | +2 |
| +1 | "1d6" | Identique |
| +5 | "2d6" | +2 |
| +10 | "2d6+2" | +1 |
| +15 | "2d6+2" | Identique |
| +19 | "2d6+2" | Max |

---

## 🎯 Calcul en code

### Fonction `getBaseDamageFromTable(force, degree)`

**Localisation :** [scripts/system.js](scripts/system.js) - ligne ~325

```javascript
function getBaseDamageFromTable(forceValue, degreeValue) {
  // Limiter Force entre 1-10
  const force = Math.min(10, Math.max(1, Number(forceValue) || 1));
  
  // Limiter Degré entre -7 et +19
  const degree = Math.min(19, Math.max(-7, Number(degreeValue) || -7));
  
  // Convertir en indices de tableau
  const rowIndex = force - 1;           // Force 1-10 → indice 0-9
  const colIndex = degree + 7;          // Degré -7 à +19 → indice 0-26
  
  // Retourner la valeur de la table
  return BASE_DAMAGE_TABLE[rowIndex]?.[colIndex] ?? "1";
}
```

---

## ⚙️ Intégration système

### Où sont utilisés les dégâts?

1. **Onglet Combat** - Affiche les dégâts en fonction de la Force et du Degré
2. **Fiches d'armes** - Calcul des dégâts bonus de l'arme
3. **Jet de combat** - Inclus dans les informations du résultat

### Affichage dans la feuille

Les dégâts de mêlée (`baseDamageMelee`, `baseDamageBladed`) sont pré-calculés dans `_prepareContext` à partir de la Force et du Degré de la compétence correspondante, puis exposés au template.

---

## 📖 Règles de combat associées

### Bonus de dégâts
- **Armes spécialisées :** Ajout bonus selon la spécialisation
- **Critiques :** Dégâts doublés sur 20 naturel (premier d20)
- **Échecs critiques :** Dégâts réduits de moitié sur 1 naturel

### Endurance et Ressistance
- **Endurance = (Volonté + Constitution) / 2**
- Les dégâts réduisent les Points de Vie (définis dans la biographie)

---

## 🛠️ Exemples pratiques

### Combat rapproché : Mêlée

```
Combattant: Mercenaire "Brick"
├─ Force: 8
├─ Compétence Mêlée: Degré +3
├─ Dégâts base: TABLE[7][10] = "1d6+2"
└─ Avec épée (+1): "1d6+3"
```

### Combat rapproché : Léger

```
Combattant: Assassin "Rook"
├─ Force: 4
├─ Compétence Poignard: Degré +8
├─ Dégâts base: TABLE[3][15] = "1d6+2"
└─ Avec dague spé (+2): "1d6+4"
```

### Progression personnage

```
Progression dans les dégâts:
├─ Degré -2 avec Force 5: "2" (fixe)
├─ Degré +2 avec Force 5: "1d6" (amélioration)
├─ Degré +5 avec Force 5: "2d6" (doublement)
└─ Degré +8 avec Force 5: "2d6+1" (max presque atteint)
```

---

## ⚠️ Limitations et clamps

| Paramètre | Minimum | Maximum | Notes |
|-----------|---------|---------|-------|
| Force | 1 | 10 | Valeurs automatiquement clampées |
| Degré | -7 | +19 | Dégâts maximaux à +19 |
| Résultat | "1" | "3d6" | Jamais inférieur à 1 point |

---

## Moteur balistique physique (armes à feu)

Depuis la v1.0.12, les dégâts des armes à feu sont calculés en temps réel par simulation physique. Aucune valeur de dégât n'est stockée sur l'arme ou la munition.

### Fonctions principales (`scripts/system.js`)

#### `calcAmmoDerived(mass, diameter, coeff_trainee, rho)`

Calcule les propriétés déduites de la munition :

```
S                 = π × (d/2000)²            // section droite (m²)
braking_index     = 0.5 × Cd × ρ × S
sectional_density = (m/1000) / S
```

Où : `m` = masse (g), `d` = diamètre (mm), `Cd` = coefficient de traînée, `ρ` = densité air (kg/m³)

> **Note :** `braking_index` ne contient pas la masse — la correction `/mass_kg` est appliquée dans `calcWeaponBallistics` lors du calcul de la décélération.

#### `calcWeaponBallistics(barrelLength, ammoSystem, ranges)`

Calcule les dégâts et la pénétration pour chaque portée :

```javascript
// Ajustement de la vitesse initiale selon la longueur de canon :
v0 = velocity × (barrelLength / barrelStd) ^ 0.25

// Énergie à la bouche (J) :
E0 = 0.5 × (mass/1000) × v0²

// Pour chaque portée x (short, medium, long, extreme) :
expFactor(x) = exp(-(2 × braking_index / mass_kg) × x)
pen(x)       = 0.0000001 × sectional_density × (2 × E0 / mass_kg) × perforation_index × expFactor(x)
```

Retourne :
```javascript
{
  hasData: boolean,
  initialVelocity: number,   // v0 arrondi à l'entier (m/s)
  energy: number,            // E0 arrondi à l'entier (J)
  damage: string,            // calcDamageFromEnergy(E0)
  pen: {
    muzzle:  number,         // pénétration à la bouche
    short:   number,
    medium:  number,
    long:    number,
    extreme: number
  },
  blindage: {
    short:   string,         // calcBlindageMalus(E0, pen.muzzle)
    medium:  string,         // calcBlindageMalus(E0, pen.medium)
    long:    string,
    extreme: string
  }
}
```

#### `calcDamageFromEnergy(energy)`

Convertit l'énergie cinétique (J) en formule de dégâts de jeu via la formule :

```
d6    = floor(sqrt(E) / 12)
bonus = floor(sqrt(E) / 4) % 3

Si d6 == 0 : résultat = String(bonus)     // nombre fixe
Si d6 > 0 et bonus == 0 : résultat = "${d6}D6"
Si d6 > 0 et bonus > 0  : résultat = "${d6}D6+${bonus}"
```

**Exemples :**

| Énergie (J) | sqrt(E) | d6 | bonus | Résultat |
|-------------|---------|-----|-------|----------|
| 100 | 10 | 0 | 2 | `"2"` |
| 500 | 22.4 | 1 | 2 | `"1D6+2"` |
| 1500 | 38.7 | 3 | 1 | `"3D6+1"` |
| 5000 | 70.7 | 5 | 2 | `"5D6+2"` |

#### `calcBlindageMalus(energy, pen)`

Calcule le malus de dégâts face à un blindage. Retourne `"-"` (aucune pénalité) quand `pen ≤ 7` (projectile trop peu pénétrant pour subir de résistance). Quand `pen > 7`, calcule une formule de dégâts réduite basée sur `sqrtE × (7/pen)` via la même logique que `calcDamageFromEnergy`.

### Affichage

- **Fiche arme** : Résultats balistiques en lecture seule dans l'onglet Balistique, et malus par portée dans l'onglet Munitions
- **Onglet Combat personnage** : `weaponBallisticsMap` par arme — affiche les dégâts + stock pour chaque munition par portée
- **Onglet Combat véhicule** : Même logique que le personnage

---

**Dernière mise à jour :** 2026-04-16
**Version du système :** 1.2.2
