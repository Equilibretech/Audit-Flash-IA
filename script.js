class AuditFlashIA {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('auditForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = this.collectFormData();
        if (!this.validateFormData(formData)) {
            return;
        }

        this.setLoadingState(true);
        
        try {
            const roadmap = await this.generateRoadmap(formData);
            this.displayResults(roadmap);
        } catch (error) {
            console.error('Erreur lors de la génération:', error);
            this.showError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            this.setLoadingState(false);
        }
    }

    collectFormData() {
        return {
            company: document.getElementById('company').value,
            sector: document.getElementById('sector').value,
            employees: document.getElementById('employees').value,
            processes: document.getElementById('processes').value,
            painPoints: document.getElementById('painPoints').value,
            tools: document.getElementById('tools').value
        };
    }

    validateFormData(data) {
        const required = ['company', 'sector', 'employees', 'processes', 'painPoints'];
        for (let field of required) {
            if (!data[field] || data[field].trim() === '') {
                this.showError(`Le champ "${field}" est requis.`);
                return false;
            }
        }
        return true;
    }

    async generateRoadmap(formData) {
        const prompt = this.buildPrompt(formData);
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
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
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    buildPrompt(formData) {
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

    displayResults(roadmap) {
        const resultsSection = document.getElementById('resultsSection');
        const roadmapContent = document.getElementById('roadmapContent');
        
        roadmapContent.innerHTML = roadmap;
        resultsSection.classList.remove('hidden');
        
        // Scroll vers les résultats
        resultsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    setLoadingState(isLoading) {
        const btn = document.getElementById('generateBtn');
        const btnText = document.getElementById('btnText');
        const loader = document.getElementById('loader');
        
        if (isLoading) {
            btn.disabled = true;
            btnText.style.display = 'none';
            loader.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btnText.style.display = 'inline';
            loader.classList.add('hidden');
        }
    }

    showError(message) {
        // Créer ou mettre à jour l'élément d'erreur
        let errorDiv = document.getElementById('errorMessage');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'errorMessage';
            errorDiv.className = 'error-message';
            
            const form = document.getElementById('auditForm');
            form.insertBefore(errorDiv, form.firstChild);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Masquer l'erreur après 5 secondes
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    new AuditFlashIA();
});

// Fonction utilitaire pour l'animation des résultats
function animateResults() {
    const roadmapItems = document.querySelectorAll('#roadmapContent h3, #roadmapContent ul');
    roadmapItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
}