# Roadmap - Mercenary System

**Mise à jour :** 2026-04-03  
**Version courante :** 1.1.4  
**Source :** `.todo`

---

## ✅ Complété

### v1.1.0 — Accessoires + consolidation 1.0.x (2026-04-01)
> La v1.1.0 intègre l'ensemble des fonctionnalités développées au fil des versions 1.0.x.

**Fondations (v1.0.0)**
- Système complet pour Foundry VTT v13 — 10 attributs principaux, perception avec 5 sous-attributs
- 65 compétences organisées en 7 catégories avec calcul automatique des degrés (table de progression)
- Système de jets D20 avec modificateurs dynamiques et internationalisation FR/EN
- Gestion des objets de base : Armes, Armures, Équipement

**Personnage & Compétences (v1.0.1 → v1.0.8)**
- Support bilingue complet (FR/EN) — 65 compétences traduites, clés `MERC.UI.*` / `MERC.Skills.*`
- Langues personnalisées dynamiques par acteur (ajout/suppression/renommage, langue natale)
- Spécialisations personnalisées (ajout/suppression, base = compétence origine ÷ 2)
- Jets critiques D20 illimité : sur 20 relancer et ajouter, sur 1 relancer et soustraire
- Maîtrise d'arme (bonus +3, indicateur étoile)
- Système d'encombrement (capacité = (FOR+CON)×2, 4 niveaux colorés, vitesses affectées)
- Onglet Notes avec sauvegarde persistante
- Réaction calculée avec base (ADA/RAP + dev)

**Combat Tracker (v1.0.9)**
- Tracker segments avec contrôle segment/tour/round dans la fenêtre
- Tri automatique par degré de réaction, éligibilité par segment, boutons désactivés aux limites
- Masquage des boutons d'initiative natifs Foundry

**Véhicule (v1.0.11)**
- Fiche Véhicule (`vehicle`) avec tous les champs tactiques (Fire Control Bonus, carburant, stabilisation, NRBC, vision de nuit…)
- Gestion des armes et munitions identique à la fiche personnage (drag & drop, suppression en cascade)
- Jets de dégâts et de compétence (Fire Control Bonus comme modificateur)

**Moteur Balistique (v1.0.12 → v1.0.13)**
- `calcWeaponBallistics()` : dégâts, vitesse initiale, énergie cinétique, pénétration et malus par portée (physique réelle)
- `calcAmmoDerived()` : `braking_index` et `sectional_density` calculés automatiquement
- Nouveau schéma munitions : `magCapacity`, `inMag`, `magFull`, `magTotal`, `stock`
- Fiche munition redessinée (grille balistique 4 col., 8 propriétés physiques, 2 valeurs déduites)
- Tableau munitions en combat avec affichage `inMag/magCapacity - magFull/magTotal`
- Malus de portée (C/M/L/X) et pénalité de pénétration par ligne
- Jet de compétence depuis l'onglet Combat (bouton 🎯 sur chaque ligne dégâts de base)

**Armures, Équipements & Santé (v1.0.16 → v1.0.17)**
- Fiches Armure et Équipement (rareté, prix, poids, description)
- Schéma de corps SVG 20 zones — vue de face, inputs GCH/DR positionnés autour du silhouette
- Onglet Santé : points d'armure cumulés par localisation (badge 🛡️)
- Dégâts mêlée : bloc dédié (armes de mêlée/taille/lancer), champ `damage` éditable, jet de dés
- Tri automatique des combattants en temps réel (recalcul index actif)
- Encombrement étendu au poids des armures et équipements
- Sous-onglets compétences Aptitudes : Déplacement / Conduite / Infiltration

**Accessoires (v1.1.0)**
- Fiche Accessoire (`feature`) : featureType, bonus de tir par portée (C/M/L/X), réduction de bruit, réduction latérale, augmentation de longueur, rareté, prix, poids
- Section « Accessoires » dans la fiche d'arme (CRUD + drag & drop depuis compendium/inventaire)
- Affichage des accessoires et leurs bonus dans l'onglet Combat (badges colorés par type)
- Compendium Accessoires : 29 entrées depuis CSV (lunettes, silencieux, pointeurs, adaptateurs…)

