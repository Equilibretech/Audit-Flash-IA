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
        
        document.addEventListener('DOMContentLoaded', () => {
            this.animateCounters();
        });
    }

    initializeAnimations() {
        this.animateCounters();
        this.setupScrollAnimations();
    }

    // === NAVIGATION FORMULAIRE ===
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
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

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

    // === GESTION FORMULAIRE ===
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

    // === AFFICHAGE RÉSULTATS ===
    displayResults(roadmap) {
        const resultsSection = document.getElementById('resultsSection');
        const roadmapContent = document.getElementById('roadmapContent');
        const formData = this.collectFormData();
        
        // Afficher le nom de l'entreprise
        document.getElementById('companyNameResult').textContent = formData.company;
        
        // Générer des statistiques
        this.generateSummaryStats(formData);
        
        // Parser le JSON
        let parsedRoadmap;
        try {
            const cleanedRoadmap = roadmap.replace(/```json|```/g, '').trim();
            parsedRoadmap = JSON.parse(cleanedRoadmap);
            console.log('JSON parsed successfully:', parsedRoadmap);
        } catch (error) {
            console.log('JSON parsing failed, using HTML fallback:', error);
            const structuredContent = this.structureRoadmapTimeline(roadmap);
            roadmapContent.innerHTML = structuredContent;
            
            this.roadmapData = {
                company: formData.company,
                roadmap: roadmap,
                generatedAt: new Date().toISOString(),
                isJSON: false
            };
            
            resultsSection.classList.remove('hidden');
            setTimeout(() => this.animateResults(), 100);
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        
        // Utiliser le format JSON
        const structuredContent = this.structureRoadmapFromJSON(parsedRoadmap);
        roadmapContent.innerHTML = structuredContent;
        
        // Stocker les données pour le PDF
        this.roadmapData = {
            company: formData.company,
            roadmap: parsedRoadmap,
            generatedAt: new Date().toISOString(),
            isJSON: true,
            formData: formData
        };
        
        resultsSection.classList.remove('hidden');
        setTimeout(() => this.animateResults(), 100);
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    structureRoadmapFromJSON(roadmapJSON) {
        return roadmapJSON.sections.map((section, index) => {
            const timelineClass = this.getTimelineClassFromId(section.id);
            const duration = this.getTimelineDurationFromId(section.id);
            const marker = this.getTimelineMarkerFromId(section.id);
            
            const itemsHTML = section.items.map(item => `
                <div class="timeline-item-content">
                    <h5>${item.title}</h5>
                    <p>${item.description}</p>
                </div>
            `).join('');
            
            return `
                <div class="timeline-item" style="animation-delay: ${index * 0.3}s">
                    <div class="timeline-marker ${timelineClass}">
                        ${marker}
                    </div>
                    <div class="timeline-content-item">
                        <h4>${section.title}</h4>
                        <div class="timeline-duration">${duration}</div>
                        ${itemsHTML}
                    </div>
                </div>
            `;
        }).join('');
    }

    structureRoadmapTimeline(roadmap) {
        // Fallback pour HTML
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

        return sections.map((section, index) => {
            const timelineClass = this.getTimelineClass(section.title);
            const duration = this.getTimelineDuration(section.title);
            const marker = this.getTimelineMarker(section.title);
            
            return `
                <div class="timeline-item" style="animation-delay: ${index * 0.3}s">
                    <div class="timeline-marker ${timelineClass}">
                        ${marker}
                    </div>
                    <div class="timeline-content-item">
                        <h4>${section.title}</h4>
                        <div class="timeline-duration">${duration}</div>
                        ${section.content}
                    </div>
                </div>
            `;
        }).join('');
    }

    // === UTILITAIRES ===
    getTimelineClassFromId(id) {
        const classMap = {
            'diagnostic': 'diagnostic',
            'quick-wins': 'quick-wins',
            'moyen-terme': 'medium-term',
            'long-terme': 'long-term',
            'roi': 'roi'
        };
        return classMap[id] || 'quick-wins';
    }

    getTimelineDurationFromId(id) {
        const durationMap = {
            'diagnostic': 'Immédiat',
            'quick-wins': '1-4 semaines',
            'moyen-terme': '2-6 mois',
            'long-terme': '6-18 mois',
            'roi': 'Retour sur investissement'
        };
        return durationMap[id] || '1-4 semaines';
    }

    getTimelineMarkerFromId(id) {
        const markerMap = {
            'diagnostic': '🔍',
            'quick-wins': '⚡',
            'moyen-terme': '🚀',
            'long-terme': '🎯',
            'roi': '💰'
        };
        return markerMap[id] || '⚡';
    }

    getTimelineClass(title) {
        if (title.toLowerCase().includes('quick') || title.toLowerCase().includes('rapide')) {
            return 'quick-wins';
        } else if (title.toLowerCase().includes('moyen') || title.toLowerCase().includes('terme')) {
            return 'medium-term';
        } else if (title.toLowerCase().includes('long') || title.toLowerCase().includes('vision')) {
            return 'long-term';
        }
        return 'quick-wins';
    }

    getTimelineDuration(title) {
        if (title.toLowerCase().includes('quick') || title.toLowerCase().includes('rapide')) {
            return '1-4 semaines';
        } else if (title.toLowerCase().includes('moyen')) {
            return '2-6 mois';
        } else if (title.toLowerCase().includes('long') || title.toLowerCase().includes('vision')) {
            return '6-18 mois';
        }
        return 'Immédiat';
    }

    getTimelineMarker(title) {
        if (title.toLowerCase().includes('diagnostic')) return '🔍';
        if (title.toLowerCase().includes('quick') || title.toLowerCase().includes('rapide')) return '⚡';
        if (title.toLowerCase().includes('moyen')) return '🛠️';
        if (title.toLowerCase().includes('long') || title.toLowerCase().includes('vision')) return '🚀';
        if (title.toLowerCase().includes('roi')) return '💰';
        return '📋';
    }

    generateSummaryStats(formData) {
        const employeeCount = this.getEmployeeCount(formData.employees);
        const sectorMultiplier = this.getSectorMultiplier(formData.sector);
        
        const baseSavings = employeeCount * 2.5;
        const savings = Math.round(baseSavings * sectorMultiplier);
        
        const baseROI = savings * 38 * 12;
        const roi = Math.round(baseROI * (0.8 + Math.random() * 0.4));
        
        const automationScore = Math.round(55 + Math.random() * 30);
        
        this.animateCounter(document.getElementById('potentialSavings'), savings);
        this.animateCounter(document.getElementById('roiEstimate'), roi);
        this.animateCounter(document.getElementById('automationScore'), automationScore);
        
        const priority = this.generateTopPriority(formData);
        document.getElementById('topPriority').textContent = priority;
    }

    getEmployeeCount(employeeRange) {
        switch(employeeRange) {
            case '1-10': return 6;
            case '11-50': return 30;
            case '51-250': return 150;
            case '250+': return 400;
            default: return 20;
        }
    }

    getSectorMultiplier(sector) {
        const multipliers = {
            'esn': 1.3,
            'finance': 1.2,
            'service': 1.1,
            'commerce': 1.0,
            'industrie': 0.9,
            'sante': 0.8,
            'education': 0.7
        };
        return multipliers[sector] || 1.0;
    }

    generateTopPriority(formData) {
        const priorities = {
            'esn': 'Automatiser la gestion des tickets clients et le reporting projet',
            'finance': 'Centraliser les processus de validation et reporting financier',
            'service': 'Optimiser la gestion client et les workflows d\'approbation',
            'commerce': 'Automatiser la gestion des commandes et le suivi logistique',
            'industrie': 'Digitaliser les processus de production et maintenance',
            'sante': 'Simplifier la gestion des dossiers patients et plannings',
            'education': 'Automatiser les inscriptions et le suivi pédagogique'
        };
        return priorities[formData.sector] || 'Centraliser les emails et automatiser les tâches répétitives';
    }

    // === ANIMATIONS ===
    animateCounter(element, target) {
        if (!element) return;
        
        const duration = 2000;
        const start = performance.now();
        const startValue = 0;
        
        const update = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (target - startValue) * easedProgress);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
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
        const loadingContainer = document.getElementById('loadingContainer');
        
        if (isLoading) {
            btn.disabled = true;
            btn.classList.add('loading');
            btn.innerHTML = '<span>⏳ Génération en cours...</span>';
            this.showLoadingModal();
        } else {
            btn.disabled = false;
            btn.classList.remove('loading');
            btn.innerHTML = '<span id="btnText">🧠 Générer ma roadmap IA</span>';
            this.hideLoadingModal();
        }
    }

    showLoadingModal() {
        const loadingContainer = document.getElementById('loadingContainer');
        loadingContainer.style.display = 'flex';
        
        // Simulation des étapes de progression
        this.simulateProgress();
    }

    hideLoadingModal() {
        const loadingContainer = document.getElementById('loadingContainer');
        loadingContainer.style.display = 'none';
        
        // Reset des étapes
        this.resetProgress();
    }

    simulateProgress() {
        const steps = [
            { message: "Analyse de votre secteur d'activité...", duration: 3000 },
            { message: "Identification des processus à optimiser...", duration: 5000 },
            { message: "Calcul du ROI et des gains potentiels...", duration: 4000 },
            { message: "Génération de la roadmap personnalisée...", duration: 8000 },
            { message: "Finalisation du document PDF...", duration: 3000 }
        ];

        const progressBar = document.getElementById('progressBar');
        const loadingMessage = document.getElementById('loadingMessage');
        let currentStep = 0;
        let totalDuration = 0;

        steps.forEach(step => totalDuration += step.duration);
        let elapsedTime = 0;

        const updateStep = () => {
            if (currentStep < steps.length) {
                // Mise à jour du message
                loadingMessage.textContent = steps[currentStep].message;
                
                // Mise à jour des icônes d'étapes
                const stepIcon = document.getElementById(`step${currentStep + 1}`);
                stepIcon.classList.add('active');
                stepIcon.innerHTML = '⟳';
                
                // Marquer les étapes précédentes comme complétées
                for (let i = 0; i < currentStep; i++) {
                    const prevStep = document.getElementById(`step${i + 1}`);
                    prevStep.classList.remove('active');
                    prevStep.classList.add('completed');
                    prevStep.innerHTML = '✓';
                }

                // Mise à jour de la barre de progression
                const progress = ((currentStep + 1) / steps.length) * 100;
                progressBar.style.width = `${progress}%`;

                currentStep++;
                
                if (currentStep < steps.length) {
                    setTimeout(updateStep, steps[currentStep - 1].duration);
                } else {
                    // Dernière étape
                    setTimeout(() => {
                        const lastStep = document.getElementById(`step${steps.length}`);
                        lastStep.classList.remove('active');
                        lastStep.classList.add('completed');
                        lastStep.innerHTML = '✓';
                        loadingMessage.textContent = "Roadmap générée avec succès !";
                    }, steps[currentStep - 1].duration);
                }
            }
        };

        updateStep();
    }

    resetProgress() {
        const progressBar = document.getElementById('progressBar');
        const loadingMessage = document.getElementById('loadingMessage');
        
        progressBar.style.width = '0%';
        loadingMessage.textContent = 'Analyse de vos données en cours...';
        
        // Reset des icônes d'étapes
        for (let i = 1; i <= 5; i++) {
            const stepIcon = document.getElementById(`step${i}`);
            stepIcon.classList.remove('active', 'completed');
            stepIcon.innerHTML = i.toString();
        }
    }

    showError(message) {
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

    animateCounters() {
        const counters = document.querySelectorAll('[data-target]');
        
        const animateCounter = (counter) => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const duration = 2000;
            const start = performance.now();
            
            const update = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const current = target * easedProgress;
                
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

// === FONCTIONS GLOBALES ===
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

// === GÉNÉRATION PDF PROFESSIONNELLE AVEC PDFMAKE ===
function downloadPDF() {
    if (!window.auditApp || !window.auditApp.roadmapData) {
        alert('Veuillez d\'abord générer votre roadmap avant de la télécharger.');
        return;
    }

    // Vérifier si PDFMake est disponible
    if (typeof pdfMake === 'undefined') {
        const button = document.querySelector('button[onclick="downloadPDF()"]');
        const originalText = button.textContent;
        button.textContent = '📥 Chargement PDFMake...';
        button.disabled = true;
        
        // Charger PDFMake dynamiquement
        Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js')
        ]).then(() => {
            button.textContent = originalText;
            button.disabled = false;
            generateProfessionalPDF();
        }).catch(() => {
            button.textContent = originalText;
            button.disabled = false;
            alert('Erreur lors du chargement de PDFMake. Veuillez réessayer.');
        });
    } else {
        generateProfessionalPDF();
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function generateProfessionalPDF() {
    try {
        const data = window.auditApp.roadmapData;
        const formData = data.formData;
        
        // Calculer les stats
        const employeeCount = window.auditApp.getEmployeeCount(formData.employees);
        const sectorMultiplier = window.auditApp.getSectorMultiplier(formData.sector);
        const savings = Math.round(employeeCount * 2.5 * sectorMultiplier);
        const roi = Math.round(savings * 38 * 12);
        const automationScore = Math.round(55 + Math.random() * 30);
        
        // Template PDF universel
        const docDefinition = createUniversalTemplate(data, {
            savings,
            roi,
            automationScore,
            formData
        });
        
        // Générer le PDF
        const filename = `Roadmap-${data.company.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().slice(0,10)}.pdf`;
        pdfMake.createPdf(docDefinition).download(filename);
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                event_category: 'engagement',
                event_label: 'roadmap_pdf_universal'
            });
        }
        
    } catch (error) {
        console.error('Erreur PDF universel:', error);
        alert('Erreur lors de la génération du PDF');
    }
}

