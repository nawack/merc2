# Guide d'Installation et de Publication

Ce guide explique comment installer le Mercenary System sur Foundry VTT et comment le publier pour que d'autres utilisateurs puissent l'installer via URL manifest.

## 📦 Pour les Joueurs/MJ : Installer le Système

### Option 1 : Installation via URL Manifest (Recommandée)

1. **Ouvrez Foundry VTT**
2. Allez dans le menu : **Game Settings** → **System & Module Management** (ou **Add-on Modules** selon la version)
3. Cliquez sur le bouton **Install System**
4. Dans le champ **Manifest URL**, collez :
   ```
   https://raw.githubusercontent.com/nawack/merc2/main/system.json
   ```
5. Cliquez sur **Install**
6. Attendez que l'installation se termine (quelques secondes)
7. Fermez la fenêtre et créez un nouveau monde
8. Sélectionnez **Mercenary System** comme système pour votre monde
9. Créez votre personnage !

**Avantages :**
- ✅ Mises à jour automatiques
- ✅ Plus facile à partager
- ✅ Installation en un clic

### Option 2 : Installation Manuelle

1. **Téléchargez** le dossier complet `merc`
2. **Localisez** le dossier `Data/systems/` dans votre installation Foundry :
   - Windows : `C:\Users\YourUsername\AppData\Local\FoundryVTT\Data\systems\`
   - macOS : `~/Library/Application Support/FoundryVTT/Data/systems/`
   - Linux : `~/.local/share/FoundryVTT/Data/systems/`
3. **Placez** le dossier `merc` dans `Data/systems/`
4. **Relancez** Foundry VTT
5. Créez un nouveau monde et sélectionnez **Mercenary System**

---

## 🚀 Pour les Développeurs : Publier le Système

### Étape 1 : Préparer votre Dépôt GitHub

1. **Créez un compte GitHub** (gratuit) : https://github.com
2. **Créez un nouveau dépôt** (repository) :
   - Nom suggéré : `merc2`
   - Cochez **Initialize this repository with a README**
   - Licence : **MIT License** (déjà configurée dans le projet)

3. **Clonez le dépôt** sur votre ordinateur :
   ```bash
   git clone https://github.com/nawack/merc2.git
   cd merc2
   ```

4. **Copiez les fichiers du système** dans ce dossier :
   - `system.json`
   - `template.json`
   - `README.md`
   - `LICENSE`
   - Dossiers : `scripts/`, `templates/`, `css/`, `lang/`

### Étape 2 : Configurer le system.json

Mettez à jour les URLs dans le fichier `system.json` :

```json
{
  "id": "merc",
  "title": "Mercenary System",
  "description": "Un système de jeu de rôle basé sur des attributs et des compétences...",
  "version": "1.0.0",
  "manifest": "https://raw.githubusercontent.com/nawack/merc2/main/system.json",
  "download": "https://github.com/nawack/merc2/releases/download/v1.0.0/merc-system-1.0.0.zip",
  "url": "https://github.com/nawack/merc2",
  "bugs": "https://github.com/nawack/merc2/issues",
  "changelog": "https://github.com/nawack/merc2/releases",
  ...
}
```

**Remplacez :**
- `v1.0.0` par le numéro de version actuellement utilisé

### Étape 3 : Pousser vers GitHub

1. **Ajoutez les fichiers** :
   ```bash
   git add .
   git commit -m "Initial commit: Mercenary System v1.0.0"
   git push origin main
   ```

2. **Vérifiez sur GitHub** que tous les fichiers sont présents :
   - ✅ `system.json`
   - ✅ `template.json`
   - ✅ Dossier `scripts/`
   - ✅ Dossier `templates/`
   - ✅ Dossier `css/`
   - ✅ Dossier `lang/`

### Étape 4 : Créer une Release GitHub

1. **Allez sur GitHub** : https://github.com/nawack/merc2
2. **Cliquez sur "Releases"** (à droite de la page)
3. **Cliquez sur "Create a new release"**
4. **Remplissez les champs** :
   - Tag version : `v1.0.0`
   - Release title : `Mercenary System v1.0.0 - Initial Release`
   - Description :
     ```markdown
     # Mercenary System v1.0.0
     
     Initial release of the Mercenary System for Foundry VTT v13.
     
     ## Features
     - 10 main attributes with automatic calculation
     - 5 perception sub-attributes
     - 65 skills organized in 7 categories
     - Automatic degree calculation from progression table
     - D20 roll system with dynamic modifiers
     - Modern UI with tabs and multiple columns
     - Weapon, Armor, and Equipment management
     ```

5. **Attachez le fichier ZIP** :
   - Compressez le dossier `merc` en ZIP : `merc-system-1.0.0.zip`
   - Uploadez-le dans la section "Attach binaries"

6. **Cliquez sur "Publish release"**

### Étape 5 : Tester l'Installation via Manifest

1. **Obtenez l'URL Manifest** : 
   ```
   https://raw.githubusercontent.com/VOTRE_USERNAME/FoundryVTT-MercenarySystem/main/system.json
   ```

2. **Testez dans Foundry VTT** :
   - Allez à **Game Settings** → **System & Module Management**
   - Cliquez sur **Install System**
   - Collez l'URL Manifest
   - Vérifiez que tout s'installe correctement

---

## 🔄 Mettre à Jour le Système

### Quand vous avez une nouvelle version :

1. **Incrémentez la version** dans `system.json` :
   ```json
   "version": "1.0.1"
   ```

2. **Committez et pushez** :
   ```bash
   git add .
   git commit -m "Version 1.0.1: Fix portrait selection"
   git push origin main
   ```

3. **Créez une nouvelle release** sur GitHub :
   - Tag : `v1.0.1`
   - Décrivez les changements
   - Attachez le nouveau ZIP

4. **Mettez à jour le lien download** dans `system.json` si nécessaire

Les utilisateurs ayant installé via Manifest URL recevront une notification de mise à jour !

---

## ⚙️ Structure du Projet

```
FoundryVTT-MercenarySystem/
├── system.json           # Manifest Foundry (configuration système)
├── template.json         # Templates des documents
├── README.md             # Documentation utilisateur
├── INSTALLATION.md       # Ce fichier
├── LICENSE               # MIT License
├── scripts/
│   └── system.js         # Code JavaScript principal
├── templates/
│   └── actor/
│       └── character-sheet.hbs    # Template de la feuille de personnage
├── css/
│   └── style.css         # Styles du système
└── lang/
    ├── en.json           # Traductions anglaises
    └── fr.json           # Traductions françaises