**Blessures & Santé (v1.1.4)**
- Degrés de blessure D0-D6+ calculés automatiquement par localisation selon PC
- Panneau récapitulatif : stati, malus cumulés Initiative/Action, warnings, tests d'endurance, membres inutilisables
- Bouton soin individuel (✚) par localisation — réduit d'un degré
- Bouton Premiers Soins global — stabilise (D≥3) ou réduit d'un degré (D1-2)
- Indicateur STABILISÉ : supprime le timer de mort pour les localisations stabilisées
- Jet d'endurance avec dé secondaire bonus/malus, résultat en chat et gestion de l'échec (inconscient)
- Synchronisation temps réel des effets de statut token (`dead` / `unconscious`)
- Incapacité en combat : combattants inconscients/morts sautés et grisés dans le traqueur

---

## 🔜 Planifié

### Finitions & Cohérence
> Corrections de comportement et attributs manquants.

- [ ] **Attributs secondaires** : Apparence, Taille, Poids, Endurance, Chance (origine / actuel) *(Revoir calcul bonus attributs)*
- [ ] **Malus de charge** : revoir la formule qui diffère selon course, marche ou reptation *(Gestion de la charge)*
- [ ] **Armes blanches** : supprimer la possibilité de lancer les dégâts depuis la section bonus (car toujours liée à une arme) *(Gestion des bonus de dégâts)*
- [ ] **Contrôle des valeurs** : pas de valeur négative pour les dev, valeurs comprises entre 1 et 10 pour les attributs *(Contrôle des valeurs des champs)*
- [ ] **Format des dégâts** : validation par regexp `^(0|[1-9](?:[dD]6(?:\+[12])?)?)$`
- [ ] **Issue #11** : Contrôle des valeurs des bonus de discrétion et dissimulation

---

### Impact des Accessoires
> Prise en compte mécanique des accessoires sur les stats et dégâts.

- [ ] **Features** : gérer l'impact des accessoires sur les items, compétences et dégâts *(Gestion des features)*

---

### Système de Difficultés & Coches
> Moteur de résolution complet avec marges et conséquences.

- [ ] Liste des actions de corps à corps (qui définissent les difficultés)
- [ ] Tableau de difficulté (distance, localisation, type d'action, etc.)
- [ ] Ajouter les difficultés lors d'un lancement de dés
- [ ] Ajouter une validation de gain de dev (coches) en cas de réussite
- [ ] Calcul de la marge de réussite / échec
- [ ] Conséquences en cas de réussite ou d'échec (gain de dev, dispersion, etc.)

---

### Automatisation des Munitions & Armes
> Gestion automatisée de l'inventaire de munitions et support des armes non-à-feu.

- [ ] Automatisation de la mise à jour du nombre de munitions (diminution en cas de tir, rechargement, etc.)
- [ ] Prise en compte du poids des munitions dans la charge totale
- [ ] Dispersion des munitions (en cas de réussite ou d'échec)
- [ ] Gestion des dispersions de grenades et explosifs
- [ ] Gestion des armes autres que les armes à feu *(Gestion des armes)*

---

### v1.6.0 — Conséquences des Blessures
> Application des malus liés aux localisations blessées sur les compétences et attributs (les malus Initiative/Action sont déjà implémentés en v1.1.4).

- [x] Malus Initiative et Action par localisation blessée *(v1.1.4)*
- [x] Statuts inconscient / coma / mort avec synchronisation token *(v1.1.4)*
- [x] Membres inutilisables signalés dans le panneau *(v1.1.4)*
- [ ] Répercussion des malus sur les jets de compétences liées au membre blessé
- [ ] Répercussion des malus d'action sur le nombre d'actions disponibles en combat

---

## 💡 Backlog (non versionné)

Ces sujets sont identifiés mais n'ont pas encore été assignés à une version :

- Gestion des difficultés dans les rolls (UI, dialog)
- Contrôle des champs avancé (hooks onChange côté Foundry)
- Internationalisation complète des nouvelles sections
