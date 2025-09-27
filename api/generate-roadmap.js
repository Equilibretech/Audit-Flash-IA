// API Route Vercel pour gérer les appels OpenAI
export default async function handler(req, res) {
    // Configuration CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { formData } = req.body;

        if (!formData) {
            return res.status(400).json({ error: 'Form data is required' });
        }

        const prompt = buildPrompt(formData);
        const roadmap = await generateRoadmapWithOpenAI(prompt);

        res.status(200).json({ roadmap });
    } catch (error) {
        console.error('Error generating roadmap:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
}

async function generateRoadmapWithOpenAI(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un expert en automatisation d\'entreprise et transformation digitale. Tu génères des roadmaps d\'automatisation personnalisées, concrètes et actionnables.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 1500,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function buildPrompt(formData) {
    return `
Entreprise: ${formData.company}
Secteur: ${formData.sector}
Taille: ${formData.employees}
Processus métier: ${formData.processes}
Défis principaux: ${formData.painPoints}
Outils actuels: ${formData.tools}

Génère une roadmap d'automatisation personnalisée au format JSON EXACT suivant (RETOURNE UNIQUEMENT LE JSON, RIEN D'AUTRE):

{
  "sections": [
    {
      "id": "diagnostic",
      "title": "DIAGNOSTIC EXPRESS",
      "items": [
        {
          "title": "Titre du problème identifié",
          "description": "Description détaillée du problème et son impact"
        }
      ]
    },
    {
      "id": "quick-wins", 
      "title": "QUICK WINS",
      "items": [
        {
          "title": "Titre de l'automatisation rapide",
          "description": "Description concrète avec outils recommandés et bénéfices"
        }
      ]
    },
    {
      "id": "moyen-terme",
      "title": "PROJETS MOYEN TERME", 
      "items": [
        {
          "title": "Titre du projet moyen terme",
          "description": "Description détaillée de l'implémentation"
        }
      ]
    },
    {
      "id": "long-terme",
      "title": "VISION LONG TERME",
      "items": [
        {
          "title": "Titre de la transformation",
          "description": "Vision de la transformation digitale complète"
        }
      ]
    },
    {
      "id": "roi",
      "title": "ROI ESTIMÉ",
      "items": [
        {
          "title": "Gains de temps",
          "description": "Estimation précise des gains de temps et pourcentages"
        },
        {
          "title": "Coûts d'implémentation", 
          "description": "Coûts estimés et retour sur investissement"
        }
      ]
    }
  ]
}

IMPORTANT: 
- Retourne UNIQUEMENT le JSON valide, sans texte avant ou après
- 2-3 items par section maximum
- Descriptions concrètes et actionnables
- Adaptées au secteur d'activité spécifique
- Sans emojis ou caractères spéciaux
    `;
}