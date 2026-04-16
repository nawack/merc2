# ✅ Checklist de Release — Mercenary System

Dépôt : **https://github.com/nawack/merc2**  
Manifest : `https://raw.githubusercontent.com/nawack/merc2/main/system.json`

---

## Avant chaque release

### Code & Configuration

- [ ] Version mise à jour dans `system.json`
- [ ] `compatibility.verified` à jour dans `system.json`
- [ ] `CHANGELOG.md` mis à jour avec les changements de cette version
- [ ] `ROADMAP.md` mis à jour (items complétés déplacés dans ✅, items planifiés nettoyés)

### Compendiums (si des données CSV ont changé)

```powershell
.\build-compendium.ps1
```

- [ ] Compendiums regénérés et testés dans Foundry

### Tests manuels

- [ ] Création d'un personnage — compétences initialisées
- [ ] Jets d'attributs et de compétences fonctionnels
- [ ] Drag & drop items (armes, armures, stockages)
- [ ] Onglet Combat — balistique et mêlée affichés correctement
- [ ] Onglet Santé — degrés de blessure et soins
- [ ] Fiche véhicule — équipage et cargaison
- [ ] Migration des acteurs existants sans perte de données

---

## Créer la release

### 1. Générer le ZIP

```powershell
.\build-release.ps1 -version "X.Y.Z"
# → releases/merc-system-X.Y.Z.zip
```

### 2. Publier sur GitHub

```bash
git add .
git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

Puis sur **https://github.com/nawack/merc2/releases/new** :
- Tag : `vX.Y.Z`
- Titre : `Mercenary System vX.Y.Z`
- Description : copier les notes du `CHANGELOG.md`
- Attacher le ZIP `merc-system-X.Y.Z.zip`
- Publier

### 3. Vérifier l'installation via Manifest

Dans Foundry VTT → Settings → Install System, coller :
```
https://raw.githubusercontent.com/nawack/merc2/main/system.json
```

---

## Messages de commit

- `feat:` — Nouvelle fonctionnalité
- `fix:` — Correction de bug
- `docs:` — Documentation uniquement
- `refactor:` — Refactorisation sans changement fonctionnel


### Phase 1 : Préparation GitHub (15 min)

1. **Créez un compte GitHub** (si vous n'en avez pas)
   - https://github.com/signup
   - Gratuit !

2. **Créez un nouveau dépôt** :
   - Nom : `FoundryVTT-MercenarySystem`
   - Description : "Un système de jeu de rôle pour Foundry VTT basé sur des attributs et des compétences"
   - Visibilité : **Public**
   - Cochez "Initialize with README" : ✓ (optionnel, vous avez déjà README.md)
   - Licence : **MIT License**

3. **Cloquez et initialisez** :
   ```bash
   git clone https://github.com/YOUR_USERNAME/FoundryVTT-MercenarySystem.git
   cd FoundryVTT-MercenarySystem
   git add .
   git commit -m "Initial commit: Mercenary System v1.0.0"
   git push origin main
   ```

### Phase 2 : Configuration de Manifest URLs (5 min)

Les URLs seront :
```
Manifest URL (installation) :
https://raw.githubusercontent.com/YOUR_USERNAME/FoundryVTT-MercenarySystem/main/system.json

