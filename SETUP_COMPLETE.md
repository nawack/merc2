# 📦 Mercenary System - Configuration d'Installation via Manifest URL

## ✅ Résumé de la Configuration

Votre système **Mercenary System** est maintenant **100% prêt** à être installé via URL manifest sur Foundry VTT !

---

## 📋 Fichiers Créés / Modifiés

### Configuration Système
- ✅ **system.json** - Manifest Foundry avec URLs GitHub complètes
- ✅ **template.json** - Schéma des données
- ✅ **.gitignore** - Configuration Git pour éviter les fichiers inutiles

### Scripts de Build
- ✅ **build-release.ps1** - Script PowerShell pour créer les releases (Windows)
- ✅ **build-release.sh** - Script Bash pour créer les releases (Linux/macOS)

### Fichiers du Système
- ✅ **scripts/system.js** - Code principal (1300+ lignes)
- ✅ **css/style.css** - Styles (1000+ lignes)
- ✅ **templates/actor/character-sheet.hbs** - Template HTML
- ✅ **lang/en.json** - Traductions anglaises
- ✅ **lang/fr.json** - Traductions françaises

### Documentation
- ✅ **README.md** - Guide utilisateur principal
- ✅ **INSTALLATION.md** - Instructions d'installation détaillées
- ✅ **CONTRIBUTING.md** - Guide de contribution
- ✅ **CHANGELOG.md** - Historique des versions
- ✅ **PROJECT_STRUCTURE.md** - Description de l'architecture
- ✅ **PUBLISH_CHECKLIST.md** - Étapes pour publier
- ✅ **Ce fichier** - Résumé de la configuration

### Automatisation GitHub
- ✅ **.github/workflows/release.yml** - Workflow GitHub Actions pour les releases automatiques

---

## 🎯 Configuration Manifest URL

### URL d'Installation (Manifest)
```
https://raw.githubusercontent.com/YOUR_USERNAME/FoundryVTT-MercenarySystem/main/system.json
```

### URL de Téléchargement (Release)
```
https://github.com/YOUR_USERNAME/FoundryVTT-MercenarySystem/releases/download/v1.0.0/merc-system-1.0.0.zip
```

**⚠️ À Remplacer** : `YOUR_USERNAME` par votre nom d'utilisateur GitHub

### Où Ces URLs Sont Utilisées

Dans `system.json` :
```json
{
  "manifest": "https://raw.githubusercontent.com/YOUR_USERNAME/FoundryVTT-MercenarySystem/main/system.json",
  "download": "https://github.com/YOUR_USERNAME/FoundryVTT-MercenarySystem/releases/download/v1.0.0/merc-system-1.0.0.zip",
  "url": "https://github.com/YOUR_USERNAME/FoundryVTT-MercenarySystem"
}
```

---

## 🚀 Comment Ça Marche

### Pour les Utilisateurs

1. **Dans Foundry VTT** → **Game Settings** → **System & Module Management**
2. **Install System** → Coller l'URL Manifest
3. **Install** → Attendez quelques secondes
4. **Créer un Monde** → Sélectionner "Mercenary System"

### Mises à Jour Automatiques

- Foundry VTT vérifie automatiquement la version dans `system.json`
- Si une version plus récente est disponible, une notification apparaît
- L'utilisateur peut mettre à jour en un clic

---

## 📦 Étapes pour Mettre en Ligne

### 1️⃣ Créer le Dépôt GitHub (5 min)

```bash
# Créez un repo "FoundryVTT-MercenarySystem" sur GitHub
# Puis :

git clone https://github.com/YOUR_USERNAME/FoundryVTT-MercenarySystem.git
cd FoundryVTT-MercenarySystem

# Copiez tous les fichiers du système ici
# Puis :

git add .
git commit -m "Initial commit: Mercenary System v1.0.0"
git push origin main
```

### 2️⃣ Créer une Release (10 min)

```bash
# Sur GitHub :
# 1. Allez à "Releases" → "Create new release"
# 2. Tag : v1.0.0
# 3. Uploadez le ZIP créé par build-release.ps1/sh
# 4. Publiez la release
```

### 3️⃣ Tester l'Installation (5 min)

- Ouvrez Foundry VTT
- Game Settings → Install System
- Collez votre URL Manifest
- Vérifiez que ça marche !

---

## ✨ Fonctionnalités Incluses

### Pour les Joueurs
- ✅ Création de personnages complète
- ✅ 10 attributs avec synchronisation automatique
- ✅ 65 compétences organisées
- ✅ Système de jets D20 automatisé
- ✅ Sélection de portrait via FilePicker
- ✅ Gestion des objets (armes, armures, équipement)
- ✅ Multilingue (FR/EN)

### Pour les Développeurs
- ✅ Code bien structuré et commenté
- ✅ Architecture extensible
- ✅ Guide de contribution clair
- ✅ Documentation complète
- ✅ Scripts de build automatisés

---

## 📋 Checklist Avant de Publier

- [ ] Avez-vous créé un compte GitHub ?
- [ ] Avez-vous créé le dépôt ?
- [ ] Avez-vous poussé le code vers GitHub ?
- [ ] Avez-vous remplacé `YOUR_USERNAME` partout ?
- [ ] Avez-vous créé une release avec un ZIP ?
- [ ] Avez-vous testé l'installation via Manifest URL ?
- [ ] Avez-vous testé le système dans Foundry ?

---

## 🆘 Questions Courantes

**Q: Où mettre `YOUR_USERNAME` ?**
A: Dans `system.json`, les documentation files, et le README.md

**Q: Comment générer le ZIP ?**
A: 
- Windows : `.\build-release.ps1 -version "1.0.0"`
- Linux/macOS : `./build-release.sh 1.0.0`

**Q: Les utilisateurs peuvent-ils mettre à jour automatiquement ?**
A: Oui ! Foundry VTT vérifie la version et propose les mises à jour

**Q: Je dois payer pour GitHub ?**
A: Non, c'est 100% gratuit pour les projets publics

**Q: Puis-je faire des mises à jour plus tard ?**
A: Oui, à tout moment ! Bump la version et créez une nouvelle release

---

## 📚 Prochaines Ressources

- **Installation Guide** : [INSTALLATION.md](INSTALLATION.md)
- **Publish Checklist** : [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md)
- **Contributing Guide** : [CONTRIBUTING.md](CONTRIBUTING.md)
- **Project Structure** : [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

## 🎉 Vous Êtes Prêt !

Votre système Mercenary System est maintenant prêt à être partagé avec la communauté Foundry VTT ! 

**Prochaine étape** : Publiez sur GitHub et partagez l'URL Manifest ! 🚀

---

**Date** : 2026-01-30  
**Version du Système** : 1.0.0  
**État** : ✅ Prêt pour Publication
