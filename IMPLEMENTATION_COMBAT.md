# Implémentation du Système de Combat & Mouvement

## 📊 Résumé

Un système complet de gestion du combat et du mouvement a été implémenté avec **8 tables de données** et **calcul automatique** des statistiques basées sur les attributs du personnage.

## 🎯 Fonctionnalités Implémentées

### 1. Tables de Données (system.js)
```javascript
const COMBAT_TABLES = {
  taille: [49, 57, 65, ..., 600],           // 32 valeurs (cm)
  poids: [1.6, 2.5, 3.7, ..., 3000],       // 32 valeurs (kg)
  reptation: [0.5, 1, 1, ..., 6.5],        // vitesse rampant
  marche: [2, 2, 3, ..., 25],              // vitesse marche
  course: [10, 11, 13, ..., 128],          // vitesse course
  dissimulation: [16, 15, 14, ..., -15],   // bonus dissimulation
  discretion: [10, 9, 9, ..., -9],         // bonus discrétion
  ajustementPC: [-3, -3, -3, ..., 8]       // ajustement points corpulence
}
```

### 2. Champs Calculés Automatiquement

#### Caractéristiques Physiques
| Champ | Formule | Description |
|-------|---------|-------------|
| **Endurance** | ⌊(Volonté + Constitution) / 2⌋ | Capacité à supporter l'effort |
| **Points de Corpulence** | Constitution + AjustPC[corpulence] | Points de santé de base |
| **Capacité de Charge** | Force + (Constitution × 2) | Poids transportable |
| **Bonus Discrétion** | discretion[corpulence] | Modifie jets de discrétion |
| **Bonus Dissimulation** | dissimulation[corpulence] | Modifie jets de dissimulation |

#### Vitesses de Déplacement
| Type | Source | Description |
|------|--------|-------------|
| **Reptation** | reptation[index_vitesse] | Mouvements rampant (m/round) |
| **Marche** | marche[index_vitesse] | Déplacements normaux (m/round) |
| **Course** | course[index_vitesse] | Mouvements rapides (m/round) |

### 3. Interface Utilisateur (character-sheet.hbs)

**Onglet "Combat & Mouvement"** avec sections :
- 📏 Caractéristiques Physiques (affichage des valeurs calculées)
- ⚔️ Statistiques de Combat (entrées modifiables)
- 🏃 Vitesses de Déplacement (affichage automatique)
- 🏃‍♂️ Mouvement Personnalisé (Sprint, Charge)
- 🗡️ Armes Équipées (liste dynamique)

### 4. Styles CSS (style.css)

Sections complètes pour :
- `.physical-grid` : Grille responsive des caractéristiques physiques
- `.combat-grid` : Grille des stats de combat
- `.movement-speeds-grid` : Affichage des vitesses
- `.stat-value` : Affichage des valeurs calculées (couleur #e94560)
- `.speed-value` : Affichage des vitesses (couleur #4ec9a8)

### 5. Fonction de Calcul (system.js - MercCharacterSheet)

```javascript
calculateCombatStats() {
  // 1. Récupère taille, poids et attributs
  // 2. Trouve les indices dans les tables
  // 3. Calcule la corpulence
  // 4. Calcule l'index_vitesse
  // 5. Récupère toutes les valeurs des tables
  // 6. Retourne objet avec tous les champs calculés
  return {
    endurance,
    pointCorporence,
    capaciteCharge,
    bonusDiscretion,
    bonusDissimulation,
    vitesses: { reptation, marche, course },
    corpulence,
    indexVitesse,
    indexTaille,
    indexPoids
  }
}
```

### 6. Mise à Jour Automatique

**Hook Foundry** : `Hooks.on("updateActor")`
- Détecte modifications : taille, poids, attributs
- Recalcule automatiquement tous les champs dépendants
- Met à jour l'acteur sans rafraîchir l'interface

**Initialisation** : Lors du rendu de la fiche (activateListeners)
- Calcule les stats au premier affichage
- Synchronise avec le modèle d'acteur

## 📁 Fichiers Modifiés

### [system.js](scripts/system.js)
- **Ligne 52-60** : Ajout des 8 tables `COMBAT_TABLES`
- **Ligne 1165-1246** : Fonction `calculateCombatStats()` (82 lignes)
- **Ligne 1176-1186** : Fonction `findTableIndex()` (11 lignes)
- **Ligne 962-978** : Initialisation au rendu (17 lignes)
- **Ligne 1367-1402** : Hook `updateActor` pour mise à jour auto (36 lignes)

### [character-sheet.hbs](templates/actor/character-sheet.hbs)
- **Ligne 362-435** : Nouvel onglet "Combat & Mouvement" (73 lignes)
  - Caractéristiques Physiques (5 champs calculés)
  - Statistiques de Combat (4 champs)
  - Vitesses de Déplacement (3 champs)
  - Mouvement Personnalisé (2 champs)
  - Armes Équipées (liste dynamique)

### [style.css](css/style.css)
- **Ligne 1007-1118** : Styles Combat & Mouvement (112 lignes)
  - Layout responsive avec CSS Grid
  - Couleurs thématiques (#e94560, #4ec9a8)
  - Animations et effets hover

### [template.json](template.json)
- **Ligne 100-120** : Propriétés `combat` et `movement` (21 lignes)
  - 10 nouveaux champs de données

## 🔄 Processus de Calcul

```
Taille + Poids 
    ↓
Chercher indices dans tables
    ↓
Convertir en valeurs d'attribut
    ↓
Calculer corpulence
    ↓
Calculer index_vitesse (corpulence + rapidité - 5)
    ↓
Récupérer valeurs des tables
    ↓
Appliquer formules pour champs calculés
    ↓
Retourner objet avec tous les calculs
    ↓
Mettre à jour l'acteur Foundry
```

## ✅ Validations

- [x] JSON valid (template.json)
- [x] Tables correctes (32 entrées chaque)
- [x] Formules vérifiées
- [x] Interface responsive
- [x] Mise à jour automatique
- [x] Styles appliqués
- [x] Documentation complète

## 📚 Documentation

Fichier [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) contient :
- Description complète du système
- Explications des 5 calculs
- Tables de référence
- Exemple de calcul détaillé
- Guide d'utilisation

## 🚀 Utilisation

1. **Dans Foundry VTT**, ouvrir la fiche d'un personnage
2. Aller à l'onglet **"Combat & Mouvement"**
3. Modifier :
   - Biographie (Taille, Poids)
   - Attributs (Volonté, Constitution, Force, Vitesse)
4. **Les valeurs se recalculent automatiquement** ✨

## 🔗 Dépendances

- Foundry VTT v13.0+
- ActorSheetV2
- CSS Grid (modern browsers)
- Handlebars.js (pour filtres)

## 📝 Notes

- Les indices de table vont de 0 à 31 (représentant attributs -11 à +20)
- La corpulence se clamp automatiquement à [0, 31]
- Les valeurs négatives sont converties à 0 via `Math.max(0, ...)`
- Les calculs s'exécutent côté client (no server required)
- Aucune modification manuelle requise - tout est automatique

## 🎮 Prochaines Étapes

Options d'amélioration futures :
- Intégration des vitesses de déplacement en combat
- Affichage des bonus/malus sur les rolls
- Affichage des encombrement de l'équipement
- Calculateur de couverture/abri en combat
- Système de blessures (blessures légères/graves)
- Affichage des pénalités associées
