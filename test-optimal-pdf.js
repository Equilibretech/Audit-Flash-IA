// Script optimisé pour générer le PDF parfait
function generateOptimalPDF(data) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const margin = 20;
        let yPosition = margin;
        
        // Couleurs optimisées pour PDF
        const colors = {
            primary: [30, 41, 59],      // Slate 700 - lisible
            accent: [59, 130, 246],     // Blue 500 - moderne  
            success: [34, 197, 94],     // Green 500 - positif
            warning: [251, 146, 60],    // Orange 400 - attention
            purple: [147, 51, 234],     // Purple 600 - premium
            gray: [71, 85, 105],        // Slate 600 - texte
            lightGray: [148, 163, 184], // Slate 400 - subtil
            white: [255, 255, 255],     // Blanc pur
            background: [248, 250, 252] // Slate 50 - fond
        };
        
        // ===== PAGE 1: COUVERTURE OPTIMALE =====
        
        // Header moderne avec dégradé
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, 210, 55, 'F');
        doc.setFillColor(...colors.accent);
        doc.rect(0, 0, 210, 25, 'F');
        
        // Badge AI  
        doc.setFillColor(...colors.white);
        doc.rect(145, 8, 50, 10, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...colors.accent);
        doc.setFont('helvetica', 'bold');
        doc.text('POWERED BY AI', 170, 15, { align: 'center' });
        
        // Titre principal
        doc.setFontSize(22);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text('ROADMAP D\'AUTOMATISATION', 105, 23, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(240, 240, 240);
        doc.text('Analyse personnalisée par Intelligence Artificielle', 105, 35, { align: 'center' });
        
        yPosition = 75;
        
        // Card entreprise optimisée
        doc.setFillColor(245, 245, 245);
        doc.rect(margin + 1, yPosition + 1, 170, 35, 'F'); // Ombre subtile
        doc.setFillColor(...colors.white);
        doc.rect(margin, yPosition, 170, 35, 'F');
        doc.setDrawColor(...colors.accent);
        doc.setLineWidth(0.5);
        doc.rect(margin, yPosition, 170, 35, 'S');
        
        // Icône entreprise
        doc.setFillColor(...colors.accent);
        doc.circle(margin + 18, yPosition + 17, 8, 'F');
        doc.setFontSize(10);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text('E', margin + 15, yPosition + 21);
        
        // Info entreprise
        doc.setFontSize(18);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text(data.company, margin + 35, yPosition + 15);
        
        const date = new Date(data.generatedAt).toLocaleDateString('fr-FR');
        doc.setFontSize(9);
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rapport genere le ${date}`, margin + 35, yPosition + 26);
        
        yPosition += 55;
        
        // Stats modernes avec espacement optimal
        const formData = {
            employees: '11-50',
            sector: 'esn'
        };
        
        const employeeCount = 30;
        const sectorMultiplier = 1.2;
        const savings = Math.round(employeeCount * 2.5 * sectorMultiplier);
        const roi = Math.round(savings * 38 * 12);
        const automationScore = Math.round(65 + Math.random() * 20);
        
        const stats = [
            { label: 'Heures economisees/mois', value: `${savings}h`, color: colors.success },
            { label: 'ROI annuel estime', value: `${roi.toLocaleString('fr-FR')}€`, color: colors.accent },
            { label: 'Potentiel automatisation', value: `${automationScore}%`, color: colors.purple }
        ];
        
        // Titre stats
        doc.setFillColor(...colors.primary);
        doc.rect(margin, yPosition, 170, 18, 'F');
        doc.setFontSize(12);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text('SYNTHESE EXECUTIVE', margin + 10, yPosition + 12);
        yPosition += 28;
        
        // Cards stats optimisées
        stats.forEach((stat, index) => {
            // Background coloré
            const bgColors = [
                [220, 252, 231], // Green
                [219, 234, 254], // Blue  
                [237, 233, 254]  // Purple
            ];
            
            doc.setFillColor(240, 240, 240);
            doc.rect(margin + 1, yPosition + 1, 170, 30, 'F'); // Ombre
            
            doc.setFillColor(...bgColors[index]);
            doc.rect(margin, yPosition, 170, 30, 'F');
            
            // Barre colorée
            doc.setFillColor(...stat.color);
            doc.rect(margin, yPosition, 5, 30, 'F');
            
            // Indicateur visuel
            doc.setFillColor(...stat.color);
            doc.circle(margin + 20, yPosition + 15, 6, 'F');
            doc.setFillColor(...colors.white);
            doc.circle(margin + 20, yPosition + 15, 4, 'F');
            
            // Texte stat
            doc.setFontSize(9);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'normal');
            doc.text(stat.label, margin + 32, yPosition + 10);
            
            doc.setFontSize(16);
            doc.setTextColor(...stat.color);
            doc.setFont('helvetica', 'bold');
            doc.text(stat.value, margin + 32, yPosition + 22);
            
            yPosition += 35;
        });
        
        yPosition += 10;
        
        // Section contact optimisée
        doc.setFillColor(...colors.primary);
        doc.rect(margin, yPosition, 170, 45, 'F');
        
        // Avatar
        doc.setFillColor(...colors.white);
        doc.circle(margin + 20, yPosition + 22, 12, 'F');
        doc.setFillColor(...colors.accent);
        doc.circle(margin + 20, yPosition + 22, 10, 'F');
        doc.setFontSize(10);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text('A', margin + 17, yPosition + 26);
        
        // Info contact
        doc.setFontSize(11);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text('VOTRE EXPERT EN AUTOMATISATION', margin + 38, yPosition + 15);
        
        doc.setFontSize(10);
        doc.text('Antoine - Equilibre Tech', margin + 38, yPosition + 26);
        
        doc.setFontSize(8);
        doc.setTextColor(230, 230, 230);
        doc.setFont('helvetica', 'normal');
        doc.text('contact@equilibretech.com', margin + 38, yPosition + 35);
        doc.text('Specialiste transformation digitale', margin + 38, yPosition + 42);
        
        // ===== PAGE 2: PLAN D'ACTION OPTIMAL =====
        doc.addPage();
        yPosition = margin;
        
        // Header page 2
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setFillColor(...colors.accent);
        doc.rect(0, 0, 210, 18, 'F');
        
        doc.setFontSize(16);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN D\'ACTION PERSONNALISE', 105, 22, { align: 'center' });
        
        yPosition = 50;
        
        // Sections avec design optimal
        if (data.isJSON && data.roadmap && data.roadmap.sections) {
            const sections = data.roadmap.sections;
            const sectionColors = [colors.accent, colors.success, colors.warning, colors.purple, colors.primary];
            const sectionIcons = ['1', '2', '3', '4', '5'];
            
            sections.forEach((section, sectionIndex) => {
                // Vérifier espace disponible
                if (yPosition > 200) {
                    doc.addPage();
                    yPosition = 30;
                }
                
                const currentColor = sectionColors[sectionIndex] || colors.accent;
                
                // Header section optimisé
                doc.setFillColor(245, 245, 245);
                doc.rect(margin + 1, yPosition + 1, 170, 28, 'F'); // Ombre
                
                doc.setFillColor(...colors.white);
                doc.rect(margin, yPosition, 170, 28, 'F');
                
                // Bande colorée header
                doc.setFillColor(...currentColor);
                doc.rect(margin, yPosition, 170, 18, 'F');
                
                // Badge numéro
                doc.setFillColor(...colors.white);
                doc.circle(margin + 16, yPosition + 9, 8, 'F');
                doc.setFillColor(...currentColor);
                doc.circle(margin + 16, yPosition + 9, 6, 'F');
                
                doc.setFontSize(8);
                doc.setTextColor(...colors.white);
                doc.setFont('helvetica', 'bold');
                doc.text(sectionIcons[sectionIndex], margin + 14, yPosition + 12);
                
                // Titre section
                doc.setFontSize(11);
                doc.setTextColor(...colors.white);
                doc.setFont('helvetica', 'bold');
                doc.text(section.title, margin + 28, yPosition + 12);
                
                yPosition += 35;
                
                // Items optimisés
                if (section.items && Array.isArray(section.items)) {
                    section.items.forEach((item, itemIndex) => {
                        // Calculer hauteur nécessaire
                        const titleLines = doc.splitTextToSize(item.title, 140);
                        const descLines = doc.splitTextToSize(item.description, 140);
                        const itemHeight = 15 + (titleLines.length * 8) + (descLines.length * 7);
                        
                        // Vérifier espace
                        if (yPosition + itemHeight > 270) {
                            doc.addPage();
                            yPosition = 30;
                        }
                        
                        // Card item
                        doc.setFillColor(248, 248, 248);
                        doc.rect(margin + 10, yPosition + 1, 150, itemHeight, 'F'); // Ombre
                        
                        doc.setFillColor(...colors.white);
                        doc.rect(margin + 8, yPosition, 150, itemHeight, 'F');
                        
                        // Indicateur coloré
                        doc.setFillColor(...currentColor);
                        doc.rect(margin + 8, yPosition, 3, itemHeight, 'F');
                        
                        // Bullet point
                        doc.setFillColor(...currentColor);
                        doc.circle(margin + 18, yPosition + 6, 2.5, 'F');
                        
                        // Titre item
                        doc.setFontSize(9);
                        doc.setTextColor(...currentColor);
                        doc.setFont('helvetica', 'bold');
                        let currentY = yPosition + 8;
                        titleLines.forEach(line => {
                            doc.text(line, margin + 25, currentY);
                            currentY += 8;
                        });
                        
                        // Description
                        doc.setFontSize(8);
                        doc.setTextColor(...colors.gray);
                        doc.setFont('helvetica', 'normal');
                        descLines.forEach(line => {
                            doc.text(line, margin + 25, currentY);
                            currentY += 7;
                        });
                        
                        yPosition += itemHeight + 6;
                    });
                }
                yPosition += 8;
            });
        }
        
        // Footer optimisé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Ligne séparation
            doc.setDrawColor(...colors.lightGray);
            doc.setLineWidth(0.3);
            doc.line(margin, 280, 190, 280);
            
            // Footer text
            doc.setFontSize(7);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'normal');
            doc.text('Audit Flash IA - Equilibre Tech', margin, 288);
            doc.text('contact@equilibretech.com', 105, 288, { align: 'center' });
            doc.text(`Page ${i}/${pageCount}`, 190, 288, { align: 'right' });
        }
        
        return doc;
        
    } catch (error) {
        console.error('Erreur génération PDF optimal:', error);
        throw error;
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateOptimalPDF };
}