class AuditFlashIA {
    constructor() {
        this.apiUrl = '/api/generate-roadmap';
        this.currentStep = 1;
        this.maxSteps = 3;
        this.initializeEventListeners();
        this.initializeAnimations();
    }

    initializeEventListeners() {
        const form = document.getElementById('auditForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Event listeners pour la navigation
        document.addEventListener('DOMContentLoaded', () => {
            this.animateCounters();
        });
    }

    initializeAnimations() {
        // Animation des compteurs au chargement
        this.animateCounters();
        
        // Intersection Observer pour les animations au scroll
        this.setupScrollAnimations();
    }

    // Gestion du stepper
    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.maxSteps) {
                this.currentStep++;
                this.updateStepper();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepper();
        }
    }

    updateStepper() {
        // Mise à jour des étapes dans la navigation
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Mise à jour des sections de formulaire
        document.querySelectorAll('.form-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        if (!isValid) {
            this.showError('Veuillez remplir tous les champs obligatoires.');
        }

        return isValid;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (!this.validateCurrentStep()) {
            return;
        }

        const formData = this.collectFormData();
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

    async generateRoadmap(formData) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ formData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }

        const data = await response.json();
        return data.roadmap;
    }

    displayResults(roadmap) {
        const resultsSection = document.getElementById('resultsSection');
        const roadmapContent = document.getElementById('roadmapContent');
        
        // Structurer les résultats en cartes
        const structuredContent = this.structureRoadmapContent(roadmap);
        roadmapContent.innerHTML = structuredContent;
        
        resultsSection.classList.remove('hidden');
        
        // Animation d'entrée
        setTimeout(() => {
            this.animateResults();
        }, 100);
        
        // Scroll vers les résultats
        resultsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    structureRoadmapContent(roadmap) {
        // Parser le contenu HTML retourné par l'IA et le structurer en cartes
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = roadmap;
        
        const sections = [];
        let currentSection = null;
        
        Array.from(tempDiv.children).forEach(element => {
            if (element.tagName === 'H3') {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    title: element.textContent,
                    content: ''
                };
            } else if (currentSection) {
                currentSection.content += element.outerHTML;
            }
        });
        
        if (currentSection) {
            sections.push(currentSection);
        }

        // Génerer les cartes
        return sections.map((section, index) => {
            const cardClass = this.getCardClass(section.title);
            return `
                <div class="roadmap-card ${cardClass}" style="animation-delay: ${index * 0.2}s">
                    <h3>${this.getCardIcon(section.title)} ${section.title}</h3>
                    <div class="card-content">
                        ${section.content}
                    </div>
                </div>
            `;
        }).join('');
    }

    getCardClass(title) {
        if (title.toLowerCase().includes('quick') || title.toLowerCase().includes('rapide')) {
            return 'quick-wins';
        } else if (title.toLowerCase().includes('moyen') || title.toLowerCase().includes('terme')) {
            return 'medium-term';
        } else if (title.toLowerCase().includes('long') || title.toLowerCase().includes('vision')) {
            return 'long-term';
        }
        return '';
    }

    getCardIcon(title) {
        if (title.toLowerCase().includes('diagnostic')) return '🔍';
        if (title.toLowerCase().includes('quick') || title.toLowerCase().includes('rapide')) return '⚡';
        if (title.toLowerCase().includes('moyen')) return '🛠️';
        if (title.toLowerCase().includes('long') || title.toLowerCase().includes('vision')) return '🚀';
        if (title.toLowerCase().includes('roi')) return '💰';
        return '📋';
    }

    animateResults() {
        const cards = document.querySelectorAll('.roadmap-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s ease';
                
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }, index * 200);
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
            errorDiv.style.cssText = `
                background: #fef2f2;
                color: #dc2626;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                border-left: 4px solid #dc2626;
                animation: slideInDown 0.3s ease;
            `;
            
            const currentStep = document.querySelector('.form-step.active');
            currentStep.insertBefore(errorDiv, currentStep.firstChild);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Masquer l'erreur après 5 secondes
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.animation = 'slideOutUp 0.3s ease';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Animation des compteurs
    animateCounters() {
        const counters = document.querySelectorAll('[data-target]');
        
        const animateCounter = (counter) => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const duration = 2000; // 2 secondes
            const start = performance.now();
            
            const update = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const current = target * easedProgress;
                
                // Formatage du nombre
                if (target % 1 === 0) {
                    counter.textContent = Math.floor(current);
                } else {
                    counter.textContent = current.toFixed(1);
                }
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            
            requestAnimationFrame(update);
        };

        // Observer pour déclencher l'animation quand visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    // Animations au scroll
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        // Éléments à animer
        const elementsToAnimate = document.querySelectorAll(`
            .problem-stat,
            .testimonial,
            .credential
        `);

        elementsToAnimate.forEach(el => {
            el.style.animation = 'fadeInUp 0.6s ease both';
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }
}

// Fonctions globales pour la navigation
function scrollToDemo() {
    document.getElementById('demo').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function nextStep() {
    window.auditApp.nextStep();
}

function prevStep() {
    window.auditApp.prevStep();
}

function downloadPDF() {
    // Simulation du téléchargement PDF
    // En production, on pourrait utiliser jsPDF ou une API backend
    alert('Fonctionnalité de téléchargement PDF à venir ! Pour l\'instant, vous pouvez faire une capture d\'écran de vos résultats.');
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.auditApp = new AuditFlashIA();
    
    // Animation de la barre de progression du mockup
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            bar.style.animation = 'progressAnimation 2s ease-out';
        });
    }, 1000);
});

// Smooth scroll pour tous les liens
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Ajouter des styles d'animation CSS dynamiquement
const animationStyles = `
@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideOutUp {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-20px);
    }
}

.roadmap-card {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
}

.roadmap-card.quick-wins {
    border-left-color: var(--accent-green) !important;
}

.roadmap-card.medium-term {
    border-left-color: var(--primary-cyan) !important;
}

.roadmap-card.long-term {
    border-left-color: var(--primary-blue) !important;
}
`;

// Injection des styles
if (!document.getElementById('dynamic-animations')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'dynamic-animations';
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
}