# Guide de Contribution

Merci de votre intérêt pour contribuer au Mercenary System ! Ce guide vous explique comment contribuer efficacement.

## 🚀 Avant de commencer

1. Lisez le [README.md](README.md) pour comprendre le projet
2. Vérifiez les [issues existantes](https://github.com/nawack/merc2/issues) pour éviter les doublons
3. Vérifiez les [pull requests](https://github.com/nawack/merc2/pulls) en cours

## 🔧 Configuration de l'Environnement

### Prérequis
- Git
- Un éditeur de code (VS Code recommandé)
- Une installation Foundry VTT v13+

### Étapes de configuration

1. **Fork le dépôt** sur GitHub
2. **Clonez votre fork** :
   ```bash
   git clone https://github.com/nawack/merc2.git
   cd merc2
   ```

3. **Créez une branche** pour votre fonctionnalité :
   ```bash
   git checkout -b feature/my-feature
   ```

4. **Liez votre dossier de développement** à Foundry VTT :
   - Windows : Copiez le dossier dans `Data/systems/merc`
   - Linux/macOS : Créez un lien symbolique :
     ```bash
     ln -s /chemin/vers/FoundryVTT-MercenarySystem ~/.local/share/FoundryVTT/Data/systems/merc
     ```

5. **Testez vos changements** dans Foundry VTT

## 📝 Types de Contributions

### Signaler un Bug

Créez une [issue](https://github.com/nawack/merc2/issues/new) avec :

```markdown
## Description du Bug
[Description claire du problème]

## Étapes pour Reproduire
1. [Première étape]
2. [Deuxième étape]
3. [...]

## Comportement Attendu
[Ce qui devrait se passer]

## Comportement Actuel
[Ce qui se passe réellement]

## Environnement
- Foundry VTT: [version]
- Navigateur: [navigateur et version]
- OS: [Windows/macOS/Linux]
```

### Suggérer une Amélioration

Créez une [issue](https://github.com/nawack/merc2/issues/new) avec le label `enhancement` :

```markdown
## Description
[Description de l'amélioration]

## Motivation
[Pourquoi cette amélioration ?]

## Exemples
[Exemples de fonctionnalités similaires dans d'autres systèmes]

## Impact Potentiel
[Comment cela affecte les utilisateurs ?]
```

### Soumettre du Code

1. **Faites vos modifications** dans votre branche
2. **Testez complètement** vos changements
3. **Commitez avec des messages clairs** :
   ```bash
   git commit -m "Add feature: portrait selection via FilePicker"
   ```

4. **Pushez vers votre fork** :
   ```bash
   git push origin feature/my-feature
   ```

5. **Créez une Pull Request** (PR) :
   - Décrivez vos changements
   - Référencez les issues liées (#123)
   - Listez les tests que vous avez effectués
   - Mentionnez si vous avez testé sur différents navigateurs

## 📋 Standards de Code

### JavaScript
- Utilisez ES6+ syntax
- Noms de variables en camelCase
- Noms de constantes en UPPER_SNAKE_CASE
- Commentez le code complexe
- Utilisez des fonctions asynchrones pour les opérations asynchrones
- Ajoutez des JSDoc pour les fonctions publiques

```javascript
/**
 * Initialize portrait image selection
 * @param {Actor} actor - The actor document
 * @returns {void}
 */
function initPortraitSelection(actor) {
  // Implementation
}
```

### CSS
- Utilisez des classes CSS sémantiques
- Préférez les CSS Grid/Flexbox aux floats
- Groupez les propriétés logiquement
- Commentez les sections principales

```css
/* Portrait Container */
.portrait-container {
  position: relative;
  width: 150px;
  height: 150px;
  display: inline-block;
}
```

### HTML (Handlebars)
- Indentation : 2 espaces
- Utilisez des attributs data- pour les sélecteurs JavaScript
- Structurez logiquement le HTML

```handlebars
<div class="header-columns">
  <div class="header-image-column" data-section="portrait">
    <!-- Content here -->
  </div>
</div>
```

## 🧪 Tests

Avant de soumettre une PR, testez :

- ✅ La création/édition de personnages
- ✅ Les attributs et compétences
- ✅ Les jets (attributs, compétences, sous-attributs)
- ✅ La sélection de portrait
- ✅ La sauvegarde des données
- ✅ Sur au minimum 2 navigateurs différents
- ✅ Que les fichiers CSS et JS se chargent correctement

### Liste de Vérification (Checklist)

```markdown
- [ ] Mes changements suivent les standards de code
- [ ] J'ai commenté mon code, particulièrement les parties complexes
- [ ] J'ai testé avec au minimum 2 navigateurs différents
- [ ] J'ai vérifié que les fichiers CSS et JS se chargent
- [ ] Je n'ai pas introduit de warnings dans la console
- [ ] Mes messages de commit sont clairs et descriptifs
- [ ] J'ai lié les issues pertinentes (#123, #456)
```

## 🎯 Priorités

Les priorités du projet, par ordre :

1. **Stabilité** : Pas de bugs critiques
2. **Compatibilité** : Rester compatible avec Foundry VTT v13+
3. **Performance** : Optimiser pour les navigateurs de faible capacité
4. **Fonctionnalités** : Ajouter de nouvelles capacités
5. **Cosmétique** : Améliorer l'apparence

## 📚 Documentation

- Mettez à jour le [README.md](README.md) si votre changement affecte l'utilisation
- Mettez à jour le [CHANGELOG.md](CHANGELOG.md) avec vos changements
- Documentez les nouvelles fonctions avec JSDoc

## 🚫 Ce qu'on Évite

- ❌ Dépendances externes non testées
- ❌ Code visant une seule version de Foundry
- ❌ Modifications sans tests
- ❌ Commits avec l'historique en bazar
- ❌ Pull requests massives (divisez en petites PR)

## ❓ Questions ?

- Ouvrez une [discussion](https://github.com/nawack/merc2/discussions)
- Posez sur le [Forum Foundry VTT](https://forums.foundryvtt.com/)
- Consultez les issues fermées pour les réponses courantes

## 📜 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence MIT que le projet.

---

Merci de contribuer ! 🎉
