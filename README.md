# Mercenary System - Foundry VTT v13

Un système custom avancé pour Foundry Virtual Tabletop v13, basé sur 10 attributs principaux et 56 compétences de base, avec compétences personnalisées (langues et spécialisations) et calcul automatique de degrés via table de progression.

## 🔧 Compatibilité

- **Version minimale :** Foundry VTT 13.0
- **Version testée & vérifiée :** 13.351 (Stable)
- **Version maximale :** 13.351

⚠️ **Note :** Le système a été développé et testé sur Foundry VTT 13.351. Les versions antérieures à 13.0 ne sont pas supportées.

## 📋 Caractéristiques

- **10 Attributs de Base** : Intelligence, Volonté, Santé Mentale, Charisme, Chance, Adaptation, Force, Dextérité, Rapidité, Constitution
- **Perception** : Attribut principal avec 5 sous-attributs (Vue, Ouïe, Goût, Odorat, Toucher)
- **56 Compétences de base** : Organisées en 8 catégories (Combat, Aptitudes, Social, Langues, Connaissances, Construction, Spécialisations, Autres)
- **Compétences personnalisées** : Ajout/suppression/renommage pour Langues et Spécialisations
- **Calcul Automatique** : 
  - Base = 30 - (Attribut × 2) ou 30 - (Attribut1 + Attribut2)
  - Degré calculé automatiquement via table de progression (base 4-28, degrés -7 à +33)
- **Système de Jets** : D20 pour attributs et compétences avec modificateurs dynamiques
- **Interface Moderne** : Design épuré avec onglets, colonnes multiples et indicateurs visuels
- **Gestion des Objets** : Armes, Armures, Équipement, Munitions et Traits
- **Véhicules** : Type d'acteur dédié avec armes, équipage, carburant et boutons +/−
- **Prérequis de compétences** : Certaines compétences avancées nécessitent l'apprentissage préalable
- **Système de dégâts mêlée** : Table de référence combinant Force et Degré de compétence
- **Moteur balistique physique** : Dégâts et pénétration des armes à feu calculés par énergie cinétique (v1.0.12+)
- **Statistiques de combat** : Calcul automatique des mouvements et bonus tactiques
- **Fiches Armure, Équipement, Trait** : Items dédiés avec rareté, prix, poids et description (v1.0.16+)
- **Schéma de corps SVG** : Fiche armure — 20 zones de localisation sur un diagramme interactif vue de face (v1.0.16+)

## 🎮 Comment Utiliser

### Créer un Personnage

1. Créez un nouvel Acteur avec le type "Character"
2. Le système "Mercenary System" doit être sélectionné
3. La feuille de personnage s'affichera avec toutes les compétences initialisées

### Onglets de la Feuille

#### **Attributs**
- 10 attributs principaux répartis en 3 colonnes
- Chaque attribut a une valeur d'**Origine** et **Actuelle**
- Synchronisation automatique : modifier l'Origine met à jour l'Actuelle
- Perception avec 5 sous-attributs détaillés
- **Grille de statistiques de combat** : Caractéristiques physiques (Taille, Poids, Corpulence, etc.), Bonus de combat (Init, Attaque, Parade, etc.), Vitesses de mouvement (Marche, Course, Sprint)
- **Cliquer sur un label d'attribut pour faire un jet d20 + valeur**

#### **Skills** 
- 56 compétences de base organisées en 7 onglets thématiques
- Affichage en 2 colonnes avec en-têtes alignés
- Pour chaque compétence : **Base** (calculée) / **Dev** (XP) / **Degré** (auto) / **Bonus** (manuel)
- **Boutons colorés** selon le total (Rouge si -7, Orange si négatif, Vert clair si 0, Vert foncé si positif)
- **Cliquer sur le nom** de la compétence pour lancer un jet
- **Jet = d20 + Degré + Bonus** (l'attribut est déjà intégré dans le calcul de Base/Degré)
- **Langue natale** : champ dédié pour préciser la langue affichée

#### **Items**
- Gérer les Armes, Armures et Équipement
- Ajouter, éditer ou supprimer des objets

## 🎲 Système de Jets

### Jet d'Attribut
1. Allez à l'onglet "Attributs"
2. Cliquez sur le **label** d'un attribut (pas sur l'input)
3. Un jet de **d20 + valeur de l'attribut** est lancé au chat

### Jet de Sous-Attribut Perception
1. Allez à l'onglet "Attributs"
2. Cliquez sur le label d'un sous-attribut (Vue, Ouïe, etc.)
3. Un jet de **d20 + valeur du sous-attribut** est lancé

