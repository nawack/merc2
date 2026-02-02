# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [1.0.5] - 2026-02-02

### Added
- ✨ **Jets critiques** : sur 20 ou 1, un second d20 est lancé (ajouté/soustrait) et affiché
- 🎨 **UI jets** : badge et texte du breakdown colorés selon ajout/soustraction

### Changed
- 🧹 **Nettoyage** : suppression de logs console et refactor des calculs de stats
- 🧼 **CSS** : retrait de styles inutilisés et commentaires ajoutés

---

## [1.0.4] - 2026-02-01

### Added
- ✨ **Langue natale** : champ dédié pour préciser la langue affichée et utilisée dans les jets
- ✨ **Spécialisations personnalisées** : ajout/suppression/renommage avec sélection de compétence de base

### Changed
- 🔄 **Spécialisations** : retrait des spécialisations pré-définies (onglet conservé)
- 🎨 **UI Spécialisations** : sélecteur de compétence de base discret et cohérent avec le style des langues
- 📘 **Documentation** : mise à jour des descriptions, comptage des compétences et sections Langues/Spécialisations

---

## [1.0.3] - 2026-01-30

### Added
- ✨ **Langues personnalisées dynamiques** : Ajout/suppression de langues individuellement par acteur
- ✨ Chaque langue personnalisée utilise Intelligence comme attribut principal (calcul de base automatique)
- ✨ Format des labels "Langue : {nom}" avec possibilité de modifier le nom
- ✨ Système de calcul de degrés pour les langues dynamiques via table de progression

### Changed
- 🔄 **Onglet Langues** : Réorganisation avec section dédiée aux langues personnalisées

---

## [1.0.2] - 2026-01-30

### Fixed
- 🐛 **Synchronisation UI** : Correction du lag lors de la mise à jour des attributs (origine et courant)
- 🐛 **API Deprecated** : Mise à jour FilePicker vers namespace `foundry.applications.apps.FilePicker.implementation` (v13)
- 🐛 **Bouton Portrait** : Rendu plus discret (opacité réduite, taille réduite)

### Changed
- 🔄 **Nettoyage CSS** : Suppression de doublons et classes inutilisées (`.character-portrait`, `.header-row`, `.actor-*`, `.resources-*`)
- 🔄 **Optimisation** : Amélioration des performances avec suppression du code de debug

---

## [1.0.1] - 2026-01-30

### Added
- ✨ **Internationalisation complète** : Support bilingue Français/Anglais pour toute l'interface
- ✨ Traduction complète des 65 compétences en anglais
- ✨ Structure i18n hiérarchique avec clés MERC.UI.* et MERC.Skills.*

### Changed
- 🔄 **Réorganisation de l'interface** : Grille de statistiques de combat déplacée de l'onglet Combat vers l'onglet Attributs
- 🔄 **Renommage des onglets** : "Stats & Attributes" → "Attributs", "Combat & Mouvement" → "Combat"
- 🔄 Refactorisation des classes CSS : `.headerCombatStats` → `.headerStatsGrid`, `.combat-column` → `.stats-column`
- 🔄 Amélioration de la cohérence sémantique du code (suppression des préfixes "combat" dans les classes de statistiques)

### Technical
- Ajout de lang/en.json avec traductions complètes
- Utilisation systématique de `{{localize "MERC.*"}}` dans les templates Handlebars
- Localisation JavaScript avec `game.i18n.localize()` et `game.i18n.format()`

---

## [1.0.0] - 2026-01-30

### Added
- ✨ Système complet pour Foundry VTT v13
- ✨ 10 attributs principaux avec synchronisation automatique
- ✨ Perception avec 5 sous-attributs détaillés (Vue, Ouïe, Goût, Odorat, Toucher)
- ✨ 65 compétences organisées en 7 catégories (Combat, Aptitudes, Social, Langues, Connaissances, Construction, Spécialisations)
- ✨ Calcul automatique des degrés via table de progression (base 4-28, degrés -7 à +33)
- ✨ Système de jets D20 avec modificateurs dynamiques
- ✨ Sélection d'image de portrait via FilePicker Foundry natif
- ✨ Gestion des objets : Armes, Armures, Équipement
- ✨ Interface moderne avec onglets et colonnes multiples
- ✨ Indicateurs visuels pour les modificateurs (couleurs)
- ✨ Synchronisation attribution origine → actuelle
- ✨ Synchronisation perception → sous-attributs
- ✨ Système de prérequis de compétences
- ✨ Support multilingue (Français, Anglais)
- ✨ Validation des champs avec sauvegarde immédiate

### Technical
- Manifeste system.json complètement configuré pour installation via URL
- Scripts build PowerShell et Bash pour générer les releases
- Workflow GitHub Actions pour automatiser la création de releases
- Documentation complète (README, INSTALLATION)
- Structure de projet optimisée pour publication sur GitHub

---

## [Planifié pour futures versions]

### À venir
- 📋 Gestion des objets améliorée
- 📋 Système de statuts et conditions
- 📋 Amélioration du système de degrés
- 📋 Module d'images de portrait préselectionnées
- 📋 Système de faveurs/réputation
- 📋 Macros prédéfinies
- 📋 Fiche de campagne
- 📋 Support des tokens

---

## Format

Ce fichier suit le [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

### Types de changements
- **Added** : Nouvelles fonctionnalités
- **Changed** : Changements dans les fonctionnalités existantes
- **Deprecated** : Fonctionnalités qui seront bientôt supprimées
- **Removed** : Fonctionnalités supprimées
- **Fixed** : Corrections de bugs
- **Security** : Corrections de vulnérabilités de sécurité
- **Technical** : Changements techniques (dépendances, structure, etc.)

---

## Comment Signaler un Bug

Si vous trouvez un bug, veuillez ouvrir une issue sur GitHub :
https://github.com/nawack/merc2/issues

Décrivez :
- 🐛 La description du bug
- 📝 Les étapes pour reproduire
- 🖼️ Des captures d'écran si possible
- 💻 Votre version Foundry VTT
- 🌐 Votre navigateur

---

## Contribution

Les contributions sont bienvenues ! Consultez le [guide de contribution](CONTRIBUTING.md) pour savoir comment démarrer.
