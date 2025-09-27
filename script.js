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
        // Vérifier la disponibilité de jsPDF
        let jsPDF;
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDF = window.jspdf.jsPDF;
        } else if (window.jsPDF) {
            jsPDF = window.jsPDF;
        } else {
            generateSimplePDF();
            return;
        }
        
        const doc = new jsPDF();
        const data = window.auditApp.roadmapData;
        
        // Configuration améliorée
        const margin = 25;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const contentWidth = pageWidth - (margin * 2);
        let yPosition = margin;
        
        const colors = {
            primary: [15, 23, 42],
            cyan: [6, 182, 212],
            green: [16, 185, 129],
            gray: [75, 85, 99],
            lightGray: [156, 163, 175],
            background: [248, 250, 252]
        };
        
        // Fonction améliorée pour le texte
        const addText = (text, x, y, options = {}) => {
            const fontSize = options.fontSize || 11;
            const fontStyle = options.fontStyle || 'normal';
            const color = options.color || colors.gray;
            const maxWidth = options.maxWidth || (contentWidth - (x - margin));
            const lineHeight = options.lineHeight || 1.4;
            
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', fontStyle);
            doc.setTextColor(...color);
            
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y);
            return y + (lines.length * fontSize * lineHeight * 0.35);
        };
        
        // Fonction pour les rectangles avec coins arrondis simulés
        const addBox = (x, y, width, height, fillColor, borderColor = null, opacity = 1) => {
            if (fillColor) {
                doc.setFillColor(...fillColor);
                doc.rect(x, y, width, height, 'F');
            }
            if (borderColor) {
                doc.setDrawColor(...borderColor);
                doc.setLineWidth(0.5);
                doc.rect(x, y, width, height, 'S');
            }
        };
        
        // ===== PAGE DE COUVERTURE REFAITE =====
        
        // Header principal avec dégradé simulé
        addBox(0, 0, pageWidth, 70, colors.primary);
        
        // Badge OpenAI repositionné
        addBox(pageWidth - 80, 15, 70, 25, [255, 255, 255], colors.cyan);
        doc.setFontSize(8);
        doc.setTextColor(...colors.cyan);
        doc.setFont('helvetica', 'bold');
        doc.text('POWERED BY', pageWidth - 75, 22);
        doc.text('OpenAI GPT-4', pageWidth - 75, 30);
        
        // Titre principal centré et mieux espacé
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('ROADMAP D\'AUTOMATISATION', pageWidth/2, 35, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Analyse personnalisée par Intelligence Artificielle', pageWidth/2, 50, { align: 'center' });
        
        yPosition = 90;
        
        // Carte entreprise repensée
        addBox(margin, yPosition, contentWidth, 45, colors.background, colors.cyan);
        
        doc.setFontSize(18);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text(data.company, margin + 15, yPosition + 20);
        
        const date = new Date(data.generatedAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
        doc.setFontSize(11);
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rapport généré le ${date}`, margin + 15, yPosition + 32);
        
        yPosition = 160;
        
        // Section synthèse repensée
        doc.setFontSize(16);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('SYNTHÈSE EXÉCUTIVE', margin, yPosition);
        
        yPosition += 20;
        
        // Stats recalculées
        const formData = window.auditApp.collectFormData();
        const employeeCount = window.auditApp.getEmployeeCount(formData.employees);
        const sectorMultiplier = window.auditApp.getSectorMultiplier(formData.sector);
        const savings = Math.round(employeeCount * 2.5 * sectorMultiplier);
        const roi = Math.round(savings * 38 * 12);
        const automationScore = Math.round(55 + Math.random() * 30);
        
        // Boxes statistiques refaites
        const boxWidth = (contentWidth - 20) / 3;
        const statData = [
            { label: 'Heures économisées par mois', value: `${savings}h`, color: colors.green },
            { label: 'Retour sur investissement annuel', value: `${roi.toLocaleString('fr-FR')}€`, color: colors.cyan },
            { label: 'Potentiel d\'automatisation', value: `${automationScore}%`, color: colors.primary }
        ];
        
        statData.forEach((stat, index) => {
            const x = margin + (index * (boxWidth + 10));
            
            // Background
            addBox(x, yPosition, boxWidth, 50, [255, 255, 255], stat.color);
            
            // Icône/Indicateur
            addBox(x + 5, yPosition + 5, 4, 40, stat.color);
            
            // Valeur
            doc.setFontSize(16);
            doc.setTextColor(...stat.color);
            doc.setFont('helvetica', 'bold');
            doc.text(stat.value, x + 15, yPosition + 20);
            
            // Label
            doc.setFontSize(9);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'normal');
            const labelLines = doc.splitTextToSize(stat.label, boxWidth - 20);
            doc.text(labelLines, x + 15, yPosition + 30);
        });
        
        // Section contact repensée
        yPosition = pageHeight - 90;
        
        addBox(margin, yPosition, contentWidth, 70, colors.background, colors.primary);
        
        doc.setFontSize(14);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('VOTRE EXPERT EN AUTOMATISATION', margin + 15, yPosition + 15);
        
        doc.setFontSize(12);
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'bold');
        doc.text('Antoine - Equilibre Tech', margin + 15, yPosition + 27);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Spécialiste en automatisation et transformation digitale des PME/ESN', margin + 15, yPosition + 37);
        
        doc.setFontSize(10);
        doc.setTextColor(...colors.cyan);
        doc.text('✉ contact@equilibretech.com', margin + 15, yPosition + 50);
        doc.text('💼 linkedin.com/in/equilibretech', margin + 100, yPosition + 50);
        
        doc.setFontSize(8);
        doc.setTextColor(...colors.gray);
        doc.text('Réponse sous 24h • Confidentialité garantie • Premier échange gratuit', margin + 15, yPosition + 62);
        
        // ===== PAGE CONTENU REFAITE =====
        doc.addPage();
        yPosition = margin;
        
        // Header de page amélioré
        addBox(0, 0, pageWidth, 40, colors.background);
        doc.setFontSize(18);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN D\'ACTION PERSONNALISÉ', margin, 25);
        
        yPosition = 60;
        
        // Parser et restructurer le contenu de manière plus robuste
        const content = data.roadmap.replace(/<[^>]*>/g, '\n').split('\n');
        const sections = [];
        let currentSection = null;
        
        content.forEach(line => {
            const cleanLine = line.trim();
            if (!cleanLine) return;
            
            // Détecter les titres de section (éviter duplication)
            if (cleanLine.match(/^\d+\.|^###|^\*\*.*\*\*$/)) {
                if (currentSection && currentSection.content.length > 0) {
                    sections.push(currentSection);
                }
                let title = cleanLine
                    .replace(/^\d+\.\s*/, '')
                    .replace(/^###\s*/, '')
                    .replace(/^\*\*|\*\*$/g, '')
                    .replace(/[^\w\s]/g, ' ')
                    .trim();
                
                currentSection = { title, content: [] };
            } else if (currentSection && (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*'))) {
                const item = cleanLine.replace(/^[•\-\*]\s*/, '').trim();
                if (item && !currentSection.content.includes(item)) {
                    currentSection.content.push(item);
                }
            }
        });
        
        if (currentSection && currentSection.content.length > 0) {
            sections.push(currentSection);
        }
        
        // Filtrer sections vides/dupliquées
        const uniqueSections = sections.filter((section, index, arr) => 
            section.content.length > 0 && 
            arr.findIndex(s => s.title === section.title) === index
        );
        
        // Affichage des sections amélioré avec icônes
        uniqueSections.forEach((section, index) => {
            // Vérification espace page
            if (yPosition > pageHeight - 100) {
                doc.addPage();
                yPosition = margin;
            }
            
            // Couleur et icône selon le type
            let sectionColor = colors.cyan;
            let sectionIcon = '●';
            const title = section.title.toLowerCase();
            
            if (title.includes('diagnostic') || title.includes('express')) {
                sectionColor = colors.primary;
                sectionIcon = '⚡';
            } else if (title.includes('quick') || title.includes('rapide')) {
                sectionColor = colors.green;
                sectionIcon = '🚀';
            } else if (title.includes('moyen') || title.includes('terme')) {
                sectionColor = colors.cyan;
                sectionIcon = '⚙';
            } else if (title.includes('long') || title.includes('vision')) {
                sectionColor = colors.primary;
                sectionIcon = '🎯';
            } else if (title.includes('roi') || title.includes('estimé')) {
                sectionColor = colors.green;
                sectionIcon = '💰';
            }
            
            // Background section avec bordure
            addBox(margin, yPosition, contentWidth, 30, [250, 252, 255], sectionColor);
            
            // Icône section
            doc.setFontSize(16);
            doc.setTextColor(...sectionColor);
            doc.setFont('helvetica', 'bold');
            doc.text(sectionIcon, margin + 10, yPosition + 20);
            
            // Titre de section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title.toUpperCase(), margin + 30, yPosition + 20);
            
            yPosition += 40;
            
            // Contenu de la section avec puces améliorées
            if (section.content && section.content.length > 0) {
                section.content.forEach((item, itemIndex) => {
                    if (yPosition > pageHeight - 60) {
                        doc.addPage();
                        yPosition = margin + 20;
                    }
                    
                    // Bullet point circulaire coloré
                    doc.setFillColor(...sectionColor);
                    doc.circle(margin + 12, yPosition - 2, 2, 'F');
                    
                    // Titre en gras suivi du contenu
                    const parts = item.split(':');
                    if (parts.length > 1) {
                        // Titre en gras
                        doc.setFontSize(11);
                        doc.setTextColor(...colors.primary);
                        doc.setFont('helvetica', 'bold');
                        doc.text(parts[0] + ':', margin + 20, yPosition);
                        
                        // Description
                        yPosition += 12;
                        doc.setFontSize(10);
                        doc.setTextColor(...colors.gray);
                        doc.setFont('helvetica', 'normal');
                        yPosition = addText(parts.slice(1).join(':').trim(), margin + 20, yPosition, {
                            maxWidth: contentWidth - 30,
                            lineHeight: 1.4
                        });
                    } else {
                        // Texte simple
                        doc.setFontSize(10);
                        doc.setTextColor(...colors.gray);
                        doc.setFont('helvetica', 'normal');
                        yPosition = addText(item, margin + 20, yPosition, {
                            maxWidth: contentWidth - 30,
                            lineHeight: 1.4
                        });
                    }
                    yPosition += 8;
                });
            }
            
            yPosition += 20;
        });
        
        // Pied de page pour toutes les pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Ligne de séparation
            doc.setDrawColor(...colors.lightGray);
            doc.setLineWidth(0.3);
            doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
            
            // Texte du pied
            doc.setFontSize(8);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'normal');
            doc.text('Audit Flash IA - Equilibre Tech', margin, pageHeight - 15);
            doc.text(`Page ${i}/${pageCount}`, pageWidth - margin - 20, pageHeight - 15);
            
            if (i > 1) {
                doc.setTextColor(...colors.cyan);
                doc.text('contact@equilibretech.com', pageWidth/2, pageHeight - 15, { align: 'center' });
            }
        }
        
        // Téléchargement
        const filename = `Roadmap-Automatisation-${data.company.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                event_category: 'engagement',
                event_label: 'roadmap_pdf_v2'
            });
        }
        
    } catch (error) {
        console.error('Erreur génération PDF:', error);
        generateSimplePDF();
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