# Mercenary System - Foundry VTT v13

Un système custom simple pour Foundry Virtual Tabletop v13, basé sur des attributs et des compétences avec des jets de D20.

## 📋 Caractéristiques

- **6 Attributs de Base** : Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- **16 Compétences** : Chaque compétence est liée à un attribut spécifique
- **Système de Jets** : Lancez des d20 pour les attributs et les compétences
- **Gestion des Objets** : Armes, Armures et Équipement
- **Points de Vie & Mana** : Ressources gérables par personnage
- **Feuille de Personnage Intuitive** : Interface simple et ergonomique

## 🎮 Comment Utiliser

### Créer un Personnage

1. Créez un nouvel Acteur avec le type "Character"
2. Le système "Mercenary System" doit être sélectionné
3. La feuille de personnage s'affichera automatiquement

### Onglets de la Feuille

#### **Stats & Attributes**
- Voir les 6 attributs de base
- Modifier les scores d'attributs (de 1 à 20, généralement)
- Voir les modificateurs calculés automatiquement
- Gérer les points de vie (HP) et de mana (MP)
- **Cliquer sur un attribut pour faire un jet d20**

#### **Skills**
- 16 compétences liées aux attributs
- Ajouter des rangs de compétence
- Voir le modificateur total (attribut + rang)
- **Cliquer sur une compétence pour faire un jet d20**

#### **Items**
- Gérer les Armes
- Gérer les Armures
- Gérer l'Équipement

## 🎲 Système de Jets

### Jet d'Attribut
1. Allez à l'onglet "Stats & Attributes"
2. Cliquez sur la valeur d'un attribut
3. Un jet de d20 + modificateur d'attribut est lancé au chat

### Jet de Compétence
1. Allez à l'onglet "Skills"
2. Cliquez sur le nom de la compétence ou le bouton de jet
3. Un jet de d20 + (modificateur d'attribut + rang de compétence) est lancé

### Résultat d'un Jet
```
d20: [résultat du dé]
+ [modificateur]
= [résultat final]
```

## 📊 Structure des Attributs

| Attribut | Code | Compétences Liées |
|----------|------|------------------|
| Strength | STR | Athletics |
| Dexterity | DEX | Acrobatics, Sleight of Hand, Stealth |
| Constitution | CON | - |
| Intelligence | INT | Arcana, History, Investigation |
| Wisdom | WIS | Animal Handling, Insight, Medicine, Perception, Survival |
| Charisma | CHA | Deception, Intimidation, Performance, Persuasion |

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
│   └── style.css                       # Styles (thème sombre)
├── scripts/
│   ├── system.js                       # Initialisation du système
│   └── sheets/
│       └── character-sheet.js          # Logique de la feuille de personnage
└── templates/
    └── actor/
        ├── character-sheet.html        # Template pour les personnages
        └── npc-sheet.html              # Template pour les PNJs
```

## ⚙️ Compatibilité

- **Foundry VTT** : v13.0 et supérieur
- **Testé sur** : v13.351

## 💡 Conseils

- Les modificateurs d'attribut sont calculés automatiquement : (Score - 10) / 2
- Les compétences ne requièrent pas de rangs, ajoutez 0 si vous ne voulez pas de bonus
- Les jets s'affichent dans le chat Foundry pour tous les joueurs
- Vous pouvez personnaliser les thèmes en éditant `css/style.css`

## 📝 Notes

Ce système est conçu pour être simple et extensible. N'hésitez pas à personnaliser les templates et les styles selon vos besoins.

---

**Version** : 1.0.0  
**Auteur** : Game Master  
**Licence** : MIT
