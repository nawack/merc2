# Système de Combat & Mouvement

## Vue d'ensemble

Le système Mercenary inclut un système de combat et mouvement sophistiqué basé sur des tables de calculs automatiques. Les valeurs de combat sont calculées automatiquement en fonction des attributs et caractéristiques du personnage.

## Onglet Combat & Mouvement

L'onglet "Combat & Mouvement" de la fiche de personnage contient trois sections principales :

### 1. Caractéristiques Physiques (Calculées automatiquement)

Ces valeurs sont calculées en fonction de la taille, poids et attributs du personnage :

#### Endurance
- **Formule** : ⌊(Volonté + Constitution) / 2⌋
- **Description** : Représente la capacité du personnage à endurer l'effort et la fatigue
- **Utilisation** : Résistance aux dégâts et à la fatigue en combat

#### Points de Corpulence
- **Formule** : Constitution + Ajustement PC (basé sur la corpulence)
- **Description** : Indique la robustesse physique et les points de santé de base
- **Utilisation** : Représente les points de santé globaux du personnage

#### Capacité de Charge
- **Formule** : Force + (Constitution × 2)
- **Description** : Quantité totale d'équipement que le personnage peut porter
- **Utilisation** : Gestion de l'encombrement en combat et en exploration

#### Bonus Discrétion
- **Source** : Table Discrétion (basée sur corpulence)
- **Description** : Modifie les jets de discrétion du personnage
- **Utilisation** : Approches silencieuses et mouvements furtifs

#### Bonus Dissimulation
- **Source** : Table Dissimulation (basée sur corpulence)
- **Description** : Modifie les jets de dissimulation du personnage
- **Utilisation** : Se cacher et rester caché en combat

### 2. Statistiques de Combat

Ces champs sont modifiables librement par le joueur :

- **Initiative** : Détermine l'ordre d'action en combat
- **Défense** : Modifie la difficulté à toucher le personnage
- **Santé** : Points de vie actuels (distinct des Points de Corpulence)
- **Fatigue** : Accumulation de fatigue en combat (0-100)

### 3. Vitesses de Déplacement (Calculées)

Ces valeurs sont auto-générées en fonction de la corpulence et de la rapidité :

#### Reptation
- Mouvements en rampant
- **Table** : Reptation (0,5 à 6,5 m/round selon la corpulence et rapidité)

#### Marche
- Mouvements normaux
- **Table** : Marche (2 à 25 m/round selon la corpulence et rapidité)

#### Course
- Déplacements rapides
- **Table** : Course (10 à 128 m/round selon la corpulence et rapidité)

### 4. Mouvement Personnalisé

Ces champs permettent de définir des vitesses spéciales :

- **Sprint** : Mouvements à vitesse maximale (supérieure à la course normale)
- **Charge** : Mouvements d'assaut ou de charge au combat

### 5. Armes Équipées

Affichage dynamique des armes du personnage avec accès rapide pour éditer chaque arme.

## Calcul des Vitesses de Déplacement

### Paramètres utilisés

1. **Taille (cm)** : Taille physique du personnage
   - Récupérée de la section "Biographie"
   - Utilisée pour trouver l'index dans les tables

2. **Poids (kg)** : Poids du personnage
   - Récupéré de la section "Biographie"
   - Utilisé pour calculer la corpulence

3. **Rapidité** : Attribut "Vitesse" du personnage
   - Attribut physique modifier (-11 à +20)
   - Influence directe sur la vitesse de déplacement

### Processus de calcul

```
1. Chercher l'index de taille dans la table Taille (cm)
2. Chercher l'index de poids dans la table Poids (kg)

3. Convertir les indices en valeurs d'attribut :
   index_taille_attribut = index_taille - 11
   index_poids_attribut = index_poids - 11

4. Calculer la corpulence :
   corpulence_moyenne = (index_taille_attribut + index_poids_attribut) / 2
   
   Si corpulence_moyenne > 5 :
     corpulence = ARRONDIR_SUPERIEUR(corpulence_moyenne)
   Sinon :
     corpulence = ARRONDIR_INFERIEUR(corpulence_moyenne)

5. Calculer l'index de vitesse :
   index_vitesse = corpulence + rapidité - 5
   (Clampé entre 0 et 31)

6. Récupérer les vitesses dans les tables :
   reptation = TABLE_REPTATION[index_vitesse]
   marche = TABLE_MARCHE[index_vitesse]
   course = TABLE_COURSE[index_vitesse]
```

## Tables de Référence

### Table Taille (cm)
```
Index:  -11  -10   -9   -8   -7   -6   -5   -4   -3   -2   -1    0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20
Taille: 49   57   65   73   81   89   97  105  113  121  129  137  145  153  161  169  177  186  195  206  219  235  253  275  301  332  367  408  455  509  569  600
```

### Table Poids (kg)
```
Index:  -11   -10   -9   -8   -7   -6   -5   -4   -3   -2   -1   0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20
Poids:  1.6  2.5  3.7  5.3  7.0  9.0  12  15  19  24  29  34  41  48  56  64  74  85  99 116 140 172 216 277 363 485 658 904 1253 1749 2449 3000
```

### Table Reptation (m/round)
```
0.5, 1, 1, 1, 1, 1, 1, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2, 2, 2, 2, 2, 2, 2.5, 2.5, 2.5, 3, 3, 3.5, 3.5, 4, 4.5, 4.5, 5, 5.5, 6.5
```

### Table Marche (m/round)
```
2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9, 10, 11, 12, 13, 15, 16, 18, 20, 23, 25
```

### Table Course (m/round)
```
10, 11, 13, 15, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 35, 37, 39, 41, 44, 47, 51, 55, 60, 66, 73, 82, 91, 102, 114, 128
```

### Table Discrétion
```
10, 9, 9, 8, 7, 7, 6, 5, 5, 4, 3, 3, 2, 1, 1, 0, 0, 0, -1, -1, -2, -3, -3, -4, -5, -5, -6, -7, -7, -8, -9, -9
```

### Table Dissimulation
```
16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15
```

### Table Ajustement PC
```
-3, -3, -3, -3, -3, -3, -3, -2, -2, -2, -2, -2, -2, -1, -1, -1, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 7, 8
```

## Mise à jour Automatique

Les valeurs calculées se mettent à jour automatiquement lorsque vous modifiez :
- La taille du personnage
- Le poids du personnage
- L'attribut "Volonté"
- L'attribut "Constitution"
- L'attribut "Force"
- L'attribut "Vitesse" (Rapidité)

Aucune action manuelle n'est nécessaire - le système recalcule automatiquement tous les champs dépendants.

## Exemple de Calcul

**Personnage exemple :**
- Taille : 177 cm
- Poids : 74 kg
- Volonté : 3
- Constitution : 2
- Force : 4
- Vitesse (Rapidité) : 1

**Calcul :**

1. Index taille 177 cm = index 15 (⚠️)
2. Index poids 74 kg = index 15 (⚠️)
3. Valeur attribut taille = 15 - 11 = 4
4. Valeur attribut poids = 15 - 11 = 4
5. Corpulence moyenne = (4 + 4) / 2 = 4 → arrondi inférieur = 4
6. Index vitesse = 4 + 1 - 5 + 11 = 11

**Résultats :**
- Endurance = ⌊(3 + 2) / 2⌋ = 2
- Points de Corpulence = 2 + (-2) = 0
- Capacité de Charge = 4 + (2 × 2) = 8
- Bonus Discrétion = 3 (table[11])
- Bonus Dissimulation = 5 (table[11])
- Reptation = 1.5 m/round
- Marche = 5 m/round
- Course = 27 m/round
