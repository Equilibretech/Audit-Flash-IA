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

Génère une roadmap d'automatisation personnalisée avec:

1. **DIAGNOSTIC EXPRESS** (2-3 points clés identifiés)
2. **QUICK WINS** (2-3 automatisations rapides à implémenter en 1-4 semaines)
3. **PROJETS MOYEN TERME** (2-3 automatisations plus importantes sur 2-6 mois)
4. **VISION LONG TERME** (transformation digitale complète sur 6-18 mois)
5. **ROI ESTIMÉ** (gains de temps et coûts approximatifs)

Format en HTML avec des balises <h3>, <ul>, <li>, <strong> pour le styling.
Sois concret, actionnable et adapté au secteur d'activité.
Utilise des émojis pour rendre la présentation plus engaging.
Maximum 800 mots.
    `;
}