# 🚀 Audit Flash IA - Simulateur d'Automatisation

## 📋 Description

Démo interactive permettant aux entreprises (ESN, PME/TPE) de générer instantanément une **roadmap d'automatisation personnalisée** grâce à l'IA.

🌐 **Démo en ligne :** https://audit-flash-ia.vercel.app

## ✨ Fonctionnalités

- **Formulaire intelligent** : collecte des informations sur l'entreprise et ses processus
- **Génération IA en temps réel** : roadmap personnalisée via OpenAI GPT-4
- **Interface moderne** : design responsive et animations fluides
- **Segmentation claire** : Quick wins, projets moyen terme, vision long terme
- **ROI estimé** : projections de gains de temps et coûts
- **API sécurisée** : intégration serverless avec Vercel

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Vercel Serverless Functions
- **IA** : OpenAI GPT-4 API
- **Déploiement** : Vercel
- **Design** : CSS Grid/Flexbox, animations CSS
- **Responsive** : Compatible mobile/tablette/desktop

## 🎯 Cible

- **ESN** (Entreprises de Services Numériques)
- **PME/TPE** cherchant à automatiser leurs processus
- **Consultants** en transformation digitale

## 🚀 Installation & Déploiement

### Développement Local

1. Cloner le projet
```bash
git clone https://github.com/Equilibretech/Audit-Flash-IA.git
cd Audit-Flash-IA
```

2. Ouvrir `index.html` dans un navigateur
   - Interface visible mais API non fonctionnelle en local
   - Nécessite un déploiement pour la fonctionnalité complète

### Déploiement Vercel

1. **Via GitHub (recommandé)**
   ```bash
   # Push vers GitHub déclenche auto-déploiement
   git push origin main
   ```

2. **Via Vercel CLI**
   ```bash
   npm install -g vercel
   npx vercel --prod
   ```

## 🔧 Configuration

### Variables d'Environnement Vercel

1. Dans le dashboard Vercel ou via CLI :
   ```bash
   npx vercel env add OPENAI_API_KEY
   ```

2. Ajouter votre clé OpenAI API

### Architecture Serverless

- **Frontend** : Fichiers statiques (`index.html`, `styles.css`, `script.js`)
- **API** : `/api/generate-roadmap.js` (Vercel Function)
- **Sécurité** : Clé API côté serveur uniquement

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
Modifier la fonction `buildPrompt()` dans `/api/generate-roadmap.js` ligne 70-90.

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
- ✅ Clé API sécurisée côté serveur (Vercel Functions)
- ✅ Variables d'environnement protégées
- ✅ CORS configuré
- 🔄 À implémenter : rate limiting, authentification

## 📁 Structure du Projet

```
Audit-Flash-IA/
├── api/
│   └── generate-roadmap.js    # API Vercel serverless
├── index.html                 # Interface principale
├── script.js                  # Logique frontend
├── styles.css                 # Styles CSS
├── vercel.json               # Configuration Vercel
├── .gitignore               # Exclusions Git
├── .env.example            # Template variables
└── README.md              # Documentation
```

## 📈 Roadmap

- [x] ~~Backend sécurisé~~ (Vercel Serverless)
- [ ] Base de données des audits
- [ ] Export PDF des roadmaps
- [ ] Intégration CRM
- [ ] Dashboard analytics
- [ ] A/B testing
- [ ] Rate limiting
- [ ] Authentification utilisateur

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