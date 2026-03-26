# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## [1.0.16] - 2026-03-26

### Added
- 🛡️ **Fiches Armure, Équipement, Trait** : Nouveaux types d'items avec fiches dédiées — champs communs : `rarity`, `price`, `weightKg`, `description`
- 🎨 **Schéma de corps SVG — Fiche armure** : Diagramme interactif de 20 zones de localisation (bonhomme vue de face) avec columns d'inputs GCH (gauche) et DR (droite) positionnées autour du SVG
- 🔢 **Numéros de zone dans les labels** : Chaque input de localisation affiche son numéro (ex : `Crâne (20)`, `Poitrine G (16)`, `Pied D (2)`…)

### Changed
- 🎨 **Style des inputs de localisation** : Harmonisé avec les inputs des champs généraux (bordure `#dcdcdc`, padding `3px 6px`, focus identique, labels en `text-transform: uppercase`)
- 📐 **Positionnement des lignes d'input** : Pas uniforme de **32 px** (5, 37, 69, 101 … 357 px) — suppression des chevauchements et des écarts irréguliers

---

## [1.0.15] - 2026-03-25

### Added
- 🎯 **Jet de compétence depuis l'onglet Combat** : Bouton `🎯` sur chaque ligne de dégâts de base (Mêlée, Armes de taille, spécialisations corps-à-corps) pour lancer directement le jet de compétence liée (d20 + Degré + Bonus) dans le chat

### Fixed
- 🐛 **Erreur de syntaxe `migrateItem`** : Accolade fermante parasite qui fermait prématurément le bloc `if (item.type === "weapon")`, repoussant les checks `barrelLength`, `defaultAmmo*` et `obsoleteWeapon` hors du guard

### Changed
- 🗂️ **Documentation** : Suppression de 7 fichiers de suivi interne, mise à jour des schémas, index et changelog

---

## [1.0.14] - 2026-03-25

### Changed
- 🗂️ **Documentation** : Simplification et refactoring — suppression de 7 fichiers de suivi interne, mise à jour des schémas et du changelog

---

## [1.0.13] - 2026-03-25

### Changed
- 🔄 **Gestion des munitions en combat** : Onglet Combat de la fiche personnage — tableau de munitions avec affichage `inMag/magCapacity - magFull/magTotal - stock` pour les munitions par défaut et liées
- 🔄 **Malus de portée** : Sous-ligne de malus par portée (C/M/L/X) avec distance et pénalité de pénétration affinée
- 🔄 **Arme sans munition par défaut** : La fiche d'arme se replie maintenant sur la première munition liée si aucune munition par défaut n'est définie
- 🔄 **Rafraîchissement automatique** : La fiche d'arme se met à jour automatiquement lorsqu'une munition liée est modifiée (hook `updateItem`)

### Fixed
- 🐛 **Ligne munition par défaut** : Masquée si aucune munition par défaut n'est définie (`{{#if wb.default}}`)

---

## [1.0.12] - 2026-03-25

