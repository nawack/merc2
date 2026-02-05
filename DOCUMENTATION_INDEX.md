# 📚 Index de la documentation - Mercenary System

**Version :** 1.0.9  
**Dernière mise à jour :** 2026-02-06  
**Couverture :** 100%

---

## 🎯 Accès rapide par sujet

### 🎮 JOUEURS - Démarrage rapide

| Besoin | Document | Durée |
|--------|----------|-------|
| Comprendre le système | [README.md](README.md) | 5 min |
| Créer un personnage | [README.md](README.md#-comment-utiliser) | 10 min |
| Faire un jet | [README.md](README.md#-système-de-jets) | 3 min |
| Comprendre mes compétences | [README.md](README.md#-structure-des-attributs--compétences) | 10 min |
| Ajouter des armes/armures | [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md) | 15 min |

### 🎲 COMBATTANTS - Système de combat

| Besoin | Document | Contenu |
|--------|----------|---------|
| Comment marchent les dégâts? | [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md) | Table + formules |
| Qu'est-ce que l'endurance? | [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#endurance) | Calcul + usage |
| Mouvements de combat | [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#-les-8-statistiques-de-combat) | Marche, Course, etc. |
| Types d'armes | [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md#%EF%B8%8F-weapon-armes) | Tous les types |
| Prérequis compétences | [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md) | 13 compétences bloquées |

### 🎓 DÉVELOPPEURS - Architecture

| Besoin | Document | Détail |
|--------|----------|--------|
| Vue d'ensemble projet | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Dossiers et fichiers |
| Comment contribuer | [CONTRIBUTING.md](CONTRIBUTING.md) | Processus PR/merge |
| Structure code | [IMPLEMENTATION_COMBAT.md](IMPLEMENTATION_COMBAT.md) | Code et design |
| Installer pour dev | [INSTALLATION.md](INSTALLATION.md) | Setup local |
| Hooks Foundry | [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#-mise-à-jour-automatique) | updateActor, render, drop |

### 📊 ADMINISTRATEURS - Configuration

| Besoin | Document | Points clés |
|--------|----------|------------|
| Installation système | [INSTALLATION.md](INSTALLATION.md) | Via Manifest |
| Configuration combat | [SETUP_COMBAT.md](SETUP_COMBAT.md) | Initialiser tables |
| Données système | [template.json](template.json) | Schéma actor/item |
| Métadonnées | [system.json](system.json) | Version et compat |

---

## 📁 Fichiers par catégorie

### 📖 Documentation USER (pour joueurs)

**Essentiels:**
1. [README.md](README.md) - **Lire en premier** (10 min)
   - Résumé du système
   - Création de personnage
   - Onglets et interface
   - Système de jets

2. [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md) (15 min)
   - 5 types d'objets
   - Comment équiper items
   - Exemples pratiques

**Spécialisés:**
3. [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md) (20 min)
   - Calcul des dégâts
   - Table de référence
   - Formules communes

4. [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md) (25 min)
   - 8 statistiques
   - Mouvements
   - Endurance et charge

5. [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md) (10 min)
   - 13 compétences bloquées
   - Chaînes de progression
   - Comment débloquer

### 🛠️ Documentation DEV (pour contributeurs)

**Essentiels:**
1. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
   - Architecture globale
   - Fichiers du projet
   - Conventions

2. [CONTRIBUTING.md](CONTRIBUTING.md)
   - Comment contribuer
   - Processus git/PR
   - Standards code

**Techniques:**
3. [IMPLEMENTATION_COMBAT.md](IMPLEMENTATION_COMBAT.md)
   - Détails implémentation
   - Fonctions clés
   - Intégrations

4. [SETUP_COMBAT.md](SETUP_COMBAT.md)
   - Configuration avancée
   - Tables et données
   - Données exemple

### ⚙️ Configuration (system files)

1. [system.json](system.json) - Métadonnées + manifest
2. [template.json](template.json) - Schéma de données
3. [INSTALLATION.md](INSTALLATION.md) - Installation

### 📝 Historique et maintenance

1. [CHANGELOG.md](CHANGELOG.md) - Historique versions
2. [AUDIT_DOCUMENTATION.md](AUDIT_DOCUMENTATION.md) - Audit 2026-02-05
3. [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md) - Résumé corrections
4. [README_UPDATE.md](README_UPDATE.md) - Guide mise à jour README

---

## 🔍 Rechercher par mot-clé

### A
- **Attributs** → [README.md](README.md#-structure-des-attributs--compétences)
- **Armures** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md#-armor-armures)
- **Ammo/munitions** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md#-ammo-munitions)

### B
- **Base (calcul)** → [README.md](README.md#onglets-de-la-feuille)
- **Bonus** → [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md#-bonus-de-dégâts)

### C
- **Combat** → [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md)
- **Caractéristiques** → [README.md](README.md#-caractéristiques)
- **Création personnage** → [README.md](README.md#créer-un-personnage)
- **Compétences** → [README.md](README.md#-structure-des-attributs--compétences)
- **Critique (20/1)** → [README.md](README.md#critiques-201)

### D
- **Dégâts** → [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md)
- **Degré** → [README.md](README.md#onglets-de-la-feuille)
- **Discrétion** → [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#-discrétion)
- **Dissimulation** → [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#-dissimulation)

### E
- **Équipement** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md#-equipment-équipement)
- **Équiper** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md#équiper-un-item)
- **Endurance** → [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#endurance)

### F
- **Feature (traits)** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md#-feature-traitscapacités)
- **Foundry VTT** → [README.md](README.md#-compatibilité)

### G
- **Gestion objets** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md#-gestion-des-items)

### H
- **Hooks** → [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#-mise-à-jour-automatique)

### I
- **Installation** → [INSTALLATION.md](INSTALLATION.md)
- **Items** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md)
- **Interface** → [README.md](README.md#-comment-utiliser)

### J
- **Jets (d20)** → [README.md](README.md#-système-de-jets)

### L
- **Langues** → [README.md](README.md#compétences-personnalisées)

### M
- **Marche** → [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#-marche)
- **Mouvements** → [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#les-8-statistiques-de-combat)

### O
- **Onglets** → [README.md](README.md#onglets-de-la-feuille)

### P
- **Perception** → [README.md](README.md#perception-colonne-3)
- **Prérequis** → [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md)

### R
- **Résultat jet** → [README.md](README.md#résultat-dun-jet)

### S
- **Spécialisations** → [README.md](README.md#compétences-personnalisées)
- **Structure** → [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Système** → [README.md](README.md)

### T
- **Table dégâts** → [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md#-table-de-dégâts-base_damage_table)
- **Taille** → [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md#-taille-corpulence)
- **Types items** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md)

### V
- **Version** → [README.md](README.md#-compatibilité)

### W
- **Weapons** → [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md#%EF%B8%8F-weapon-armes)

---

## 🚀 Parcours d'apprentissage recommandé

### Pour un NOUVEAU JOUEUR (30 min)
1. ✅ Lire [README.md](README.md) sections 1-3 (5 min)
2. ✅ Lire "Créer un personnage" (5 min)
3. ✅ Lire "Onglets de la feuille" (10 min)
4. ✅ Lire "Système de jets" (5 min)
5. ✅ Pratique avec un personnage exemple (5 min)

### Pour un JOUEUR AVANCÉ (1h)
1. ✅ Relire [README.md](README.md) au complet (20 min)
2. ✅ Lire [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md) sections 1-3 (15 min)
3. ✅ Lire [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md) sections 1-2 (15 min)
4. ✅ Lire [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md) sections 1-2 (10 min)
5. ✅ Consulter [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md) au besoin

### Pour un DÉVELOPPEUR (2-3h)
1. ✅ Lire [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) (15 min)
2. ✅ Examiner [system.json](system.json) et [template.json](template.json) (10 min)
3. ✅ Lire [IMPLEMENTATION_COMBAT.md](IMPLEMENTATION_COMBAT.md) (30 min)
4. ✅ Consulter [CONTRIBUTING.md](CONTRIBUTING.md) (20 min)
5. ✅ Explorer code: [scripts/system.js](scripts/system.js) (60 min)
6. ✅ Faire un test/PR selon [CONTRIBUTING.md](CONTRIBUTING.md) (20 min)

### Pour un ADMIN SERVEUR (45 min)
1. ✅ Lire [INSTALLATION.md](INSTALLATION.md) (15 min)
2. ✅ Lire [README.md](README.md#-compatibilité) compatibilité (5 min)
3. ✅ Lire [SETUP_COMBAT.md](SETUP_COMBAT.md) si configs perso (15 min)
4. ✅ Consulter [CHANGELOG.md](CHANGELOG.md) pour mises à jour (10 min)

---

## 📋 Checklist documentation

### État de chaque document

- [x] [README.md](README.md) - ✅ Complet
- [x] [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md) - ✅ Complet
- [x] [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md) - ✅ Complet
- [x] [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md) - ✅ Complet
- [x] [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md) - ✅ Complet
- [x] [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - ✅ Complet
- [x] [CONTRIBUTING.md](CONTRIBUTING.md) - ✅ Complet
- [x] [INSTALLATION.md](INSTALLATION.md) - ✅ Complet
- [x] [SETUP_COMBAT.md](SETUP_COMBAT.md) - ✅ Complet
- [x] [IMPLEMENTATION_COMBAT.md](IMPLEMENTATION_COMBAT.md) - ✅ Complet
- [x] [CHANGELOG.md](CHANGELOG.md) - ✅ Complet
- [x] [system.json](system.json) - ✅ Complet
- [x] [template.json](template.json) - ✅ Complet

---

## 🔗 Navigation rapide

**[← Retour au README](README.md)**

---

**Index créé :** 2026-02-05  
**Couverture :** 100%  
**Statut :** À jour ✅