```

---

## 🐛 Dépannage

### "Le système ne s'installe pas"
- ✅ Vérifiez que le `system.json` est valide (testez sur https://jsonlint.com)
- ✅ Vérifiez que l'URL Manifest est correcte et accessible
- ✅ Assurez-vous que la version Foundry VTT est compatible (v13.0+)

### "Les styles/scripts ne se chargent pas"
- ✅ Vérifiez que les chemins dans `system.json` sont corrects
- ✅ Testez en rechargant la page (F5)
- ✅ Vérifiez la console du navigateur (F12) pour les erreurs

### "Les fichiers ZIP ne téléchargent pas"
- ✅ Assurez-vous que l'URL du ZIP dans `system.json` est valide
- ✅ Testez directement l'URL dans un navigateur
- ✅ Vérifiez que la release GitHub est publiquée (non en brouillon)

---

## 📚 Ressources Utiles

- **Foundry VTT Documentation** : https://foundryvtt.com/article/system-development/
- **Manifests Publics** : https://foundryvtt.com/packages/
- **GitHub Help** : https://docs.github.com/en
- **Markdown Guide** : https://www.markdownguide.org/

---

## 📞 Support

Pour toute question ou problème :
1. Ouvrez une **GitHub Issue** : https://github.com/nawack/merc2/issues
2. Contactez l'auteur directement
3. Consultez la communauté Foundry VTT : https://forums.foundryvtt.com/

Bon développement ! 🚀
