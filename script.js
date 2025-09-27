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
        const formData = this.collectFormData();
        
        // Afficher le nom de l'entreprise
        document.getElementById('companyNameResult').textContent = formData.company;
        
        // Générer des statistiques simulées basées sur les données
        this.generateSummaryStats(formData);
        
        // Structurer les résultats en timeline
        const structuredContent = this.structureRoadmapTimeline(roadmap);
        roadmapContent.innerHTML = structuredContent;
        
        // Stocker les données pour le PDF
        this.roadmapData = {
            company: formData.company,
            roadmap: roadmap,
            generatedAt: new Date().toISOString()
        };
        
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

    structureRoadmapTimeline(roadmap) {
        // Parser le contenu HTML retourné par l'IA et le structurer en timeline
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

        // Générer la timeline
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
        // Générer des statistiques basées sur le secteur et la taille
        const employeeCount = this.getEmployeeCount(formData.employees);
        const sectorMultiplier = this.getSectorMultiplier(formData.sector);
        
        const baseSavings = employeeCount * 2; // heures par mois
        const savings = Math.round(baseSavings * sectorMultiplier);
        
        const baseROI = savings * 35 * 12; // 35€/heure approximatif
        const roi = Math.round(baseROI * (0.8 + Math.random() * 0.4)); // Variation de ±20%
        
        const automationScore = Math.round(45 + Math.random() * 40); // Entre 45% et 85%
        
        // Animer les compteurs
        this.animateCounter(document.getElementById('potentialSavings'), savings);
        this.animateCounter(document.getElementById('roiEstimate'), roi);
        this.animateCounter(document.getElementById('automationScore'), automationScore);
        
        // Mettre à jour la priorité
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
    if (!window.auditApp || !window.auditApp.roadmapData) {
        alert('Veuillez d\'abord générer votre roadmap avant de la télécharger.');
        return;
    }

    // Vérifier si jsPDF est disponible
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        // Afficher un message de chargement
        const button = document.querySelector('button[onclick="downloadPDF()"]');
        const originalText = button.textContent;
        button.textContent = '📥 Chargement de jsPDF...';
        button.disabled = true;
        
        // Charger jsPDF dynamiquement
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            button.textContent = originalText;
            button.disabled = false;
            generatePDF();
        };
        script.onerror = () => {
            button.textContent = originalText;
            button.disabled = false;
            alert('Erreur lors du chargement de jsPDF. Veuillez réessayer.');
        };
        document.head.appendChild(script);
    } else {
        generatePDF();
    }
}

