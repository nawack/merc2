# Roadmap - Mercenary System

**Mise à jour :** 2026-04-20  
**Version courante :** 1.2.4  
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
- [ ] Bouton « Jet de localisation » dans le chat suite à un jet de combat (table aléatoire)

---

### Items & Inventaire

- [ ] Impact automatique des accessoires (`feature`) sur les stats, compétences et dégâts des armes associées



