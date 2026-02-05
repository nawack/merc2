# ⚔️ Statistiques de Combat

## Vue d'ensemble

Le système de combat du Mercenary System utilise une série de **statistiques calculées automatiquement** basées sur les attributs du personnage. Ces statistiques affectent la performance en combat direct.

**Onglet :** Combat dans la feuille de personnage

---

## 📊 Les 8 statistiques de combat

### 1️⃣ Taille (Corpulence)

**Formule :** Table lookup basée sur hauteur en cm

**Gamme :** 49 cm (min) à 600 cm (max)

**Impact :**
- Affecte la **capacité de charge** du personnage
- Affecte les bonus de **dissimulation**
- Affecte les bonus de **discrétion**

**Exemples de taille :**
```
Index 0:  49 cm  (enfant/gnome)
Index 8:  113 cm (petit humain)
Index 16: 177 cm (humain moyen)
Index 24: 301 cm (géant)
Index 31: 600 cm (très grand géant)
```

---

### 2️⃣ Poids (Corpulence)

**Formule :** Table lookup basée sur poids en kg

**Gamme :** 1.6 kg (min) à 3000 kg (max)

**Impact :**
- Combiné à la taille = **indice de corpulence**
- Affecte la **portance** et la **charge**
- Affecte l'**ajustement du PC** (Points de corpulence)

**Exemples de poids :**
```
Index 0:  1.6 kg   (très léger)
Index 8:  19 kg    (enfant)
Index 16: 74 kg    (adulte moyen)
Index 24: 363 kg   (très lourd)
Index 31: 3000 kg  (extrême)
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

Localisation: [scripts/system.js](scripts/system.js) - ligne ~2600

```javascript
function findTableIndex(value, table) {
  // Trouve le plus proche indice dans la table
  for (let i = 0; i < table.length; i++) {
    if (value <= table[i]) {
      return i;
    }
  }
  return table.length - 1;
}
```

---

## 📋 Tables de référence

### STATS_TABLES

**Localisation :** [scripts/system.js](scripts/system.js) - ligne ~52

```javascript
const STATS_TABLES = {
  taille: [49, 57, 65, ..., 600],           // 32 valeurs
  poids: [1.6, 2.5, 3.7, ..., 3000],       // 32 valeurs
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
3. ✅ Modification de la Constitution (pour PC)
4. ✅ Création du personnage
5. ✅ Import de personnage

### Hook utilisé

**Événement :** `Hooks.on('updateActor', ...)`

**Localisation :** [scripts/system.js](scripts/system.js) - ligne ~1800

```javascript
Hooks.on('updateActor', async (actor, updateData, options) => {
  // Vérifier si hauteur, poids, ou constitution a changé
  if (updateData.system?.biography?.height || 
      updateData.system?.biography?.weight ||
      updateData.system?.attributes?.constitution) {
    // Recalculer toutes les statistiques de combat
    await actor.update({ "system.movement": {...} });
  }
});
```

---

## 🎯 Utilisation en combat

### Exemple: Combat rapproché

```
Combattant: Mercenaire "Brick"
├─ Hauteur: 185 cm → Index Taille: 16
├─ Poids: 95 kg → Index Poids: 15
├─ Corpulence: Normale
├─ Statistiques:
│  ├─ Marche: 7 m/round (tactique)
│  ├─ Course: 34 m/round (rapidement)
│  ├─ Dissimulation: +1 (légèrement visible)
│  ├─ Discrétion: 0 (bruit normal)
│  └─ Ajustement PC: -1 (charge réduite)
└─ Points de Corpulence: Constitution(6) + Ajustement(-1) = 5
```

### Exemple: Agent infiltration

```
Agent: "Rook" (léger/petit)
├─ Hauteur: 165 cm → Index Taille: 12
├─ Poids: 60 kg → Index Poids: 10
├─ Corpulence: Petite
├─ Statistiques:
│  ├─ Marche: 5 m/round (silencieux)
│  ├─ Course: 27 m/round (rapide)
│  ├─ Dissimulation: +8 (très caché)
│  ├─ Discrétion: +4 (silencieux)
│  └─ Ajustement PC: -1 (charge réduite)
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

**Formule :** `Force + (Constitution × 2) + Ajustement`

**Exemple :**
```
Force: 7
Constitution: 5
Ajustement PC: -1
Capacité: 7 + (5 × 2) + (-1) = 16 kg
```

### Initiative (non automatisée)

**Formule suggérée :** `Rapidité + d20`

Pour les jets manuels en combat.

### Parade (non automatisée)

**Formule suggérée :** `(Rapidité + Dextérité) / 2 + Degré Esquive`

Pour réaction défensive.

### Esquive (non automatisée)

**Formule suggérée :** `(Adaptation + Dextérité) / 2 + Degré Esquive`

Pour éviter attaque.

---

## 📖 Règles associées

### Encombrement

Si le poids porté > Capacité de charge:
- Pénalité progressive aux déplacements
- Pénalité aux compétences d'agilité
- Fatigue augmentée

### Mutipliers de mouvement

- **Reptation:** 1/5e de la marche (normalement)
- **Marche:** Vitesse tactique/prudente
- **Course:** 4-5× la marche (sprint maximal)

### Combat immobilisé

Si incapable de se déplacer:
- Malus -5 aux Jets de Parade
- Malus -10 aux Jets d'Esquive
- Bonus +3 pour les tirs de combattants)

---

## 🛠️ Extension des statistiques

Pour **ajouter des statistiques** personnalisées:

1. Ajouter une nouvelle table dans `STATS_TABLES`
2. Ajouter un champ `movement` dans `template.json`
3. Modifier la fonction de calcul automatique

---

**Dernière mise à jour :** 2026-02-05  
**Version du système :** 1.0.8  
**Statut :** Documenté complètement