### Added
- 🔫 **Moteur balistique physique** : Calcul des dégâts et de la pénétration par physique réelle (énergie cinétique, frein d'air)
  - `calcWeaponBallistics(barrelLength, ammoSystem, ranges)` → dégâts, vitesse initiale, énergie, pénétration et malus par portée
  - `calcAmmoDerived(mass, diameter, coeff_trainee, rho)` → `braking_index` et `sectional_density` calculés automatiquement
  - `calcDamageFromEnergy(energy)` et `calcBlindageMalus(energy, pen)` pour conversion en jeu
- 📦 **Nouveau schéma munitions** : Remplacement de `quantity`/`maxQuantity` par 5 champs sémantiques : `magCapacity`, `inMag`, `magFull`, `magTotal`, `stock`
- 🔧 **Champs munitions par défaut sur arme** : `defaultAmmoMagCapacity`, `defaultAmmoInMag`, `defaultAmmoMagFull`, `defaultAmmoMagTotal`, `defaultAmmoStock`
- 🗂️ **Fiche munition redessinée** : Grille balistique unifiée (4 colonnes, 8 propriétés physiques + 2 valeurs déduites en lecture seule), section Stock simplifiée (Rareté + Prix uniquement)
- 🗂️ **Fiche arme — section munitions inline** : 5 champs de stock par munition liée, affichage des malus de pénétration par portée

### Changed
- 🔄 **`system.damage`** : N'est plus calculé ni stocké — remplacé par le calcul balistique temps-réel
- 🔄 **Onglet Tactique arme** : Champ `magazine` (capacité chargeur standard) supprimé de l'affichage (redondant avec les champs munitions)

### Migration
- ⬆️ **`migrateItem` arme** : Initialise les 5 nouveaux champs `defaultAmmoXxx`, supprime `magazine`
- ⬆️ **`migrateItem` munition** : `quantity` → `inMag`, `maxQuantity` → `magCapacity`, `magazines` → `magTotal` ; champs obsolètes supprimés (`quantity`, `maxQuantity`, `magazines`, `magEmpty`, `weightAmmo`, `damage`, `penetration`)

---

## [1.0.11] - 2026-03-10

### Added
- 🚗 **Fiche Véhicule** : Nouveau type d'acteur `vehicle` avec fiche dédiée
  - Champs : Prix, Rareté, Fire Control Bonus, Type de carburant (7 options), Stabilisation, Chargement (T), PTAC (T), Équipage, Maintenance, Vision de nuit (4 options), NRBC (3 options), TR Mov, Com Mov, Fuel Cap, Fuel Cons
  - Image de véhicule cliquable (FilePicker Foundry natif)
  - Zone de notes libre
  - Gestion complète des armes et munitions (identique à la fiche personnage)
  - Jets de dégâts avec format "arme (munition)" dans le chat
  - Jets de compétence arme utilisant le Fire Control Bonus comme modificateur
  - Drag & drop ammo sur les armes
  - Suppression en cascade arme → munitions liées
  - Boutons +/− sur tous les champs numériques avec affichage des unités
- 🔧 **Migration véhicule** : Tous les champs véhicule migrés automatiquement via `getActorMigrationData()`
- 🛡️ **preCreateActor** : Le hook ne force plus les données personnage sur les acteurs de type véhicule

### Technical
- Classe `MercVehicleSheet` dans `scripts/system.js`
- Template `templates/actor/vehicle-sheet.hbs`
- Type `vehicle` déclaré dans `system.json` et `template.json`
- Migration `getActorMigrationData()` étendue avec branche `actor.type === "vehicle"`
- Traductions FR/EN complètes sous la clé `MERC.Vehicle.*`
- CSS dédié `.merc.sheet.actor.vehicle` dans `style.css`

---

## [1.0.9] - 2026-02-06

### Added
- 🎛️ **Tracker segments** : contrôles de segment dans le Combat Tracker
- 👥 **Éligibilité** : affichage des combattants grisés selon le segment

### Changed
- ⚔️ **Ordre de combat** : tri par Réaction décroissante
- 🧩 **Initiative** : remplacement visuel par la valeur de Réaction
- 🧹 **Interface** : masquage des boutons de jets d'initiative

---

## [1.0.8] - 2026-02-05

### Changed
- ⚡ **Réaction** : le degré est calculé avec $dev + base$ pour cette compétence

---

## [1.0.7] - 2026-02-05

### Added
- 📝 **Onglet Notes** : ajout d’un onglet Notes avec sauvegarde persistante

### Changed
- 🧩 **Header** : regroupement infos + onglets dans un bloc à deux colonnes
- 🧾 **Champs header** : inputs plus discrets (soulignement pointillé)
- 📏 **Largeur minimale** : feuille de personnage à 570px min
- 🧭 **Onglets** : affichage sur deux lignes et alignement en bas du header
- 🧍 **Genre** : libellés en info-bulle (icônes seules)

---

## [1.0.6] - 2026-02-03

### Added
- 🎯 **Système de Maîtrise d'arme** : Ajout d'un champ "Maîtrise" (Oui/Non) sur les armes pour bonus +3 aux jets pour toucher
- ⭐ **Indicateur visuel** : Étoile jaune affichée à côté du nom des armes maitrisées dans la fiche de personnage
- 📦 **Système d'Encombrement** : Calcul automatique du poids total des items
- 🎨 **Niveaux d'Encombrement** : 4 niveaux avec couleurs dynamiques (vert/jaune/orange/rouge)
- 🏃 **Vitesses actuelles** : Calcul des vitesses affectées par le niveau d'encombrement
- 🔧 **Migration automatique** : Les anciens personnages et items sont mis à jour automatiquement
- ✅ **Formule corrigée** : Capacité de charge = (Force + Constitution) × 2
- 🔫 **Système de gestions des armes v1** : Interface complète pour gérer les armes avec compétences liées et dégâts

### Fixed
- 🐛 **Affichage proficiency** : Correction du select qui n'affichait pas la valeur enregistrée
- 🐛 **Migration backwards compatibility** : Système complet pour assurer la compatibilité avec les anciennes données

### Changed
- 🎨 **UI Armes** : Masquage des champs "Type de munition", "Capacité de chargeur" et "Portées"
- 📘 **Documentation** : Mise à jour des guides d'implémentation

---

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
