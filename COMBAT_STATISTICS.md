# ⚔️ Statistiques de Combat

## Vue d'ensemble

Le système de combat du Mercenary System utilise une série de **statistiques calculées automatiquement** basées sur les attributs du personnage. Ces statistiques affectent la performance en combat direct.

**Onglet :** Combat dans la feuille de personnage

---

## 📊 Les 8 statistiques de combat

### 1️⃣ Taille (Corpulence)

**Formule :** Table lookup basée sur hauteur en cm

**Gamme :** 42 cm (min) à 569 cm (max)

**Impact :**
- Affecte la **capacité de charge** du personnage
- Affecte les bonus de **dissimulation**
- Affecte les bonus de **discrétion**

**Exemples de taille :**
```
Index 0:  42 cm  (enfant/gnome)
Index 8:  105 cm (petit humain)
Index 17: 177 cm (humain moyen)
Index 25: 301 cm (géant)
Index 31: 569 cm (très grand géant)
```

---

### 2️⃣ Poids (Corpulence)

**Formule :** Table lookup basée sur poids en kg

**Gamme :** 1 kg (min) à 2449 kg (max)

**Impact :**
- Combiné à la taille = **indice de corpulence**
- Affecte la **portance** et la **charge**
- Affecte l'**ajustement du PC** (Points de corpulence)

**Exemples de poids :**
```
Index 0:  1 kg     (très léger)
Index 9:  19 kg    (enfant)
Index 17: 74 kg    (adulte moyen)
Index 25: 363 kg   (très lourd)
Index 31: 2449 kg  (extrême)
```

---

### 3️⃣ Reptation

**Définition :** Déplacement en rampant (au sol, silencieux)

**Formule :** STATS_TABLE[reptation][indice_taille]

**Gamme :** 0.5 m/round à 6.5 m/round

**Contexte d'utilisation :**
- Approche discrète
- Combat dans environnement restreint
- Terrain difficile

---

### 4️⃣ Marche

**Définition :** Déplacement normal et prudent

**Formule :** STATS_TABLE[marche][indice_taille]

**Gamme :** 2 m/round à 25 m/round

**Contexte d'utilisation :**
- Déplacement tactique
- Investigation
- Conversation en mouvement

---

### 5️⃣ Course

**Définition :** Déplacement à pleine vitesse

**Formule :** STATS_TABLE[course][indice_taille]

**Gamme :** 10 m/round à 128 m/round

**Contexte d'utilisation :**
- Fuite ou poursuite
- Déploiement au combat
- Traversée rapide

---

### 6️⃣ Dissimulation

**Définition :** Bonus/pénalité pour se **cacher derrière objets**

**Formule :** STATS_TABLE[dissimulation][indice_corpulence]

**Gamme :** -15 (très facile à voir) à +16 (minuscule, très facile à cacher)

**Mécanique :**
- Bonus positif = difficile à voir
- Bonus négatif = facile à voir
- Affecte les jets de Dissimulation (compétence)

**Exemples :**
```
Corpulence très petite: +16  (difficile à voir)
Corpulence petite:      +10
Corpulence normale:      0   (neutre)
Corpulence large:       -5
Corpulence très grande: -15  (très facile à voir)
```

---

### 7️⃣ Discrétion

**Définition :** Bonus/pénalité pour se **déplacer silencieusement**

**Formule :** STATS_TABLE[discretion][indice_corpulence]

**Gamme :** -9 (très bruyant) à +10 (silencieux)

**Mécanique :**
- Bonus positif = déplacement silencieux
- Bonus négatif = bruit
- Affecte les jets de Discrétion (compétence)

**Exemples :**
```
Corpulence très petite: +10 (très silencieux)
Corpulence petite:      +7
Corpulence normale:      0  (neutre)
Corpulence large:       -3
Corpulence très grande: -9  (très bruyant)
```

---

### 8️⃣ Ajustement PC (Points de Corpulence)

**Définition :** Modification aux Points de Corpulence basée sur la taille

**Formule :** STATS_TABLE[ajustementPC][indice_corpulence]

**Gamme :** -3 (réduction) à +8 (augmentation)

**Mécanique :**
- Points de Corpulence = Constitution + Ajustement
- Représente la **capacité à portance/charge**
- Négatif = moins de charge possible
- Positif = plus de charge possible

---

## 🧮 Calcul de l'indice de corpulence

L'indice de corpulence est **dérivé** de la taille et du poids:

```javascript
1. Convertir Hauteur → Indice Taille (0-31)
2. Convertir Poids → Indice Poids (0-31)
3. Combiner les deux indices
4. Utiliser le résultat pour les tables STATS_TABLES
```

**Fonction :** `findTableIndex(value, table)`

Localisation: [scripts/system.js](scripts/system.js) - ligne ~6315

```javascript
const findTableIndex = (value, table) => {
  // Retourne le dernier indice où value > table[i] (borne inférieure)
  if (!value || value <= 0) return 0;
  for (let i = table.length - 1; i >= 0; i--) {
    if (value > table[i]) return i;
  }
  return 0;
};
```

---

## 📋 Tables de référence

### STATS_TABLES

**Localisation :** [scripts/system.js](scripts/system.js) - ligne ~52

