# 📋 Optimisation Prompt pour Export PDF

## 🎯 Objectifs
- Créer un format JSON optimisé pour la génération PDF
- Contrôler la longueur du contenu pour éviter les débordements
- Structurer les données pour un rendu professionnel
- Garantir une mise en page cohérente

## 📊 Contraintes PDF Identifiées

### Limites Techniques
- **Page A4** : 210x297mm (595x842 points)
- **Marges** : 20 points de chaque côté
- **Zone utile** : 170 points de largeur
- **Ligne de texte** : ~140 caractères max à 9pt
- **Hauteur page** : ~280 points utilisables

### Contraintes de Contenu
- **Titre section** : 30 caractères max
- **Titre item** : 50 caractères max  
- **Description** : 120 caractères max (2 lignes)
- **Items par section** : 2-3 max
- **Sections totales** : 5 max

## 🔧 Format JSON Optimisé

```json
{
  "metadata": {
    "totalEstimatedPages": 3,
    "contentOptimizedForPDF": true,
    "version": "2.0"
  },
  "sections": [
    {
      "id": "diagnostic",
      "title": "DIAGNOSTIC EXPRESS",
      "priority": 1,
      "items": [
        {
          "title": "Court et précis (max 50 chars)",
          "description": "Description concise adaptée au PDF, max 120 caractères pour éviter débordement.",
          "impact": "high|medium|low",
          "estimatedLines": 2
        }
      ]
    }
  ]
}
```

## 📝 Nouveau Prompt Optimisé

```
GÉNÉRER uniquement ce JSON optimisé pour export PDF professionnel:

{
  "metadata": {
    "contentOptimizedForPDF": true,
    "estimatedPages": 3
  },
  "sections": [
    {
      "id": "diagnostic",
      "title": "DIAGNOSTIC EXPRESS",
      "items": [
        {
          "title": "Problème principal (MAX 45 caractères)",
          "description": "Description concise et actionnable, maximum 110 caractères pour rendu PDF optimal."
        }
      ]
    },
    {
      "id": "quick-wins",
      "title": "QUICK WINS",
      "items": [
        {
          "title": "Action immédiate 1 (MAX 45 chars)",
          "description": "Solution rapide avec outils et ROI, max 110 caractères pour PDF."
        },
        {
          "title": "Action immédiate 2 (MAX 45 chars)", 
          "description": "Autre solution concrète avec bénéfices chiffrés, max 110 chars."
        }
      ]
    },
    {
      "id": "moyen-terme",
      "title": "MOYEN TERME",
      "items": [
        {
          "title": "Projet principal (MAX 45 chars)",
          "description": "Implémentation détaillée avec timeline, max 110 caractères."
        }
      ]
    },
    {
      "id": "long-terme", 
      "title": "LONG TERME",
      "items": [
        {
          "title": "Vision globale (MAX 45 chars)",
          "description": "Transformation complète avec écosystème, max 110 caractères."
        }
      ]
    },
    {
      "id": "roi",
      "title": "ROI ESTIMÉ",
      "items": [
        {
          "title": "Gains temps (MAX 45 chars)",
          "description": "X heures/semaine soit Y% amélioration, max 110 caractères."
        },
        {
          "title": "Retour financier (MAX 45 chars)",
          "description": "Investissement Z€, ROI W€/an sur 12 mois, max 110 chars."
        }
      ]
    }
  ]
}

IMPÉRATIFS:
- Titres: MAX 45 caractères 
- Descriptions: MAX 110 caractères
- 2-3 items max par section
- Contenu actionnable et chiffré
- Optimisé pour PDF A4
- AUCUN emoji ou caractère spécial
```

## 🧪 Tests à Effectuer

### 1. Test Longueurs
- [ ] Vérifier titres < 45 chars
- [ ] Vérifier descriptions < 110 chars  
- [ ] Tester débordement pages
- [ ] Valider lisibilité

### 2. Test Rendu
- [ ] PDF basique (texte simple)
- [ ] PDF moderne (couleurs/cards)
- [ ] PDF optimal (version finale)
- [ ] Test sur différents contenus

### 3. Test Prompt
- [ ] Prompt actuel vs optimisé
- [ ] Respect des contraintes
- [ ] Qualité du contenu
- [ ] Cohérence format

## 📈 Métriques de Qualité

### Technique
- Pages générées: 2-4 max
- Débordements: 0
- Caractères cassés: 0
- Temps génération: < 5s

### Visuel  
- Espacement cohérent
- Couleurs harmonieuses
- Lisibilité excellente
- Rendu professionnel

### Contenu
- Actionnable: 100%
- Chiffré: 80%
- Spécifique au secteur: 100%
- Longueur optimale: 100%