// === TEMPLATE PDF UNIVERSEL ===
function createUniversalTemplate(data, stats) {
    const { savings, roi, automationScore, formData } = stats;
    const date = new Date(data.generatedAt).toLocaleDateString('fr-FR');
    const sectorName = getSectorName(formData.sector);
    
    return {
        pageSize: 'A4',
        pageMargins: [50, 70, 50, 70],
        
        content: [
            // === EN-TÊTE PROFESSIONNEL ===
            {
                columns: [
                    {
                        width: '60%',
                        stack: [
                            { text: 'AVISTRA', style: 'brandTitle' },
                            { text: 'Audit Flash Automatisation', style: 'brandSubtitle' },
                            { text: '', margin: [0, 10, 0, 0] },
                            { text: 'RAPPORT PERSONNALISÉ', style: 'reportTitle' },
                            { text: data.company, style: 'companyName' }
                        ]
                    },
                    {
                        width: '40%',
                        stack: [
                            { text: 'Powered by AI', style: 'aiBadge', margin: [0, 0, 0, 15] },
                            { text: `Généré le ${date}`, style: 'dateText' },
                            { text: `Secteur : ${sectorName}`, style: 'sectorText' }
                        ],
                        alignment: 'right'
                    }
                ],
                margin: [0, 0, 0, 40]
            },
            
            // === BLOC 1 : DIAGNOSTIC EXPRESS ===
            {
                style: 'sectionBlock',
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: '1. DIAGNOSTIC EXPRESS', style: 'blockTitle' },
                            { 
                                text: `Problème identifié : Votre secteur ${sectorName} perd en moyenne 15-25h/semaine sur des processus manuels répétitifs, soit une perte de productivité estimée à ${Math.round(roi * 0.3 / 1000)}k€ annuels.`,
                                style: 'problemText'
                            }
                        ]
                    }]]
                },
                layout: {
                    fillColor: '#f8fafc',
                    hLineWidth: () => 0,
                    vLineWidth: () => 3,
                    vLineColor: () => '#e2e8f0',
                    paddingLeft: () => 25,
                    paddingRight: () => 25,
                    paddingTop: () => 20,
                    paddingBottom: () => 20
                },
                margin: [0, 0, 0, 25]
            },
            
            // === BLOC 2 : QUICK WINS ===
            {
                style: 'sectionBlock',
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: '2. QUICK WINS (0-3 mois)', style: 'blockTitle' },
                            {
                                columns: [
                                    {
                                        width: '50%',
                                        stack: [
                                            { text: 'Action immédiate #1', style: 'actionTitle' },
                                            { text: 'Automatisation de la gestion emails avec filtres intelligents (Zapier + Gmail). Gain estimé : 5h/semaine.', style: 'actionDesc' }
                                        ]
                                    },
                                    {
                                        width: '50%',
                                        stack: [
                                            { text: 'Action immédiate #2', style: 'actionTitle' },
                                            { text: 'Mise en place d\'un CRM simple (HubSpot gratuit) pour centraliser les contacts. Gain : 3h/semaine.', style: 'actionDesc' }
                                        ]
                                    }
                                ],
                                columnGap: 20
                            }
                        ]
                    }]]
                },
                layout: {
                    fillColor: '#f8fafc',
                    hLineWidth: () => 0,
                    vLineWidth: () => 3,
                    vLineColor: () => '#e2e8f0',
                    paddingLeft: () => 25,
                    paddingRight: () => 25,
                    paddingTop: () => 20,
                    paddingBottom: () => 20
                },
                margin: [0, 0, 0, 25]
            },
            
            // === BLOC 3 : PROJETS MOYEN TERME ===
            {
                style: 'sectionBlock',
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: '3. PROJETS MOYEN TERME (3-6 mois)', style: 'blockTitle' },
                            { text: 'Intégration CRM → Outils comptables', style: 'actionTitle' },
                            { text: 'Connexion automatique entre votre CRM et votre logiciel de facturation pour une coordination optimale des équipes.', style: 'actionDesc' },
                            { text: '', margin: [0, 8, 0, 0] },
                            { text: 'Timeline : CRM (mois 1) → Formation équipe (mois 2) → Intégration facturation (mois 3-4)', style: 'timelineText' }
                        ]
                    }]]
                },
                layout: {
                    fillColor: '#f8fafc',
                    hLineWidth: () => 0,
                    vLineWidth: () => 3,
                    vLineColor: () => '#e2e8f0',
                    paddingLeft: () => 25,
                    paddingRight: () => 25,
                    paddingTop: () => 20,
                    paddingBottom: () => 20
                },
                margin: [0, 0, 0, 25]
            },
            
            // === BLOC 4 : VISION LONG TERME ===
            {
                style: 'sectionBlock',
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: '4. VISION LONG TERME (6-12 mois)', style: 'blockTitle' },
                            { text: 'Vers un écosystème digital complet', style: 'visionTitle' },
                            { text: 'Déploiement d\'un workflow intégré : Prospection → CRM → Facturation → Reporting, avec tableaux de bord en temps réel.', style: 'actionDesc' }
                        ]
                    }]]
                },
                layout: {
                    fillColor: '#f8fafc',
                    hLineWidth: () => 0,
                    vLineWidth: () => 3,
                    vLineColor: () => '#e2e8f0',
                    paddingLeft: () => 25,
                    paddingRight: () => 25,
                    paddingTop: () => 20,
                    paddingBottom: () => 20
                },
                margin: [0, 0, 0, 25]
            },
            
            // === BLOC 5 : ROI ESTIMÉ (3 CARTES VISUELLES) ===
            {
                columns: [
                    {
                        width: '33%',
                        style: 'kpiCard',
                        table: {
                            body: [[{
                                stack: [
                                    { text: `${savings}h`, style: 'kpiNumber' },
                                    { text: 'économisées', style: 'kpiLabel' },
                                    { text: 'par mois', style: 'kpiPeriod' }
                                ],
                                alignment: 'center'
                            }]]
                        },
                        layout: {
                            fillColor: '#ffffff',
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => '#10b981',
                            vLineColor: () => '#10b981',
                            paddingLeft: () => 20,
                            paddingRight: () => 20,
                            paddingTop: () => 25,
                            paddingBottom: () => 25
                        }
                    },
                    {
                        width: '33%',
                        style: 'kpiCard',
                        table: {
                            body: [[{
                                stack: [
                                    { text: `${Math.round(roi/1000)}k€`, style: 'kpiNumber' },
                                    { text: 'de gains', style: 'kpiLabel' },
                                    { text: 'par an', style: 'kpiPeriod' }
                                ],
                                alignment: 'center'
                            }]]
                        },
                        layout: {
                            fillColor: '#ffffff',
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => '#3b82f6',
                            vLineColor: () => '#3b82f6',
                            paddingLeft: () => 20,
                            paddingRight: () => 20,
                            paddingTop: () => 25,
                            paddingBottom: () => 25
                        }
                    },
                    {
                        width: '33%',
                        style: 'kpiCard',
                        table: {
                            body: [[{
                                stack: [
                                    { text: '6 mois', style: 'kpiNumber' },
                                    { text: 'retour', style: 'kpiLabel' },
                                    { text: 'investissement', style: 'kpiPeriod' }
                                ],
                                alignment: 'center'
                            }]]
                        },
                        layout: {
                            fillColor: '#ffffff',
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => '#64748b',
                            vLineColor: () => '#64748b',
                            paddingLeft: () => 20,
                            paddingRight: () => 20,
                            paddingTop: () => 25,
                            paddingBottom: () => 25
                        }
                    }
                ],
                columnGap: 15,
                margin: [0, 0, 0, 30]
            },
            
            // === BLOC 6 : CALL TO ACTION ===
            {
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: 'AUDIT GRATUIT 30 MIN – RÉPONSE SOUS 24H', style: 'ctaTitle' },
                            { text: '', margin: [0, 8, 0, 0] },
                            {
                                columns: [
                                    {
                                        width: '50%',
                                        stack: [
                                            { text: 'Votre audit comprend :', style: 'ctaSubtitle' },
                                            { text: '• Analyse détaillée de vos processus', style: 'ctaItem' },
                                            { text: '• Estimation précise des gains', style: 'ctaItem' },
                                            { text: '• Plan de mise en œuvre sur-mesure', style: 'ctaItem' },
                                            { text: '• Démonstration en live', style: 'ctaItem' }
                                        ]
                                    },
                                    {
                                        width: '50%',
                                        stack: [
                                            { text: 'Réservez votre créneau', style: 'ctaButton' },
                                            { text: '', margin: [0, 10, 0, 0] },
                                            { text: 'contact@equilibretech.com', style: 'contactMain' },
                                            { text: 'linkedin.com/in/equilibretech', style: 'contactSecondary' }
                                        ],
                                        alignment: 'center'
                                    }
                                ],
                                columnGap: 20
                            }
                        ]
                    }]]
                },
                layout: {
                    fillColor: '#1e293b',
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingLeft: () => 30,
                    paddingRight: () => 30,
                    paddingTop: () => 25,
                    paddingBottom: () => 25
                },
                margin: [0, 10, 0, 0]
            }
        ],
        
        // === STYLES PROFESSIONNELS ÉPURÉS ===
        styles: {
            // Branding
            brandTitle: { 
                fontSize: 20, 
                bold: true, 
                color: '#1e293b',
                letterSpacing: 2
            },
            brandSubtitle: { 
                fontSize: 10, 
                color: '#64748b',
                margin: [0, 0, 0, 0] 
            },
            reportTitle: { 
                fontSize: 16, 
                bold: true, 
                color: '#3b82f6',
                margin: [0, 0, 0, 5] 
            },
            companyName: { 
                fontSize: 14, 
                bold: true, 
                color: '#1e293b' 
            },
            aiBadge: { 
                fontSize: 8, 
                color: '#64748b',
                italics: true 
            },
            dateText: { 
                fontSize: 9, 
                color: '#64748b' 
            },
            sectorText: { 
                fontSize: 9, 
                color: '#64748b' 
            },
            
            // Blocs de section
            sectionBlock: { 
                margin: [0, 0, 0, 15] 
            },
            blockTitle: { 
                fontSize: 13, 
                bold: true, 
                color: '#1e293b',
                margin: [0, 0, 0, 12] 
            },
            problemText: { 
                fontSize: 11, 
                color: '#374151',
                lineHeight: 1.4,
                italics: true 
            },
            
            // Actions
            actionTitle: { 
                fontSize: 11, 
                bold: true, 
                color: '#1e293b',
                margin: [0, 0, 0, 6] 
            },
            actionDesc: { 
                fontSize: 10, 
                color: '#374151',
                lineHeight: 1.3 
            },
            timelineText: { 
                fontSize: 9, 
                color: '#64748b',
                italics: true 
            },
            visionTitle: { 
                fontSize: 12, 
                bold: true, 
                color: '#3b82f6',
                margin: [0, 0, 0, 8] 
            },
            
            // KPI Cards
            kpiCard: { 
                margin: [0, 0, 0, 0] 
            },
            kpiNumber: { 
                fontSize: 24, 
                bold: true, 
                color: '#1e293b' 
            },
            kpiLabel: { 
                fontSize: 10, 
                color: '#64748b',
                margin: [0, 2, 0, 0] 
            },
            kpiPeriod: { 
                fontSize: 8, 
                color: '#94a3b8' 
            },
            
            // CTA
            ctaTitle: { 
                fontSize: 14, 
                bold: true, 
                color: '#ffffff',
                alignment: 'center',
                margin: [0, 0, 0, 0] 
            },
            ctaSubtitle: { 
                fontSize: 11, 
                bold: true, 
                color: '#e2e8f0',
                margin: [0, 0, 0, 8] 
            },
            ctaItem: { 
                fontSize: 10, 
                color: '#cbd5e1',
                margin: [0, 0, 0, 3] 
            },
            ctaButton: { 
                fontSize: 12, 
                bold: true, 
                color: '#ffffff',
                background: '#3b82f6',
                alignment: 'center' 
            },
            contactMain: { 
                fontSize: 11, 
                bold: true, 
                color: '#ffffff' 
            },
            contactSecondary: { 
                fontSize: 9, 
                color: '#cbd5e1' 
            }
        },
        
        // === POLICES PROFESSIONNELLES ===
        defaultStyle: {
            font: 'Helvetica',
            fontSize: 10
        }
    };
}

