# Guide d'Installation

Ce guide explique comment installer le Mercenary System sur Foundry VTT.

> Pour publier une release ou mettre à jour le système : [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md)

## 📦 Installer le Système

### Option 1 : Installation via URL Manifest (Recommandée)

1. **Ouvrez Foundry VTT**
2. Allez dans **Game Settings** → **System & Module Management**
3. Cliquez sur **Install System**
4. Dans le champ **Manifest URL**, collez :
   ```
   https://raw.githubusercontent.com/nawack/merc2/main/system.json
   ```
5. Cliquez sur **Install**
6. Créez un nouveau monde et sélectionnez **Mercenary System**

**Avantages :** mises à jour automatiques, installation en un clic.

### Option 2 : Installation Manuelle

1. **Téléchargez** le dossier complet `merc` depuis [github.com/nawack/merc2](https://github.com/nawack/merc2)
2. **Localisez** le dossier `Data/systems/` :
   - Windows : `C:\Users\<nom>\AppData\Local\FoundryVTT\Data\systems\`
   - macOS : `~/Library/Application Support/FoundryVTT/Data/systems/`
   - Linux : `~/.local/share/FoundryVTT/Data/systems/`
3. **Placez** le dossier `merc` dans `Data/systems/`
4. **Relancez** Foundry VTT et créez un monde avec **Mercenary System**

---

## 🔄 Mises à Jour

Une fois installé via Manifest URL, Foundry détecte automatiquement les nouvelles versions.

Pour une installation manuelle : répétez la procédure en remplaçant le dossier `merc`.

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

## � Support

Ouvrez une issue : **https://github.com/nawack/merc2/issues**  
Forum Foundry : https://forums.foundryvtt.com/

