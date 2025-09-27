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
    if (!window.auditApp.roadmapData) {
        alert('Veuillez d\'abord générer votre roadmap avant de la télécharger.');
        return;
    }

    // Utilise jsPDF pour générer le PDF
    if (typeof window.jsPDF === 'undefined') {
        // Charger jsPDF dynamiquement
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => generatePDF();
        document.head.appendChild(script);
    } else {
        generatePDF();
    }
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = window.auditApp.roadmapData;
    
    // Configuration et couleurs
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    
    const colors = {
        primary: [15, 23, 42],      // Bleu nuit
        cyan: [6, 182, 212],        // Cyan
        green: [16, 185, 129],      // Vert accent
        gray: [100, 116, 139],      // Gris
        lightGray: [148, 163, 184], // Gris clair
        white: [255, 255, 255]
    };
    
    // Fonction helper pour ajouter du texte avec retour à la ligne
    const addText = (text, x, y, options = {}) => {
        const fontSize = options.fontSize || 12;
        const fontStyle = options.fontStyle || 'normal';
        const color = options.color || [0, 0, 0];
        const maxWidth = options.maxWidth || (contentWidth - x + margin);
        
        doc.setFontSize(fontSize);
        doc.setFont(undefined, fontStyle);
        doc.setTextColor(...color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.6);
    };
    
    // Fonction pour ajouter un rectangle coloré
    const addColorBlock = (x, y, width, height, color, opacity = 1) => {
        doc.setFillColor(...color);
        doc.setGlobalAlpha(opacity);
        doc.rect(x, y, width, height, 'F');
        doc.setGlobalAlpha(1);
    };
    
    // ===== PAGE DE COUVERTURE =====
    
    // Background header coloré
    addColorBlock(0, 0, pageWidth, 80, colors.primary);
    
    // Logo/Badge
    addColorBlock(margin, 25, 60, 20, colors.cyan, 0.2);
    doc.setFontSize(10);
    doc.setTextColor(...colors.cyan);
    doc.setFont(undefined, 'bold');
    doc.text('POWERED BY', margin + 5, 32);
    doc.text('OpenAI GPT-4', margin + 5, 38);
    
    // Titre principal
    doc.setFontSize(28);
    doc.setTextColor(...colors.white);
    doc.setFont(undefined, 'bold');
    doc.text('ROADMAP', pageWidth/2, 35, { align: 'center' });
    doc.text('D\'AUTOMATISATION', pageWidth/2, 50, { align: 'center' });
    
    yPosition = 100;
    
    // Carte entreprise
    addColorBlock(margin, yPosition, contentWidth, 50, colors.lightGray, 0.1);
    doc.setDrawColor(...colors.cyan);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPosition, contentWidth, 50);
    
    yPosition += 15;
    doc.setFontSize(16);
    doc.setTextColor(...colors.primary);
    doc.setFont(undefined, 'bold');
    doc.text(`${data.company}`, margin + 10, yPosition);
    
    yPosition += 10;
    const date = new Date(data.generatedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.setFontSize(12);
    doc.setTextColor(...colors.gray);
    doc.setFont(undefined, 'normal');
    doc.text(`Analyse générée le ${date}`, margin + 10, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(...colors.lightGray);
    doc.text('Rapport confidentiel - Usage interne uniquement', margin + 10, yPosition);
    
    yPosition = 180;
    
    // Section statistiques
    doc.setFontSize(18);
    doc.setTextColor(...colors.primary);
    doc.setFont(undefined, 'bold');
    doc.text('🎯 SYNTHÈSE EXÉCUTIVE', margin, yPosition);
    
    yPosition += 25;
    
    // Récupérer les stats actuelles de la page
    const formData = window.auditApp.collectFormData();
    const employeeCount = window.auditApp.getEmployeeCount(formData.employees);
    const sectorMultiplier = window.auditApp.getSectorMultiplier(formData.sector);
    const savings = Math.round(employeeCount * 2 * sectorMultiplier);
    const roi = Math.round(savings * 35 * 12 * (0.8 + Math.random() * 0.4));
    const automationScore = Math.round(45 + Math.random() * 40);
    
    // Boxes de statistiques
    const statBoxWidth = (contentWidth - 20) / 3;
    const statBoxes = [
        { label: 'Heures économisées', value: `${savings}h/mois`, color: colors.green },
        { label: 'ROI estimé', value: `${roi.toLocaleString()}€/an`, color: colors.cyan },
        { label: 'Potentiel d\'automatisation', value: `${automationScore}%`, color: colors.primary }
    ];
    
    statBoxes.forEach((stat, index) => {
        const x = margin + (index * (statBoxWidth + 10));
        
        // Box colorée
        addColorBlock(x, yPosition, statBoxWidth, 35, stat.color, 0.1);
        doc.setDrawColor(...stat.color);
        doc.setLineWidth(1);
        doc.rect(x, yPosition, statBoxWidth, 35);
        
        // Valeur
        doc.setFontSize(16);
        doc.setTextColor(...stat.color);
        doc.setFont(undefined, 'bold');
        doc.text(stat.value, x + statBoxWidth/2, yPosition + 15, { align: 'center' });
        
        // Label
        doc.setFontSize(9);
        doc.setTextColor(...colors.gray);
        doc.setFont(undefined, 'normal');
        doc.text(stat.label, x + statBoxWidth/2, yPosition + 25, { align: 'center' });
    });
    
    // Section expert contact
    yPosition = pageHeight - 120;
    
    // Box contact expert
    addColorBlock(margin, yPosition, contentWidth, 80, colors.primary, 0.05);
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPosition, contentWidth, 80);
    
    yPosition += 15;
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont(undefined, 'bold');
    doc.text('👨‍💼 VOTRE EXPERT EN AUTOMATISATION', margin + 10, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(...colors.gray);
    doc.setFont(undefined, 'bold');
    doc.text('Antoine - Equilibre Tech', margin + 10, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Expert en automatisation d\'entreprise et transformation digitale', margin + 10, yPosition);
    
    yPosition += 12;
    doc.setTextColor(...colors.cyan);
    doc.text('📧 contact@equilibretech.com', margin + 10, yPosition);
    
    yPosition += 8;
    doc.text('💼 linkedin.com/in/equilibretech', margin + 10, yPosition);
    
    yPosition += 8;
    doc.text('🌐 equilibretech.com', margin + 10, yPosition);
    
    yPosition += 12;
    doc.setFontSize(9);
    doc.setTextColor(...colors.gray);
    doc.text('Réponse garantie sous 24h • Confidentialité assurée • Premier échange gratuit', margin + 10, yPosition);
    
    // ===== NOUVELLES PAGES POUR LE CONTENU =====
    doc.addPage();
    yPosition = margin;
    
    // Parser le contenu de la roadmap
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.roadmap;
    
    const sections = [];
    let currentSection = null;
    
    Array.from(tempDiv.children).forEach(element => {
        if (element.tagName === 'H3') {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                title: element.textContent,
                content: []
            };
        } else if (currentSection) {
            if (element.tagName === 'UL') {
                const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent);
                currentSection.content.push(...items);
            } else if (element.tagName === 'P') {
                currentSection.content.push(element.textContent);
            }
        }
    });
    
    if (currentSection) {
        sections.push(currentSection);
    }
    
    // Header de page
    doc.setFontSize(20);
    doc.setTextColor(...colors.primary);
    doc.setFont(undefined, 'bold');
    doc.text('📋 PLAN D\'ACTION DÉTAILLÉ', margin, yPosition);
    
    yPosition += 15;
    doc.setDrawColor(...colors.lightGray);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 20;
    
    // Ajouter les sections avec un design amélioré
    sections.forEach((section, index) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = margin;
        }
        
        // Couleur de section basée sur le type
        let sectionColor = colors.cyan;
        if (section.title.toLowerCase().includes('quick') || section.title.toLowerCase().includes('rapide')) {
            sectionColor = colors.green;
        } else if (section.title.toLowerCase().includes('long') || section.title.toLowerCase().includes('vision')) {
            sectionColor = colors.primary;
        }
        
        // Barre latérale colorée
        addColorBlock(margin, yPosition - 5, 3, 20, sectionColor);
        
        // Titre de section avec background
        addColorBlock(margin + 5, yPosition - 5, contentWidth - 5, 20, sectionColor, 0.1);
        
        doc.setFontSize(14);
        doc.setTextColor(...sectionColor);
        doc.setFont(undefined, 'bold');
        doc.text(section.title, margin + 10, yPosition + 5);
        
        yPosition += 25;
        
        // Contenu de la section
        section.content.forEach(item => {
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = margin;
            }
            
            // Bullet point coloré
            doc.setFillColor(...sectionColor);
            doc.circle(margin + 7, yPosition - 2, 1.5, 'F');
            
            yPosition = addText(item, margin + 15, yPosition, {
                fontSize: 11,
                color: colors.primary,
                maxWidth: contentWidth - 20
            });
            yPosition += 3;
        });
        
        yPosition += 15;
    });
    
    // Pied de page amélioré pour toutes les pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Ligne de séparation
        doc.setDrawColor(...colors.lightGray);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        
        // Texte du pied
        doc.setFontSize(8);
        doc.setTextColor(...colors.gray);
        doc.setFont(undefined, 'normal');
        doc.text('Généré par Audit Flash IA - Equilibre Tech', margin, pageHeight - 12);
        doc.text(`${i}/${pageCount}`, pageWidth - margin - 10, pageHeight - 12);
        
        if (i > 1) {
            doc.setTextColor(...colors.cyan);
            doc.text('contact@equilibretech.com', pageWidth/2, pageHeight - 12, { align: 'center' });
        }
    }
    
    // Télécharger le PDF
    const filename = `roadmap-automatisation-${data.company.replace(/\s+/g, '-').toLowerCase()}-${date.replace(/\s/g, '-').replace(/,/g, '')}.pdf`;
    doc.save(filename);
    
    // Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'download', {
            event_category: 'engagement',
            event_label: 'roadmap_pdf'
        });
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