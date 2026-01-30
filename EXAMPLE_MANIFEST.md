# Exemple Concret d'Installation

## Exemple : Si votre GitHub username est "jerome-dev"

### URLs Finales Après Publication

```
Manifest URL (à coller dans Foundry) :
https://raw.githubusercontent.com/jerome-dev/FoundryVTT-MercenarySystem/main/system.json

Download URL (dans system.json) :
https://github.com/jerome-dev/FoundryVTT-MercenarySystem/releases/download/v1.0.0/merc-system-1.0.0.zip

Repository URL :
https://github.com/jerome-dev/FoundryVTT-MercenarySystem
```

### Dans system.json, vous auriez :

```json
{
  "id": "merc",
  "title": "Mercenary System",
  "description": "Un système de jeu de rôle basé sur des attributs et des compétences avec des jets de D20.",
  "version": "1.0.0",
  "compatibility": {
    "minimum": "13.0",
    "verified": "13.351",
    "maximum": "13.351"
  },
  "authors": [
    {
      "name": "jerome-dev",
      "email": "jerome@example.com"
    }
  ],
  "scripts": ["scripts/system.js"],
  "styles": ["css/style.css"],
  "languages": [
    {"lang": "en", "name": "English", "path": "lang/en.json"},
    {"lang": "fr", "name": "Français", "path": "lang/fr.json"}
  ],
  "documentTypes": {
    "Actor": {
      "character": {"templates": ["base"]},
      "npc": {"templates": ["base"]}
    },
    "Item": {
      "weapon": {},
      "armor": {},
      "equipment": {},
      "feature": {}
    }
  },
  "url": "https://github.com/jerome-dev/FoundryVTT-MercenarySystem",
  "bugs": "https://github.com/jerome-dev/FoundryVTT-MercenarySystem/issues",
  "changelog": "https://github.com/jerome-dev/FoundryVTT-MercenarySystem/releases",
  "manifest": "https://raw.githubusercontent.com/jerome-dev/FoundryVTT-MercenarySystem/main/system.json",
  "download": "https://github.com/jerome-dev/FoundryVTT-MercenarySystem/releases/download/v1.0.0/merc-system-1.0.0.zip",
  "license": "MIT",
  "readme": "README.md",
  "flags": {}
}
```

## Étapes Exactes pour "jerome-dev"

### 1. Sur GitHub

```bash
# 1. Créer repo "FoundryVTT-MercenarySystem"
# 2. Cloner localement
git clone https://github.com/jerome-dev/FoundryVTT-MercenarySystem.git
cd FoundryVTT-MercenarySystem

# 3. Copier tous les fichiers du système
# (tous les fichiers que vous avez maintenant)

# 4. Valider et pousser
git add .
git commit -m "Initial commit: Mercenary System v1.0.0"
git push origin main
```

### 2. Créer une Release

```bash
# Sur GitHub.com, allez à : Releases → Create new release
# Tag: v1.0.0
# Title: Mercenary System v1.0.0
# Upload: merc-system-1.0.0.zip (créé par build-release.ps1)
# Publish
```

### 3. Dans Foundry VTT

```
Game Settings → System & Module Management → Install System

Coller :
https://raw.githubusercontent.com/jerome-dev/FoundryVTT-MercenarySystem/main/system.json

Cliquer : Install
```

### 4. Créer un Monde

```
Worlds → Create World
System: Mercenary System
Create
```

## Exemple de Release GitHub

**URL Release** :
```
https://github.com/jerome-dev/FoundryVTT-MercenarySystem/releases/tag/v1.0.0
```

**Contient** :
- ✅ merc-system-1.0.0.zip (fichier téléchargeable)
- ✅ Description et changelog
- ✅ Lien vers la documentation

## Partager Avec la Communauté

Une fois publié, vous pouvez partager :

**Message sur Forum Foundry** :
```
Mercenary System for Foundry VTT v13

A complete RPG system with 10 attributes, 65 skills, and automatic degree calculation.

Install with this Manifest URL:
https://raw.githubusercontent.com/jerome-dev/FoundryVTT-MercenarySystem/main/system.json

Repository: https://github.com/jerome-dev/FoundryVTT-MercenarySystem

Features:
- 10 main attributes
- 5 perception sub-attributes
- 65 skills organized in 7 categories
- D20 roll system
- Automatic degree calculation
- Multi-language support (French, English)
```

**Sur Discord** :
```
Just released Mercenary System for Foundry VTT!
📦 Manifest: https://raw.githubusercontent.com/jerome-dev/FoundryVTT-MercenarySystem/main/system.json
🚀 GitHub: https://github.com/jerome-dev/FoundryVTT-MercenarySystem
```

## Mises à Jour Futures

Si vous faites v1.0.1 :

1. Mettez à jour `system.json` version à "1.0.1"
2. Exécutez `build-release.ps1 -version "1.0.1"`
3. Sur GitHub, créez une nouvelle release v1.0.1
4. Uploadez le nouveau ZIP
5. Les utilisateurs reçoivent une notification de mise à jour ! ✅

---

Bonne chance avec votre publication ! 🚀