function generatePDF() {
    try {
        let jsPDF;
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDF = window.jspdf.jsPDF;
        } else if (window.jsPDF) {
            jsPDF = window.jsPDF;
        } else {
            alert('Impossible de charger jsPDF');
            return;
        }
        
        const doc = new jsPDF();
        const data = window.auditApp.roadmapData;
        const margin = 20;
        let yPosition = margin;
        
        // Couleurs professionnelles
        const colors = {
            primary: [15, 23, 42],
            cyan: [6, 182, 212],
            green: [16, 185, 129],
            gray: [75, 85, 99],
            lightGray: [156, 163, 175],
            background: [248, 250, 252]
        };
        
        // ===== PAGE 1: COUVERTURE PROFESSIONNELLE =====
        
        // Header avec dégradé simulé
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, 210, 50, 'F');
        
        // Badge "Powered by IA"
        doc.setFillColor(255, 255, 255);
        doc.rect(150, 10, 50, 15, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...colors.cyan);
        doc.setFont('helvetica', 'bold');
        doc.text('POWERED BY AI', 175, 20, { align: 'center' });
        
        // Titre principal
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('ROADMAP D\'AUTOMATISATION', 105, 25, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Analyse personnalisée par Intelligence Artificielle', 105, 35, { align: 'center' });
        
        yPosition = 70;
        
        // Box entreprise avec style
        doc.setFillColor(...colors.background);
        doc.rect(margin, yPosition, 170, 35, 'F');
        doc.setDrawColor(...colors.cyan);
        doc.setLineWidth(0.5);
        doc.rect(margin, yPosition, 170, 35, 'S');
        
        doc.setFontSize(18);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text(data.company, margin + 10, yPosition + 15);
        
        const date = new Date(data.generatedAt).toLocaleDateString('fr-FR');
        doc.setFontSize(10);
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rapport généré le ${date}`, margin + 10, yPosition + 25);
        
        yPosition += 55;
        
        // Stats avec design professionnel
        const formData = window.auditApp.collectFormData();
        const employeeCount = window.auditApp.getEmployeeCount(formData.employees);
        const sectorMultiplier = window.auditApp.getSectorMultiplier(formData.sector);
        const savings = Math.round(employeeCount * 2.5 * sectorMultiplier);
        const roi = Math.round(savings * 38 * 12);
        const automationScore = Math.round(55 + Math.random() * 30);
        
        // Titre synthèse
        doc.setFontSize(14);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('SYNTHÈSE EXÉCUTIVE', margin, yPosition);
        yPosition += 20;
        
        // Stats SANS icônes problématiques
        const stats = [
            { icon: '●', label: 'Heures économisées/mois', value: `${savings}h`, color: colors.green },
            { icon: '●', label: 'ROI annuel estimé', value: `${roi.toLocaleString('fr-FR').replace(/\s/g, ' ')}€`, color: colors.cyan },
            { icon: '●', label: 'Potentiel d\'automatisation', value: `${automationScore}%`, color: colors.primary }
        ];
        
        stats.forEach((stat, index) => {
            // Box pour chaque stat
            doc.setFillColor(255, 255, 255);
            doc.rect(margin, yPosition, 170, 20, 'F');
            doc.setDrawColor(...stat.color);
            doc.setLineWidth(0.3);
            doc.rect(margin, yPosition, 170, 20, 'S');
            
            // Barre de couleur à gauche
            doc.setFillColor(...stat.color);
            doc.rect(margin, yPosition, 3, 20, 'F');
            
            // Icône
            doc.setFontSize(12);
            doc.setTextColor(...stat.color);
            doc.text(stat.icon, margin + 8, yPosition + 13);
            
            // Label
            doc.setFontSize(10);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'normal');
            doc.text(stat.label, margin + 20, yPosition + 8);
            
            // Valeur
            doc.setFontSize(12);
            doc.setTextColor(...stat.color);
            doc.setFont('helvetica', 'bold');
            doc.text(stat.value, margin + 20, yPosition + 16);
            
            yPosition += 25;
        });
        
        yPosition += 20;
        
        // Section contact stylée
        doc.setFillColor(...colors.primary);
        doc.rect(margin, yPosition, 170, 50, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('VOTRE EXPERT EN AUTOMATISATION', margin + 10, yPosition + 15);
        
        doc.setFontSize(10);
        doc.setTextColor(...colors.cyan);
        doc.setFont('helvetica', 'bold');
        doc.text('Antoine - Equilibre Tech', margin + 10, yPosition + 25);
        
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.text('Spécialiste en automatisation et transformation digitale', margin + 10, yPosition + 33);
        doc.text('Email: contact@equilibretech.com', margin + 10, yPosition + 38);
        doc.text('LinkedIn: linkedin.com/in/equilibretech', margin + 10, yPosition + 46);
        
        // ===== PAGE 2: PLAN D'ACTION PROFESSIONNEL =====
        doc.addPage();
        yPosition = margin;
        
        // Header page 2
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN D\'ACTION PERSONNALISÉ', 105, 20, { align: 'center' });
        
        yPosition = 50;
        
        // Parser avec design professionnel
        if (data.roadmap && data.roadmap.trim()) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.roadmap;
            
            let sectionCount = 0;
            const sectionIcons = ['1', '2', '3', '4', '5'];
            const sectionColors = [colors.primary, colors.green, colors.cyan, colors.primary, colors.green];
            
            // Traiter les H3 et UL avec design professionnel
            Array.from(tempDiv.children).forEach(element => {
                if (yPosition > 240) {
                    doc.addPage();
                    yPosition = margin + 20;
                }
                
                if (element.tagName === 'H3') {
                    const currentColor = sectionColors[sectionCount] || colors.cyan;
                    const currentIcon = sectionIcons[sectionCount] || '•';
                    
                    // Background coloré pour le titre
                    doc.setFillColor(...currentColor, 0.1);
                    doc.rect(margin, yPosition - 5, 170, 25, 'F');
                    
                    // Bordure gauche colorée
                    doc.setFillColor(...currentColor);
                    doc.rect(margin, yPosition - 5, 4, 25, 'F');
                    
                    // Numéro dans un cercle
                    doc.setFillColor(...currentColor);
                    doc.circle(margin + 15, yPosition + 8, 8, 'F');
                    doc.setFontSize(12);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text(currentIcon, margin + 12, yPosition + 12);
                    
                    // Titre de section
                    const cleanTitle = element.textContent.replace(/^\d+\.\s*/, '').replace(/[^\w\s]/g, '').trim();
                    doc.setFontSize(13);
                    doc.setTextColor(...currentColor);
                    doc.setFont('helvetica', 'bold');
                    doc.text(cleanTitle.toUpperCase(), margin + 30, yPosition + 12);
                    
                    sectionCount++;
                    yPosition += 30;
                } else if (element.tagName === 'UL') {
                    const currentColor = sectionColors[sectionCount - 1] || colors.cyan;
                    
                    Array.from(element.querySelectorAll('li')).forEach(li => {
                        if (yPosition > 260) {
                            doc.addPage();
                            yPosition = margin + 10;
                        }
                        
                        // Puce colorée
                        doc.setFillColor(...currentColor);
                        doc.circle(margin + 8, yPosition + 2, 2, 'F');
                        
                        // Texte de l'item
                        let itemText = li.textContent.trim();
                        
                        // Séparer titre et description si il y a ":"
                        const parts = itemText.split(':');
                        if (parts.length > 1) {
                            // Titre en gras
                            doc.setFontSize(10);
                            doc.setTextColor(...currentColor);
                            doc.setFont('helvetica', 'bold');
                            doc.text(`${parts[0].trim()}:`, margin + 15, yPosition + 5);
                            yPosition += 12;
                            
                            // Description
                            doc.setFontSize(9);
                            doc.setTextColor(...colors.gray);
                            doc.setFont('helvetica', 'normal');
                            const description = parts.slice(1).join(':').trim();
                            const lines = doc.splitTextToSize(description, 155);
                            lines.forEach(line => {
                                doc.text(line, margin + 15, yPosition);
                                yPosition += 10;
                            });
                        } else {
                            // Texte simple
                            doc.setFontSize(9);
                            doc.setTextColor(...colors.gray);
                            doc.setFont('helvetica', 'normal');
                            const lines = doc.splitTextToSize(itemText, 155);
                            lines.forEach(line => {
                                doc.text(line, margin + 15, yPosition);
                                yPosition += 10;
                            });
                        }
                        
                        yPosition += 8;
                    });
                    yPosition += 15;
                }
            });
        } else {
            // Fallback design professionnel
            doc.setFillColor(...colors.background);
            doc.rect(margin, yPosition, 170, 40, 'F');
            doc.setDrawColor(...colors.lightGray);
            doc.rect(margin, yPosition, 170, 40, 'S');
            
            doc.setFontSize(12);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'italic');
            doc.text('Plan d\'action en cours de génération...', margin + 10, yPosition + 20);
            doc.setFontSize(10);
            doc.text('Veuillez générer une nouvelle roadmap.', margin + 10, yPosition + 30);
        }
        
        // Pied de page professionnel
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Ligne de séparation
            doc.setDrawColor(...colors.lightGray);
            doc.setLineWidth(0.3);
            doc.line(margin, 282, 190, 282);
            
            // Texte du pied
            doc.setFontSize(8);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'normal');
            doc.text('Audit Flash IA - Equilibre Tech', margin, 290);
            
            // Contact dans le pied
            if (i > 1) {
                doc.setTextColor(...colors.cyan);
                doc.text('contact@equilibretech.com', 105, 290, { align: 'center' });
            }
            
            // Numéro de page
            doc.setTextColor(...colors.gray);
            doc.text(`Page ${i}/${pageCount}`, 190, 290, { align: 'right' });
        }
        
        // Téléchargement
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `Roadmap-Pro-${data.company.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.pdf`;
        doc.save(filename);
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                event_category: 'engagement',
                event_label: 'roadmap_pdf_professional'
            });
        }
        
    } catch (error) {
        console.error('Erreur PDF:', error);
        alert('Erreur lors de la génération du PDF');
    }
}

function generateSimplePDF() {
    // Version de secours simple
    try {
        let jsPDF;
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDF = window.jspdf.jsPDF;
        } else if (window.jsPDF) {
            jsPDF = window.jsPDF;
        } else {
            alert('Impossible de charger jsPDF. Veuillez faire une capture d\'écran de vos résultats ou réessayer plus tard.');
            return;
        }
        
        const doc = new jsPDF();
        const data = window.auditApp.roadmapData;
        const margin = 20;
        let yPosition = margin;
        
        // Titre simple
        doc.setFontSize(18);
        doc.text('ROADMAP D\'AUTOMATISATION', margin, yPosition);
        yPosition += 20;
        
        doc.setFontSize(14);
        doc.text(`Entreprise: ${data.company}`, margin, yPosition);
        yPosition += 15;
        
        const date = new Date(data.generatedAt).toLocaleDateString('fr-FR');
        doc.setFontSize(12);
        doc.text(`Généré le: ${date}`, margin, yPosition);
        yPosition += 20;
        
        // Contenu simple
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.roadmap;
        
        Array.from(tempDiv.children).forEach(element => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = margin;
            }
            
            if (element.tagName === 'H3') {
                doc.setFontSize(14);
                doc.text(element.textContent, margin, yPosition);
                yPosition += 15;
            } else if (element.tagName === 'UL') {
                doc.setFontSize(11);
                Array.from(element.querySelectorAll('li')).forEach(li => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    doc.text(`• ${li.textContent}`, margin + 5, yPosition);
                    yPosition += 10;
                });
                yPosition += 10;
            }
        });
        
        // Contact
        yPosition += 20;
        if (yPosition > 220) {
            doc.addPage();
            yPosition = margin;
        }
        
        doc.setFontSize(14);
        doc.text('CONTACT EXPERT', margin, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.text('Antoine - Equilibre Tech', margin, yPosition);
        yPosition += 10;
        doc.text('contact@equilibretech.com', margin, yPosition);
        yPosition += 10;
        doc.text('linkedin.com/in/equilibretech', margin, yPosition);
        
        const filename = `roadmap-${data.company.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        doc.save(filename);
        
    } catch (error) {
        console.error('Erreur PDF simple:', error);
        alert('Erreur lors de la génération du PDF. Veuillez faire une capture d\'écran de vos résultats.');
    }
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