### Jet de Compétence
1. Allez à l'onglet "Skills"
2. Sélectionnez la catégorie voulue
3. Cliquez sur le **nom** de la compétence ou le **bouton coloré**
4. Un jet de **d20 + (Degré + Bonus)** est lancé
5. Le résultat affiche : Base / Dev / Degré / Bonus pour référence

### Critiques (20/1)
- Sur un **20** naturel, un second d20 est lancé et **ajouté**
- Sur un **1** naturel, un second d20 est lancé et **soustrait**
- Les deux jets sont affichés dans le breakdown du chat

### Résultat d'un Jet
```
d20: [résultat du dé]
+ [modificateur]
= [résultat final]
(Base X / Dev Y / Degré Z / Bonus W)
```

## 📊 Structure des Attributs & Compétences

### Attributs Principaux (Colonne 1)
- **Intelligence** : Compétences intellectuelles et techniques
- **Volonté** : Résistance mentale et chimie
- **Santé Mentale** : Équilibre psychologique
- **Charisme** : Interaction sociale et langues
- **Adaptation** : Polyvalence et survie

### Attributs Physiques (Colonne 2)
- **Force** : Puissance brute et jets
- **Dextérité** : Précision et agilité
- **Rapidité** : Vitesse et réflexes
- **Constitution** : Endurance
- **Chance** : Facteur aléatoire

### Perception (Colonne 3)
- Valeur principale + 5 sens détaillés
- Synchronisation auto des sous-attributs si la valeur principale change

### Catégories de Compétences

**Combat (9)** : Réaction, Mêlée, Armes blanches, Projectiles mécaniques, Armes à poudre, Lancer, Manœuvres, Armes lourdes, Armes électroniques

**Aptitudes (20)** : Course, Escalade, Nage, Glisse, Vol, Conduite (roues, moto, bateaux, chenilles, avions, hélicos), Équitation, Pistage, Discrétion, Camouflage, Vol à la tire, Crochetage, Bricolage, Contrefaçon, Survie

**Social (5)** : Éloquence, Comédie, Interrogation, Commandement, Instruction

**Langues (1 + personnalisées)** : Langue natale + langues personnalisées

**Connaissances (18)** : Bureaucratie, Illégalité, Mathématiques, Métallurgie, Ingénierie, Électricité/Électronique, Informatique, Géographie, Météorologie, Navigation, Histoire/Politique, Chimie, Géologie, Nature, Biologie, Médecine humaine, Chirurgie

**Construction (4)** : Avionique, Véhicules, Armement, Outils

**Spécialisations (personnalisées)** : spécialisations créées par l’utilisateur, avec choix d’une compétence de base

## 🔢 Système de Calcul des Compétences

### Formule de Base
- **1 attribut** : Base = 30 - (Attribut × 2)
- **2 attributs** : Base = 30 - (Attribut1 + Attribut2)

### Table de Degrés
- 25 lignes de Base (4 à 28)
- 41 seuils d'XP par ligne
- Degrés de -7 à +33
- Le Degré est calculé en trouvant la plus grande valeur ≤ Dev dans la ligne correspondant à la Base

### Exemple de Calcul
1. Force = 12, Dextérité = 14
2. Compétence "Mêlée" (Force + Dextérité)
3. Base = 30 - (12 + 14) = **4**
4. Dev (XP investi) = 50
5. Degré = Recherche dans table[4] → **+9**
6. Bonus manuel = +2
7. **Total pour jet = +11** (Degré 9 + Bonus 2)

## 🎨 Interface & Ergonomie

