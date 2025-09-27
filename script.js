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
        pageMargins: [40, 60, 40, 60],
        
        content: [
            // === HEADER UNIVERSEL ===
            {
                columns: [
                    {
                        width: '70%',
                        stack: [
                            { text: 'ROADMAP AUTOMATISATION', style: 'mainTitle' },
                            { text: `${data.company} - Gains concrets garantis`, style: 'subtitle' }
                        ]
                    },
                    {
                        width: '30%',
                        stack: [
                            {
                                table: {
                                    body: [
                                        [{ text: 'POWERED BY AI', style: 'aiBadge' }]
                                    ]
                                },
                                layout: {
                                    fillColor: '#3b82f6',
                                    hLineWidth: () => 0,
                                    vLineWidth: () => 0,
                                    paddingLeft: () => 12,
                                    paddingRight: () => 12,
                                    paddingTop: () => 6,
                                    paddingBottom: () => 6
                                }
                            },
                            { text: `Rapport ${date}`, style: 'dateText', margin: [0, 5, 0, 0] }
                        ]
                    }
                ],
                margin: [0, 0, 0, 30]
            },
            
            // === URGENCE UNIVERSELLE ===
            {
                table: {
                    widths: ['*'],
                    body: [
                        [{
                            stack: [
                                { text: '⚠️ PERTE DE PRODUCTIVITÉ DÉTECTÉE', style: 'urgencyTitle' },
                                { text: `Votre secteur ${sectorName} perd en moyenne 15-25h/semaine en tâches répétitives`, style: 'urgencyText' },
                                { text: 'Cette roadmap vous donne 6-12 mois d\'avance concurrentielle', style: 'urgencyBenefit' }
                            ]
                        }]
                    ]
                },
                layout: {
                    fillColor: '#fef3c7',
                    hLineWidth: () => 0,
                    vLineWidth: () => 3,
                    vLineColor: () => '#f59e0b',
                    paddingLeft: () => 25,
                    paddingRight: () => 25,
                    paddingTop: () => 15,
                    paddingBottom: () => 15
                },
                margin: [0, 0, 0, 30]
            },
            
            // === 3 KPI CENTRAUX UNIVERSELS ===
            {
                columns: [
                    {
                        width: '33%',
                        table: {
                            body: [[{
                                stack: [
                                    { text: '⏱️', style: 'kpiIcon' },
                                    { text: `${savings}h`, style: 'kpiNumber', color: '#10b981' },
                                    { text: 'ÉCONOMISÉES', style: 'kpiUnit' },
                                    { text: 'Chaque mois', style: 'kpiLabel' }
                                ],
                                alignment: 'center'
                            }]]
                        },
                        layout: {
                            fillColor: '#ecfdf5',
                            hLineWidth: () => 2,
                            vLineWidth: () => 2,
                            hLineColor: () => '#10b981',
                            vLineColor: () => '#10b981',
                            paddingLeft: () => 20,
                            paddingRight: () => 20,
                            paddingTop: () => 20,
                            paddingBottom: () => 20
                        }
                    },
                    {
                        width: '33%',
                        table: {
                            body: [[{
                                stack: [
                                    { text: '💶', style: 'kpiIcon' },
                                    { text: `${Math.round(roi/1000)}k€`, style: 'kpiNumber', color: '#3b82f6' },
                                    { text: 'DE GAINS', style: 'kpiUnit' },
                                    { text: 'La première année', style: 'kpiLabel' }
                                ],
                                alignment: 'center'
                            }]]
                        },
                        layout: {
                            fillColor: '#eff6ff',
                            hLineWidth: () => 2,
                            vLineWidth: () => 2,
                            hLineColor: () => '#3b82f6',
                            vLineColor: () => '#3b82f6',
                            paddingLeft: () => 20,
                            paddingRight: () => 20,
                            paddingTop: () => 20,
                            paddingBottom: () => 20
                        }
                    },
                    {
                        width: '33%',
                        table: {
                            body: [[{
                                stack: [
                                    { text: '🎯', style: 'kpiIcon' },
                                    { text: '6 mois', style: 'kpiNumber', color: '#8b5cf6' },
                                    { text: 'RETOUR', style: 'kpiUnit' },
                                    { text: 'Investissement', style: 'kpiLabel' }
                                ],
                                alignment: 'center'
                            }]]
                        },
                        layout: {
                            fillColor: '#faf5ff',
                            hLineWidth: () => 2,
                            vLineWidth: () => 2,
                            hLineColor: () => '#8b5cf6',
                            vLineColor: () => '#8b5cf6',
                            paddingLeft: () => 20,
                            paddingRight: () => 20,
                            paddingTop: () => 20,
                            paddingBottom: () => 20
                        }
                    }
                ],
                columnGap: 12,
                margin: [0, 0, 0, 30]
            },
            
            // === ROADMAP GÉNÉRÉE ===
            ...generateRoadmapContent(data),
            
            // === CTA FINAL ===
            {
                table: {
                    widths: ['60%', '40%'],
                    body: [
                        [
                            {
                                stack: [
                                    { text: '🎯 AUDIT GRATUIT 30 MIN', style: 'ctaTitle' },
                                    { text: '✓ Analyse de votre situation actuelle', style: 'ctaItem' },
                                    { text: '✓ Estimation précise des gains', style: 'ctaItem' },
                                    { text: '✓ Plan de mise en œuvre personnalisé', style: 'ctaItem' },
                                    { text: '✓ Démonstration sur vos données', style: 'ctaItem' }
                                ]
                            },
                            {
                                stack: [
                                    { text: '📞 RÉPONSE SOUS 24H', style: 'contactTitle' },
                                    { text: 'Antoine Verdure', style: 'contactName' },
                                    { text: 'Expert Automatisation', style: 'contactRole' },
                                    { text: '', margin: [0, 8, 0, 0] },
                                    { text: '📧 contact@equilibretech.com', style: 'contactInfo' },
                                    { text: '🔗 linkedin.com/in/antoine-verdure', style: 'contactInfo' }
                                ]
                            }
                        ]
                    ]
                },
                layout: {
                    fillColor: '#f1f5f9',
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#d1d5db',
                    vLineColor: () => '#d1d5db',
                    paddingLeft: () => 20,
                    paddingRight: () => 20,
                    paddingTop: () => 20,
                    paddingBottom: () => 20
                }
            }
        ],
        
        // === STYLES UNIVERSELS ===
        styles: {
            // Headers
            mainTitle: { fontSize: 24, bold: true, color: '#1e293b' },
            subtitle: { fontSize: 16, color: '#3b82f6', margin: [0, 4, 0, 0] },
            aiBadge: { fontSize: 8, bold: true, color: 'white', alignment: 'center' },
            dateText: { fontSize: 8, color: '#9ca3af', alignment: 'right' },
            
            // Urgence
            urgencyTitle: { fontSize: 13, bold: true, color: '#f59e0b', margin: [0, 0, 0, 5] },
            urgencyText: { fontSize: 10, color: '#1e293b', margin: [0, 0, 0, 5] },
            urgencyBenefit: { fontSize: 9, bold: true, color: '#10b981' },
            
            // KPI
            kpiIcon: { fontSize: 20, alignment: 'center', margin: [0, 0, 0, 8] },
            kpiNumber: { fontSize: 28, bold: true, alignment: 'center', margin: [0, 0, 0, 4] },
            kpiUnit: { fontSize: 8, bold: true, color: '#6b7280', alignment: 'center', margin: [0, 0, 0, 4] },
            kpiLabel: { fontSize: 9, color: '#374151', alignment: 'center' },
            
            // Sections roadmap
            sectionTitle: { fontSize: 14, bold: true, color: 'white', margin: [0, 0, 0, 0] },
            sectionNumber: { fontSize: 10, bold: true, color: 'white' },
            itemTitle: { fontSize: 11, bold: true, margin: [0, 0, 0, 4] },
            itemDescription: { fontSize: 10, color: '#374151', lineHeight: 1.3 },
            
            // CTA
            ctaTitle: { fontSize: 11, bold: true, color: '#10b981', margin: [0, 0, 0, 8] },
            ctaItem: { fontSize: 8, color: '#374151', margin: [0, 0, 0, 2] },
            
            // Contact
            contactTitle: { fontSize: 9, bold: true, color: '#1e293b', alignment: 'center', margin: [0, 0, 0, 8] },
            contactName: { fontSize: 10, bold: true, color: '#3b82f6', alignment: 'center', margin: [0, 0, 0, 2] },
            contactRole: { fontSize: 8, color: '#6b7280', alignment: 'center', margin: [0, 0, 0, 8] },
            contactInfo: { fontSize: 7, color: '#374151', alignment: 'center', margin: [0, 0, 0, 2] }
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