# 🚀 Audit Flash IA - Simulateur d'Automatisation

## 📋 Description

Démo interactive permettant aux entreprises (ESN, PME/TPE) de générer instantanément une **roadmap d'automatisation personnalisée** grâce à l'IA.

## ✨ Fonctionnalités

- **Formulaire intelligent** : collecte des informations sur l'entreprise et ses processus
- **Génération IA en temps réel** : roadmap personnalisée via OpenAI GPT-4
- **Interface moderne** : design responsive et animations fluides
- **Segmentation claire** : Quick wins, projets moyen terme, vision long terme
- **ROI estimé** : projections de gains de temps et coûts

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **IA** : OpenAI GPT-4 API
- **Design** : CSS Grid/Flexbox, animations CSS
- **Responsive** : Compatible mobile/tablette/desktop

## 🎯 Cible

- **ESN** (Entreprises de Services Numériques)
- **PME/TPE** cherchant à automatiser leurs processus
- **Consultants** en transformation digitale

## 🚀 Installation

1. Cloner le projet
```bash
git clone https://github.com/Equilibretech/Audit-Flash-IA.git
cd Audit-Flash-IA
```

2. Ouvrir `index.html` dans un navigateur
   - Aucune installation requise
   - Fonctionne en local ou sur serveur web

## 🔧 Configuration

La clé API OpenAI est intégrée dans le code pour la démo. En production :

1. Créer un fichier `.env`
2. Ajouter : `OPENAI_API_KEY=votre_clé_api`
3. Modifier `script.js` pour utiliser la variable d'environnement

## 📱 Utilisation

1. **Remplir le formulaire** :
   - Nom de l'entreprise
   - Secteur d'activité
   - Taille (nombre d'employés)
   - Description des processus métier
   - Défis principaux
   - Outils actuels

2. **Cliquer sur "Générer ma roadmap"**

3. **Consulter les résultats** :
   - Diagnostic express
   - Quick wins (1-4 semaines)
   - Projets moyen terme (2-6 mois)
   - Vision long terme (6-18 mois)
   - ROI estimé

## 🎨 Personnalisation

### Modifier les secteurs d'activité
Éditer les options dans `index.html` ligne 28-38.

### Ajuster le prompt IA
Modifier la fonction `buildPrompt()` dans `script.js` ligne 90-110.

### Personnaliser le design
Modifier les variables CSS dans `styles.css` :
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #f5576c;
}
```

## 📊 Métriques & Analytics

Pour tracker l'utilisation, ajouter :
- Google Analytics
- Hotjar pour l'UX
- Webhooks pour notifier les soumissions

## 🔒 Sécurité

- ✅ Validation côté client
- ✅ Sanitisation des inputs
- ⚠️ Clé API exposée (démo uniquement)
- 🔄 À implémenter : validation serveur, rate limiting

## 📈 Roadmap

- [ ] Backend sécurisé (Node.js/Python)
- [ ] Base de données des audits
- [ ] Export PDF des roadmaps
- [ ] Intégration CRM
- [ ] Dashboard analytics
- [ ] A/B testing

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📞 Contact

**Equilibre Tech** - Spécialistes en automatisation d'entreprise
- Email : contact@equilibretech.com
- Site : https://equilibretech.com

## 📄 Licence

MIT License - voir `LICENSE` pour plus de détails.