# Roadmap - Mercenary System

**Mise à jour :** 2026-04-16  
**Version courante :** 1.2.2  
**Source :** `.todo`

> L'historique des versions complétées est dans [CHANGELOG.md](CHANGELOG.md).

---

## 🔜 Planifié

### Finitions & Cohérence
> Corrections de comportement et attributs manquants.

- [ ] **Attributs secondaires** : Apparence, Taille, Poids, Endurance, Chance (origine / actuel)
- [ ] **Format des dégâts** : validation par regexp `^(0|[1-9](?:[dD]6(?:\+[12])?)?)$`
- [ ] **Issue #11** : Contrôle des valeurs des bonus de discrétion et dissimulation

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
- [ ] Gestion des armes autres que les armes à feu
- [ ] Bouton « Jet de localisation » dans le chat suite à un jet de combat (table aléatoire)

---

### Items & Inventaire

- [ ] Gérer une quantité pour les équipements consommables (ex : ×3 grenades, ×5 kits de soin)
- [ ] Impact automatique des accessoires (`feature`) sur les stats, compétences et dégâts des armes associées

---

### Conséquences des Blessures
> Application des malus liés aux localisations blessées sur les compétences et attributs (les malus Initiative/Action sont déjà implémentés en v1.1.4).

- [ ] Répercussion des malus sur les jets de compétences liées au membre blessé
- [ ] Répercussion des malus d'action sur le nombre d'actions disponibles en combat

---

## 💡 Backlog (non versionné)

Ces sujets sont identifiés mais n'ont pas encore été assignés à une version :

- Internationalisation complète des nouvelles sections (stockage, équipage, cargaison)