```javascript
const STATS_TABLES = {
  taille: [42, 49, 57, ..., 569],           // 32 valeurs
  poids: [1, 1.6, 2.5, ..., 2449],         // 32 valeurs
  reptation: [0.5, 1, 1, ..., 6.5],        // 32 valeurs
  marche: [2, 2, 3, ..., 25],              // 32 valeurs
  course: [10, 11, 13, ..., 128],          // 32 valeurs
  dissimulation: [16, 15, 14, ..., -15],   // 32 valeurs
  discretion: [10, 9, 9, ..., -9],         // 32 valeurs
  ajustementPC: [-3, -3, -3, ..., 8]       // 32 valeurs
};
```

Chaque table contient **32 entrées**, correspondant aux indices 0-31.

---

## 🔄 Mise à jour automatique

### Quand sont recalculées les statistiques?

Les statistiques se **recalculent automatiquement** lors:
1. ✅ Modification de la hauteur
2. ✅ Modification du poids
3. ✅ Modification de la Volonté
4. ✅ Modification de la Constitution
5. ✅ Modification de la Force
6. ✅ Modification de la Vitesse (Rapidité)

### Hook utilisé

**Événement :** `Hooks.on('updateActor', ...)`

**Localisation :** [scripts/system.js](scripts/system.js) - ligne ~6693

```javascript
Hooks.on('updateActor', async (actor, changes, options, userId) => {
  const needsUpdate =
    changes.system?.biography?.height !== undefined ||
    changes.system?.biography?.weight !== undefined ||
    changes.system?.attributes?.will !== undefined ||
    changes.system?.attributes?.constitution !== undefined ||
    changes.system?.attributes?.strength !== undefined ||
    changes.system?.attributes?.speed !== undefined;
  // Si needsUpdate : recalcule endurance, PC, charge, discrétion, dissimulation, vitesses
});
```

---

## 🎯 Utilisation en combat

### Exemple: Combat rapproché

```
Combattant: Mercenaire "Brick" (Rapidité: 2)
├─ Hauteur: 185 cm → Index Taille: 17 (attrib +6)
├─ Poids: 95 kg → Index Poids: 18 (attrib +7)
├─ Corpulence: corpulence = ceil((6+7)/2) = 7
├─ Index vitesse: 7 + 2 - 5 + 11 = 15
├─ Statistiques:
│  ├─ Marche: 7 m/round (table[15])
│  ├─ Course: 34 m/round (table[15])
│  ├─ Dissimulation: -2 (corpulenceTableIdx=18)
│  ├─ Discrétion: -1 (corpulenceTableIdx=18)
│  └─ Ajustement PC: 0 (corpulenceTableIdx=18)
└─ Points de Corpulence: Constitution(6) + Ajustement(0) = 6
```

### Exemple: Agent infiltration

```
Agent: "Rook" (Rapidité: 1)
├─ Hauteur: 165 cm → Index Taille: 15 (attrib +4)
├─ Poids: 60 kg → Index Poids: 15 (attrib +4)
├─ Corpulence: corpulence = floor((4+4)/2) = 4
├─ Index vitesse: 4 + 1 - 5 + 11 = 11
├─ Statistiques:
│  ├─ Marche: 5 m/round (table[11])
│  ├─ Course: 27 m/round (table[11])
│  ├─ Dissimulation: +1 (corpulenceTableIdx=15)
│  ├─ Discrétion: 0 (corpulenceTableIdx=15)
│  └─ Ajustement PC: -1 (corpulenceTableIdx=15)
└─ Points de Corpulence: Constitution(4) + Ajustement(-1) = 3
```

---

## ⚙️ Formules de calcul détaillées

### Endurance

**Définition :** Capacité à résister à la fatigue et aux blessures

**Formule :** `⌊(Volonté + Constitution) / 2⌋`

**Exemple :**
```
Volonté: 6
Constitution: 5
Endurance: ⌊(6 + 5) / 2⌋ = ⌊5.5⌋ = 5
```

### Capacité de charge

**Définition :** Poids maximal transportable

**Formule :** `(Force + Constitution) × 2`

**Exemple :**
```
Force: 7
Constitution: 5
Capacité: (7 + 5) × 2 = 24 kg
```

### Initiative (automatisée)

**Compétence :** Réaction (Adaptation + Vitesse)

L'initiative est calculée automatiquement par le système via `getReactionDegreeFromCombatant`, qui lit le degré de la compétence **Réaction** du personnage (ajusté par les malus de blessures). Le résultat est affiché dans le traqueur de combat.

---

## 📖 Règles associées

### Encombrement

L'encombrement est calculé en temps réel et détermine le **niveau de charge** du personnage, qui réduit automatiquement les vitesses affichées :

| Niveau | Condition | Reptation | Marche | Course |
|--------|-----------|-----------|--------|--------|
| 1 | poids ≤ capacité / 2 | ×1 | ×1 | ×1 |
| 2 | ≤ capacité | ÷1,5 | ÷1,2 | ÷1,5 |
| 3 | ≤ capacité × 2 | ÷2 | ÷1,75 | ÷2,2 |
| 4 | > capacité × 2 | ÷3 | ÷2,5 | ÷3,2 |


---

**Dernière mise à jour :** 2026-04-16  
**Version du système :** 1.2.2  
**Statut :** Documenté complètement
