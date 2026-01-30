# 📂 Structure du Projet Mercenary System

## Arborescence Complète

```
FoundryVTT-MercenarySystem/
│
├── 📄 system.json                    # Manifest Foundry (Configuration du système)
├── 📄 template.json                  # Templates des documents (Actor, Item)
├── 📄 README.md                      # Documentation utilisateur principale
├── 📄 INSTALLATION.md                # Guide d'installation détaillé
├── 📄 CONTRIBUTING.md                # Guide de contribution pour développeurs
├── 📄 CHANGELOG.md                   # Historique des versions
├── 📄 LICENSE                        # Licence MIT
├── 📄 .gitignore                     # Configuration Git
│
├── 📁 scripts/
│   ├── 📜 system.js                  # JavaScript principal du système
│   ├── build-release.ps1             # Script de build pour Windows (PowerShell)
│   └── build-release.sh              # Script de build pour Linux/macOS
│
├── 📁 templates/
│   └── 📁 actor/
│       └── 📄 character-sheet.hbs    # Template Handlebars de la feuille de personnage
│
├── 📁 css/
│   └── 📄 style.css                  # Styles CSS du système
│
├── 📁 lang/
│   ├── 📄 en.json                    # Traductions anglaises
│   └── 📄 fr.json                    # Traductions françaises
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 release.yml            # Workflow GitHub Actions pour les releases
│
└── 📁 releases/
    └── 📦 merc-system-1.0.0.zip      # Package pour distribution (généré)
```

## 📋 Fichiers Clés et Leur Rôle

### `system.json`
**Rôle** : Manifest de configuration Foundry VTT
- Décrit le système à Foundry
- Contient les URLs pour installation/mise à jour
- Définit les scripts, styles, langues, types de documents

**À modifier pour** :
- Changer la version
- Ajouter/retirer des langues
- Mettre à jour les URLs GitHub

### `template.json`
**Rôle** : Définit la structure des données Actor et Item
- Schéma des attributs et compétences
- Schéma des objets (armes, armures, etc.)
- Valeurs par défaut

**À modifier pour** :
- Ajouter de nouveaux attributs
- Ajouter de nouvelles compétences
- Modifier la structure des données

### `scripts/system.js`
**Rôle** : Code JavaScript du système (~1300 lignes)
- Classe `MercCharacterSheet` (feuille de personnage)
- Tables de degrés et formules
- Systèmes de jets D20
- Gestion des événements UI

**Sections principales** :
- Lignes 1-190 : Fonctions utilitaires et tables
- Lignes 191-660 : Classe MercCharacterSheet - initialisation
- Lignes 661-945 : Méthode `_onRender()` - event listeners
- Lignes 946-1100 : Méthodes de jets et d'édition d'objets
- Lignes 1101-1295 : Configuration Foundry et enregistrement

### `templates/actor/character-sheet.hbs`
**Rôle** : Template HTML de la feuille de personnage
- Structure du formulaire
- Onglets (Stats, Skills, Items)
- Sections des attributs et compétences
- Portrait du personnage

**Sections principales** :
- Lignes 1-75 : En-tête avec portrait et infos du personnage
- Lignes 76-175 : Onglet Stats (attributs)
- Lignes 176-300 : Onglet Skills (compétences)
- Lignes 301-418 : Onglet Items (objets)

### `css/style.css`
**Rôle** : Styles CSS du système (~1000 lignes)
- Layout principal et responsive
- Styles des attributs et compétences
- Styles du portrait
- Animations et transitions

**Sections principales** :
- Lignes 1-50 : Global et imports
- Lignes 51-150 : En-tête et layout principal
- Lignes 151-300 : Attributs
- Lignes 301-600 : Compétences et onglets
- Lignes 601-985 : Styles spécialisés (items, boutons, etc.)

### `lang/*.json`
**Rôle** : Fichiers de traduction (i18n)
- `en.json` : Clés en anglais
- `fr.json` : Clés en français

**Format** :
```json
{
  "MERC.System": "Mercenary System",
  "MERC.Attributes.Strength": "Force",
  "MERC.Skills.combat": "Combat"
}
```

## 🔗 Dépendances et Liens

### Dépendances Internes
```
system.js
  ├── Utilise : template.json (structure des données)
  ├── Utilise : templates/actor/character-sheet.hbs
  ├── Utilise : css/style.css
  └── Utilise : lang/*.json (traductions)

templates/actor/character-sheet.hbs
  ├── Référence : css/style.css (classes CSS)
  ├── Utilise : system.js (event listeners)
  └── Utilise : lang/*.json (i18n)

css/style.css
  └── Utilisé par : templates/actor/character-sheet.hbs
```

### Dépendances Externes
- **Foundry VTT v13.0+** : Framework principal
- **Handlebars** : Moteur de templating (fourni par Foundry)
- **FontAwesome** : Icônes (chargées via CDN)

## 🔄 Flux de Données

```
Actor Document (données)
       ↓
template.json (schéma)
       ↓
system.js (logique)
       ↓
character-sheet.hbs (affichage)
       ↓
style.css (styles)
       ↓
Rendu dans Foundry VTT
```

## 📦 Processus de Release

1. **Développement** : Modifications dans `main` branch
2. **Version** : Mise à jour `system.json` version
3. **Build** : Exécution de `build-release.ps1` ou `build-release.sh`
4. **Tag** : `git tag v1.0.1`
5. **Release** : GitHub Actions crée automatiquement la release
6. **Publication** : ZIP uploadé dans GitHub Releases
7. **Installation** : Utilisateurs installent via Manifest URL

## 🎯 Points d'Extension Futurs

### Où ajouter du contenu

**Nouvelles Compétences** :
- Ajouter dans `template.json` (système.skills)
- Ajouter traduction dans `lang/*.json`
- Ajouter logique dans `system.js` (config.MERC.skills)

**Nouveaux Types d'Objets** :
- Ajouter dans `template.json` (documentTypes.Item)
- Créer nouveau template dans `templates/item/`
- Créer classe ItemSheet dans `system.js`

**Nouveaux Attributs** :
- Ajouter dans `template.json`
- Ajouter template Handlebars
- Ajouter styles CSS
- Ajouter traduction

**Nouvelles Fonctionnalités** :
- Code dans `system.js`
- Template HTML si UI nécessaire
- Styles dans `style.css`
- Traductions dans `lang/`

## 🐛 Débogage

### Console du Navigateur (F12)
- Erreurs JavaScript
- Avertissements d'authentification
- Messages de log personnalisés

### Logs Foundry
- `console.log()` dans system.js
- Visibles dans la console du navigateur et logs Foundry

### Outils de Développement Utiles
- VS Code avec extensions Handlebars et ESLint
- Prettier pour formater le code
- JSONLint pour valider JSON

## 📚 Ressources Utiles

- [Documentation Foundry](https://foundryvtt.com/article/system-development/)
- [API Foundry](https://foundryvtt.com/api/)
- [Handlebars Guide](https://handlebarsjs.com/)
- [Community Systems](https://foundryvtt.com/packages/)

---

**Dernière mise à jour** : 2026-01-30  
**Version** : 1.0.1
