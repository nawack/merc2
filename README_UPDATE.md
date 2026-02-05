# 📋 Mise à jour README - Sections à ajouter

> **Note :** Ce fichier liste les sections à ajouter au README.md pour combler les lacunes documentaires.

---

## 1. Section "Compatibilité Foundry" (à ajouter en début)

```markdown
## 🔧 Compatibilité

- **Version minimale :** Foundry VTT 13.0
- **Version vérifiée :** 13.351 (Stable)
- **Version maximale :** 13.351 (Dernière stable)

⚠️ **Note :** Le système a été développé et testé sur Foundry 13.351. Les versions antérieures à 13.0 ne sont pas supportées.
```

---

## 2. Section "Catégorie Other" (à ajouter dans "Compétences")

**Localisation :** Après la liste des 7 catégories

```markdown
### Catégorie "Other" (Autre)

La catégorie **"Other"** regroupe les compétences qui ne correspondent pas aux autres catégories. 
Elle est généralement vide par défaut mais peut être utilisée pour des compétences personnalisées.

**Compétences dans "Other" :**
- (Aucune par défaut)

Vous pouvez ajouter des compétences personnalisées dans cette catégorie si nécessaire.
```

---

## 3. Section "Prérequis de compétences" (à ajouter)

**Localisation :** Après "Compétences" section

```markdown
## 📚 Prérequis de compétences

Certaines compétences avancées nécessitent l'apprentissage préalable d'autres compétences.

**Exemple :** La compétence "Chirurgie" nécessite d'avoir déverrouillé "Médecine Humaine" (degré ≥ 0).

Pour la **liste complète des prérequis**, voir le document dédié : [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md)

**Règle :** Un prérequis est satisfait si la compétence requise atteint un degré ≥ 0.
```

---

## 4. Section "Système de dégâts" (à ajouter dans "Combat")

**Localisation :** Dans l'onglet "Combat" du README

```markdown
### Dégâts en combat

Les dégâts au combat rapproché sont calculés selon une **table de référence** combinant:
- **Force** du personnage (1-10)
- **Degré** en compétence de combat (-7 à +19)

**Exemple :** Un combattant avec Force 5 et Degré +8 inflige "2d6+1" dégâts.

Pour le **système complet**, voir : [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md)
```

---

## 5. Section "Guide des objets/items" (à ajouter)

**Localisation :** Après "Onglets" section

```markdown
## 🎒 Gestion des objets (Items)

Le système supporte 5 types d'objets :
1. **Armes** (⚔️) - Outils de combat équipables
2. **Armures** (🛡️) - Protection équipable
3. **Équipement** (🎒) - Outils et appareils équipables
4. **Munitions** (💥) - Consommables pour armes à feu
5. **Traits** (⭐) - Capacités et augmentations spéciales

Pour le **guide complet des types d'items**, voir : [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md)

### Équiper un item
- Cliquer l'icône d'équipement sur l'item
- L'item devient **actif** et ses bonus s'appliquent
```

---

## 6. Section "Statistiques de combat" (à ajouter dans "Combat")

**Localisation :** Dans l'onglet "Combat" du README

```markdown
### Statistiques de combat

Le système calcule automatiquement 8 statistiques basées sur la taille et le poids:
- **Taille** - Affecte la capacité de charge
- **Poids** - Affecte la corpulence
- **Reptation** - Déplacement au sol
- **Marche** - Déplacement tactique
- **Course** - Déplacement à pleine vitesse
- **Dissimulation** - Bonus/pénalité pour se cacher
- **Discrétion** - Bonus/pénalité pour rester silencieux
- **Ajustement PC** - Modification des Points de Corpulence

Ces statistiques se **mettent à jour automatiquement** quand vous modifiez la hauteur, le poids ou la Constitution.

Pour le **guide détaillé**, voir : [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md)
```

---

## 7. Section "Feuilles personnalisées" (à ajouter)

**Localisation :** Après "Interface" section

```markdown
## 📄 Feuilles personnalisées

Le système inclut des feuilles de personnage spécialisées pour les items:

### Feuille d'armes (MercWeaponSheet)
Affiche tous les détails d'une arme:
- Dégâts (Force + Degré + Bonus)
- Portée et cadence de tir
- Compétence associée
- Coût et qualité

Accessible en **double-cliquant** sur une arme dans l'onglet "Équipements".
```

---

## 8. Section "Hooks et intégrations" (à ajouter)

**Localisation :** Section "Développement" (nouvelle)

```markdown
## 🔗 Hooks et événements

Le système utilise plusieurs hooks Foundry pour fonctionnalités avancées:

### `updateActor`
Déclenché quand les attributs d'un personnage changent.
- **Usage :** Recalcul automatique des statistiques de combat
- **Localisation :** [scripts/system.js](scripts/system.js) - ligne ~1800

### `renderActorSheetV2`
Déclenché quand la feuille se rend.
- **Usage :** Initialiser les écouteurs d'événements
- **Localisation :** [scripts/system.js](scripts/system.js) - ligne ~1500

### `dropActorSheetData`
Déclenché quand un item est dragué sur la feuille.
- **Usage :** Ajouter/équiper des items
- **Localisation :** [scripts/system.js](scripts/system.js) - ligne ~2000
```

---

## 9. Améliorations mineures

### Dans "Introduction"
```markdown
**Version actuelle :** 1.0.9
```

### Dans "Compétences"
Ajouter après "56 compétences":
```
+ 2 compétences de langue personnalisables
+ X compétences de spécialisation personnalisables
```

### Dans "Attribution des compétences"
Clarifier:
```
Les compétences se déverrouillent selon deux mécanismes:
1. **Automatiquement** si aucun prérequis
2. **Avec blocage** si prérequis non satisfait (nécessite d'abord apprendre la compétence requise)

Voir [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md) pour les détails.
```

---

## 📝 Fichiers documentation créés

Pour combler les lacunes, les fichiers suivants ont été créés:

✅ [SKILL_PREREQUISITES.md](SKILL_PREREQUISITES.md) - Prérequis de compétences  
✅ [DAMAGE_SYSTEM.md](DAMAGE_SYSTEM.md) - Système de dégâts  
✅ [ITEM_TYPES_GUIDE.md](ITEM_TYPES_GUIDE.md) - Guide des types d'objets  
✅ [COMBAT_STATISTICS.md](COMBAT_STATISTICS.md) - Statistiques de combat  
✅ [AUDIT_DOCUMENTATION.md](AUDIT_DOCUMENTATION.md) - Audit complet  

---

## 🎯 Priorités de mise à jour

### Priority 1 (CRITIQUE)
- [ ] Ajouter compatibilité Foundry dans README
- [ ] Ajouter lien vers SKILL_PREREQUISITES.md
- [ ] Ajouter lien vers DAMAGE_SYSTEM.md

### Priority 2 (IMPORTANT)
- [ ] Ajouter lien vers ITEM_TYPES_GUIDE.md
- [ ] Documenter catégorie "Other"
- [ ] Ajouter feuilles personnalisées section

### Priority 3 (NICE-TO-HAVE)
- [ ] Ajouter hooks documentation
- [ ] Améliorer section Combat
- [ ] Clarifier flow des compétences

---

**Généré :** 2026-02-05  
**État :** Documentation manquante identifiée et créée  
**Prochaine étape :** Mettre à jour le README principal avec ces sections