- **Onglets principaux** : Attributs, Compétences, Combat, Objets (répartis équitablement sur toute la largeur)
- **Onglets de compétences** sur 2 lignes (4 + 3), style discret quand inactif
- **Colonnes de compétences** avec en-têtes alignés (Base/Dev/Degré/Bonus/Total)
- **Affichage vertical** : Label sur ligne 1, Inputs + Bouton sur ligne 2
- **Boutons colorés dynamiques** :
  - Rouge (#e94560) si total = -7
  - Orange clair (#ffb347) si -7 < total < 0
  - Vert clair (#90ee90) si total = 0
  - Vert foncé (#3cb371) si total > 0
- **Mise à jour temps réel** des couleurs lors des modifications

## 🛠️ Édition des Éléments

- **Armes** : Possèdent des dégâts (ex: 1d8), un type de dégâts et une rareté
- **Armures** : Possèdent une classe d'armure (AC), un poids et une rareté
- **Équipement** : Possèdent un poids et une rareté

## 📁 Structure du Système

```
merc/
├── system.json                          # Déclaration du système
├── template.json                        # Schéma des données
├── css/
│   └── style.css                       # Styles modernes (thème clair)
├── scripts/
│   └── system.js                       # Initialisation, calculs et logique
└── templates/
    └── actor/
        └── character-sheet.hbs         # Template Handlebars pour personnages
```

## ⚙️ Compatibilité

- **Foundry VTT** : v13.0 et supérieur
- **Testé sur** : v13.351
- **API** : ApplicationV2 avec HandlebarsApplicationMixin

## 💡 Conseils

- Les valeurs Base et Degré sont **calculées automatiquement** - ne pas modifier manuellement
- Investissez des points dans **Dev** pour augmenter le Degré via la table
- Utilisez **Bonus** pour des modificateurs situationnels ou équipement
- Les attributs Origine se synchronisent automatiquement avec Actuel
- La Perception principale synchronise tous ses sous-attributs
- Les compétences sont **initialisées automatiquement** à la création du personnage
- Les langues et spécialisations personnalisées peuvent être gérées directement dans l’onglet Compétences
- Tous les jets sont persistés et calculés correctement même après rechargement

## 🔧 Fonctionnalités Techniques

- **Persistance automatique** des champs lors des changements (blur/change events)
- **Migration automatique** des acteurs existants vers la nouvelle structure
- **Initialisation complète** des compétences au hook `preCreateActor`
- **Calcul dynamique** du degré via fonction `getDegreeFromTable(base, dev)`
- **Helpers Handlebars** : `filterItems`, `gt`, `eq`, `mod`
- **Gestion d'état** : Mémorisation des onglets actifs entre les rendus

## 📝 Notes Techniques

### Table de Degrés (Extrait)
```javascript
DEGREE_TABLE = {
  4: [0, 0, 0, 1, 1, 2, 3, 4, 5, 7, ...],
  5: [0, 0, 0, 1, 1, 2, 3, 5, 7, 9, ...],
  ...
  28: [0, 2, 3, 5, 9, 14, 21, 28, 39, ...]
}
INDEX_TO_DEGREE = [-7, -6, -5, ..., 32, 33]
```

### Formules de Jets
- **Attribut** : `1d20 + valeur_attribut`
- **Sous-attribut** : `1d20 + valeur_sous_attribut`
- **Compétence** : `1d20 + degré + bonus` (Base déjà intégrée via Degré)

---

## 📦 Installation

### Méthode 1 : Installateur Web Foundry (Recommandé)

1. Ouvrez Foundry VTT
2. Allez dans **Game Settings** → **System & Module Management**
3. Cliquez sur **Install System**
4. Collez cette URL dans le champ **Manifest URL** :
   ```
   https://raw.githubusercontent.com/nawack/merc2/main/system.json
   ```
5. Cliquez sur **Install**
6. Attendez la fin de l'installation
7. Sélectionnez "Mercenary System" lors de la création d'un nouveau monde

### Méthode 2 : Installation Manuelle

1. Téléchargez le dossier complet `merc`
2. Placez-le dans `Data/systems/` de votre installation Foundry
3. Relancez Foundry VTT
4. Sélectionnez "Mercenary System" lors de la création d'un monde

### Mise à Jour Automatique

Une fois installé via Manifest URL, le système vérifiera automatiquement les mises à jour.

---

## 📚 Documentation Complète

Le système inclut une documentation détaillée couvrant tous les aspects:

### Pour les Joueurs
- [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md) - Prérequis des compétences avancées
- [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md) - Système de dégâts et table de référence
- [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md) - Statistiques de combat (taille, poids, mouvements)
- [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md) - Guide complet des types d'objets (Armes, Armures, etc.)

### Pour les Développeurs
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture du système
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guide de contribution
- [INSTALLATION.md](INSTALLATION.md) - Installation détaillée
- [CHANGELOG.md](CHANGELOG.md) - Historique des versions

### Fichiers de Référence
- [system.json](system.json) - Configuration et métadonnées
- [template.json](template.json) - Schéma de données
- [CHANGELOG.md](CHANGELOG.md) - Historique des versions

---

**Version** : 1.0.9  
**Auteur** : Game Master  
**Système** : Mercenary RPG  
**Licence** : MIT