function generateRoadmapContent(data) {
    if (!data.isJSON || !data.roadmap.sections) {
        return [{ text: 'Roadmap générée par IA - Contenu personnalisé selon votre profil', style: 'itemDescription' }];
    }
    
    const sections = data.roadmap.sections;
    const sectionColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    
    return sections.map((section, index) => {
        const color = sectionColors[index % sectionColors.length];
        
        return {
            stack: [
                // Header section
                {
                    table: {
                        widths: ['auto', '*'],
                        body: [
                            [
                                {
                                    table: {
                                        body: [[{ text: (index + 1).toString(), style: 'sectionNumber' }]]
                                    },
                                    layout: {
                                        fillColor: 'white',
                                        hLineWidth: () => 0,
                                        vLineWidth: () => 0,
                                        paddingLeft: () => 8,
                                        paddingRight: () => 8,
                                        paddingTop: () => 6,
                                        paddingBottom: () => 6
                                    }
                                },
                                { text: section.title, style: 'sectionTitle' }
                            ]
                        ]
                    },
                    layout: {
                        fillColor: color,
                        hLineWidth: () => 0,
                        vLineWidth: () => 0,
                        paddingLeft: () => 15,
                        paddingRight: () => 15,
                        paddingTop: () => 10,
                        paddingBottom: () => 10
                    }
                },
                
                // Items de la section
                {
                    stack: section.items.map((item, itemIndex) => ({
                        columns: [
                            {
                                width: 15,
                                canvas: [
                                    {
                                        type: 'ellipse',
                                        x: 7, y: 7,
                                        r1: 4, r2: 4,
                                        color: color
                                    }
                                ]
                            },
                            {
                                width: '*',
                                stack: [
                                    { text: item.title, style: 'itemTitle', color: color },
                                    { text: item.description, style: 'itemDescription' }
                                ]
                            }
                        ],
                        margin: [10, 10, 0, itemIndex === section.items.length - 1 ? 20 : 10]
                    }))
                }
            ],
            margin: [0, 0, 0, 15]
        };
    });
}

function getSectorName(sector) {
    const sectorNames = {
        'esn': 'ESN / Services Numériques',
        'finance': 'Finance / Banque',
        'service': 'Services',
        'commerce': 'Commerce / Retail', 
        'industrie': 'Industrie / Manufacturing',
        'sante': 'Santé / Médical',
        'education': 'Éducation / Formation'
    };
    return sectorNames[sector] || 'Services';
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.auditApp = new AuditFlashIA();
    
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