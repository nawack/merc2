# 📚 Prérequis de Compétences

## Vue d'ensemble

Certaines compétences du Système Mercenaire nécessitent l'acquisition d'autres compétences avant de pouvoir être apprises. Ces **prérequis** garantissent une progression logique et réaliste.

**Règle :** Un prérequis est **satisfait** si la compétence requise atteint un degré ≥ 0 (soit un degré positif ou nul).

---

## 📋 Liste complète des prérequis

### Compétences avec 1 prérequis

| Compétence | Prérequis | Domaine | Raison logique |
|-----------|-----------|---------|---------------|
| **Illégalité** | Bureaucratie | Social | Nécessite de comprendre le système légal pour l'contourner |
| **Métallurgie** | Mathématiques | Connaissances | Implique calculs et proportions |
| **Ingénierie** | Mathématiques | Connaissances | Fondements mathématiques essentiels |
| **Électricité/Électronique** | Mathématiques | Connaissances | Calculs circuits et résistances |
| **Informatique** | Mathématiques | Connaissances | Programmation et algorithmes |
| **Géographie** | Mathématiques | Connaissances | Cartographie et calculs distances |
| **Météorologie** | Mathématiques | Connaissances | Prédictions basées modèles mathématiques |
| **Chimie** | Mathématiques | Connaissances | Stœchiométrie et réactions |

### Compétences avec 2 prérequis

| Compétence | Prérequis | Domaine | Raison logique |
|-----------|-----------|---------|---------------|
| **Navigation** | Mathématiques + Géographie | Connaissances | Combine géographie et calculs |
| **Histoire/Politique** | Géographie + Bureaucratie | Connaissances | Contexte géographique + systèmes politiques |
| **Médecine Humaine** | Chimie + Mathématiques | Connaissances | Pharmacologie (chimie) + calculs dosages |
| **Chirurgie** | Médecine Humaine | Connaissances | Spécialisation médicale avancée |

---

## 🔄 Chaînes de dépendance

### Arbre des Mathématiques
```
Mathématiques (base)
├─→ Métallurgie
├─→ Ingénierie
├─→ Électricité/Électronique
├─→ Informatique
├─→ Géographie
├─→ Météorologie
├─→ Chimie
│   └─→ Médecine Humaine
│       └─→ Chirurgie
└─→ Navigation (+ Géographie)
```

### Arbre de la Bureaucratie
```
Bureaucratie (base)
├─→ Illégalité
└─→ Histoire/Politique (+ Géographie)
```

### Arbre de la Géographie
```
Géographie (Mathématiques requise)
├─→ Navigation (+ Mathématiques)
└─→ Histoire/Politique (+ Bureaucratie)
```

---

## ⚠️ Impacts sur le gameplay

### Blocage d'apprentissage
Les joueurs **ne peuvent pas** améliorer les points de développement (Dev) d'une compétence bloquée par un prérequis tant que celui-ci n'est pas satisfait.

### Déverrouillage progressif
Les prérequis encouragent une **progression naturelle** :
- Un personnage doit d'abord maîtriser les **fondamentaux** (Mathématiques)
- Puis spécialiser dans des domaines **avancés** (Ingénierie, Médecine)

### Spécialisations non affectées
Les prérequis s'appliquent aux **compétences de base uniquement**. Les spécialisations (ex: `spec_melee_mma`) n'ont pas de prérequis.

---

## 🛠️ Vérification en code

### Fonction `checkSkillUnlocked(actor, skillKey)`

**Localisation :** [scripts/system.js](scripts/system.js) - ligne ~342

**Logique :**
```javascript
function checkSkillUnlocked(actor, skillKey) {
  // Récupère les prérequis définis
  const prerequisites = SKILL_PREREQUISITES[skillKey];
  
  // Si aucun prérequis, la compétence est toujours disponible
  if (!prerequisites || prerequisites.length === 0) {
    return { unlocked: true, missingPrereqs: [] };
  }
  
  // Vérifie chaque prérequis
  for (const prereqKey of prerequisites) {
    const degree = calculateDegree(prereqSkill);
    if (degree < 0) {
      // Prérequis non satisfait
      missingPrereqs.push(prereqKey);
    }
  }
  
  return { unlocked: missingPrereqs.length === 0, missingPrereqs };
}
```

### Constante `SKILL_PREREQUISITES`

**Localisation :** [scripts/system.js](scripts/system.js) - ligne ~115

Définie comme une constante JavaScript contenant tous les prérequis en format clé-valeur.

---

## 📖 Exemple de progression

**Scénario :** Créer un ingénieur en robotique

```
Étape 1: Apprendre Mathématiques
├─ Base: 30 - (Intelligence × 2)
├─ Dépenser 15 points de dev
└─ Atteindre Degré 0 ✅

Étape 2: Ingénierie se déverrouille
├─ Base: 30 - (Intelligence × 2)
├─ Dépenser 10 points de dev
└─ Atteindre Degré 0 ✅

Étape 3: Progamateur? 
├─ Informatique requiert Mathématiques ✅ (déjà satisfait)
├─ Progresser en Informatique
└─ Devenir expert en robotique
```

---

## 🔍 FAQ

**Q: Puis-je avoir une compétence bloquée mais dépendre de deux prérequis?**  
A: Oui. Si un prérequis n'est pas satisfait, la compétence reste bloquée même si les autres le sont.

**Q: Les prérequis affectent-ils les jets de compétence?**  
A: Non, ils affectent uniquement l'**apprentissage**. Une fois déverrouillée, une compétence fonctionne normalement.

**Q: Peut-on débloquer des prérequis à d'autres personnages?**  
A: Non, chaque personnage gère ses propres prérequis indépendamment.

**Q: Comment réinitialiser un prérequis?**  
A: Réduire le degré de la compétence prérequise en dessous de 0 relance le blocage.

---

**Dernière mise à jour :** 2026-02-05  
**Version du système :** 1.0.7  
**Statut :** Documenté complètement