Download URL (releases) :
https://github.com/YOUR_USERNAME/FoundryVTT-MercenarySystem/releases/download/v1.0.0/merc-system-1.0.0.zip
```

Remplacez `YOUR_USERNAME` par votre nom d'utilisateur GitHub dans :
- `system.json`
- Documents de documentation

### Phase 3 : Créer une Release (10 min)

1. **Sur votre dépôt GitHub** :
   - Cliquez sur **Releases** (à droite)
   - Cliquez sur **Create a new release**

2. **Remplissez les informations** :
   - **Tag version** : `v1.0.0`
   - **Release title** : `Mercenary System v1.0.0 - Initial Release`
   - **Description** :
     ```markdown
     # Mercenary System v1.0.0 - Initial Release

     Welcome to the Mercenary System for Foundry VTT!

     ## Features
     - 10 main attributes with automatic calculation
     - 5 perception sub-attributes (Sight, Hearing, Taste, Smell, Touch)
     - 65 skills organized in 7 categories
     - Automatic degree calculation from progression tables
     - D20 roll system with dynamic modifiers
     - Native FilePicker for portrait selection
     - Item management (Weapons, Armor, Equipment)
     - Multi-language support (French, English)

     ## Installation
     Use this Manifest URL in Foundry:
     ```
     https://raw.githubusercontent.com/YOUR_USERNAME/FoundryVTT-MercenarySystem/main/system.json
     ```

     ## Changelog
     See [CHANGELOG.md](CHANGELOG.md) for more details.
     ```

3. **Attachez le fichier ZIP** :
   - Sur votre ordinateur, créez le ZIP :
     - Windows : Utilisez `build-release.ps1` :
       ```powershell
       .\build-release.ps1 -version "1.0.0"
       ```
     - Linux/macOS : Utilisez `build-release.sh` :
       ```bash
       chmod +x build-release.sh
       ./build-release.sh 1.0.0
       ```
   - Le ZIP sera créé dans le dossier `releases/`
   - Uploadez-le dans la section "Attach binaries"

4. **Cliquez sur "Publish release"**

### Phase 4 : Tester l'Installation (5 min)

1. **Ouvrez Foundry VTT**
2. Allez à **Settings → System & Module Management**
3. Cliquez sur **Install System**
4. Collez l'URL Manifest :
   ```
   https://raw.githubusercontent.com/YOUR_USERNAME/FoundryVTT-MercenarySystem/main/system.json
   ```
5. Cliquez sur **Install**
6. Vérifiez que le système s'installe correctement
7. Créez un nouveau monde avec ce système
8. Testez que tout fonctionne : attributs, compétences, jets, portrait, etc.

---

## 📝 Template de Commit pour GitHub

Pour des commits cohérents :
```bash
git add .
git commit -m "feat: Add FilePicker support for portrait selection"
git push origin main
```

Formats de message :
- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage du code
- `refactor:` - Refactorisation du code
- `test:` - Tests

---

## 🔄 Pour les Futures Mises à Jour

1. Apportez vos modifications
2. Mettez à jour la version dans `system.json` (ex: 1.0.1)
3. Mettez à jour `CHANGELOG.md`
4. Committez et pushez :
   ```bash
   git add .
   git commit -m "Version 1.0.1: Description des changements"
   git push origin main
   ```
5. Créez une nouvelle release sur GitHub
6. Utilisateurs ayant installé via Manifest URL recevront une notification

---

## 🎯 Prochaines Étapes Recommandées

### Court Terme (après publication)
- [ ] Tester dans plusieurs navigateurs
- [ ] Recueillir les retours utilisateurs
- [ ] Corriger les bugs signalés
- [ ] Améliorer la documentation basée sur les questions

### Moyen Terme
- [ ] Ajouter un système de statuts/conditions
- [ ] Améliorer la gestion des objets
- [ ] Ajouter un système de faveurs/réputation
- [ ] Créer des macros prédéfinies

### Long Terme
- [ ] Support des modules
- [ ] Intégration avec des systèmes externes
- [ ] Localisations supplémentaires
- [ ] Documentation vidéo/tutoriels

---

## 📚 Ressources Importantes

- **Manuel GitHub** : https://docs.github.com/
- **Doc Foundry** : https://foundryvtt.com/article/system-development/
- **Forums Foundry** : https://forums.foundryvtt.com/
- **Community Packages** : https://foundryvtt.com/packages/

---

## 🆘 Besoin d'Aide ?

### Erreurs Courantes

**"Le système ne s'installe pas"**
- ✅ Vérifiez que `system.json` est valide (https://jsonlint.com)
- ✅ Vérifiez que l'URL Manifest est correcte
- ✅ Vérifiez la console du navigateur (F12) pour les erreurs

**"Les fichiers CSS/JS ne se chargent pas"**
- ✅ Vérifiez les chemins dans `system.json`
- ✅ Rechargez la page (Ctrl+F5)
- ✅ Videz le cache du navigateur

**"Git dit "détached HEAD"**
- ✅ Exécutez : `git checkout main`

### Ressources d'Aide
1. [GitHub Discussions](https://github.com/yourusername/FoundryVTT-MercenarySystem/discussions)
2. [Forums Foundry VTT](https://forums.foundryvtt.com/)
3. [Documentation Officielle](https://foundryvtt.com/article/system-development/)

---

## ✨ Félicitations !

Vous avez créé un système Foundry VTT complet et installable ! 🎉

**Prochaine étape** : Publiez sur GitHub et partagez l'URL Manifest avec la communauté !

---

**Créé** : 2026-01-30  
**Version** : 1.0.1  
**Statut** : ✅ Prêt pour publication
