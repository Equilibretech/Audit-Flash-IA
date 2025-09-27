// Template PDFMake professionnel pour Audit Flash IA
function createProfessionalTemplate(data, stats) {
    const { savings, roi, automationScore, formData } = stats;
    const date = new Date(data.generatedAt).toLocaleDateString('fr-FR');
    
    return {
        pageSize: 'A4',
        pageMargins: [40, 70, 40, 70],
        
        // === HEADER PROFESSIONNEL ===
        header: function(currentPage, pageCount) {
            if (currentPage === 1) return null; // Pas de header sur la page 1
            
            return {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'ROADMAP D\'AUTOMATISATION', style: 'headerTitle' },
                            { text: data.company, style: 'headerCompany' }
                        ]
                    },
                    {
                        width: 'auto',
                        table: {
                            body: [
                                [{ text: 'POWERED BY AI', style: 'badge' }]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            hLineColor: () => '#3b82f6',
                            vLineColor: () => '#3b82f6',
                            paddingLeft: () => 8,
                            paddingRight: () => 8,
                            paddingTop: () => 4,
                            paddingBottom: () => 4
                        }
                    }
                ],
                margin: [40, 20, 40, 20]
            };
        },
        
        // === FOOTER PROFESSIONNEL ===
        footer: function(currentPage, pageCount) {
            return {
                columns: [
                    { text: 'Audit Flash IA - Equilibre Tech', style: 'footer' },
                    { text: 'contact@equilibretech.com', style: 'footer', alignment: 'center' },
                    { text: `Page ${currentPage}/${pageCount}`, style: 'footer', alignment: 'right' }
                ],
                margin: [40, 10, 40, 20]
            };
        },
        
        // === CONTENU PRINCIPAL ===
        content: [
            // === PAGE 1: EXECUTIVE SUMMARY ===
            {
                stack: [
                    // Header couverture
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [{
                                    stack: [
                                        { text: 'ROADMAP', style: 'coverTitle' },
                                        { text: 'D\'AUTOMATISATION', style: 'coverSubtitle' },
                                        { text: 'Analyse personnalisée par Intelligence Artificielle', style: 'coverDescription' }
                                    ],
                                    fillColor: '#1e293b',
                                    color: 'white'
                                }]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 40]
                    },
                    
                    // Section entreprise
                    {
                        columns: [
                            {
                                width: '65%',
                                stack: [
                                    { text: data.company, style: 'companyName' },
                                    { text: `Secteur: ${getSectorName(formData.sector)}`, style: 'sectorText' },
                                    { text: `Taille: ${formData.employees} employés`, style: 'sizeText' },
                                    { text: `Rapport généré le ${date}`, style: 'dateText' }
                                ]
                            },
                            {
                                width: '35%',
                                stack: [
                                    {
                                        canvas: [
                                            {
                                                type: 'rect',
                                                x: 0, y: 0,
                                                w: 120, h: 80,
                                                r: 8,
                                                color: '#f1f5f9'
                                            },
                                            {
                                                type: 'rect',
                                                x: 0, y: 0,
                                                w: 120, h: 25,
                                                r: 8,
                                                color: '#3b82f6'
                                            }
                                        ]
                                    },
                                    {
                                        text: 'SYNTHÈSE',
                                        style: 'dashboardTitle',
                                        absolutePosition: { x: 350, y: 200 }
                                    }
                                ]
                            }
                        ],
                        margin: [0, 0, 0, 30]
                    },
                    
                    // Dashboard KPIs
                    {
                        columns: [
                            {
                                width: '33%',
                                table: {
                                    body: [
                                        [{ text: 'GAINS TEMPS', style: 'kpiLabel' }],
                                        [{ text: `${savings}h/mois`, style: 'kpiValue', color: '#10b981' }],
                                        [{ text: 'Heures économisées', style: 'kpiDesc' }]
                                    ]
                                },
                                layout: {
                                    fillColor: (rowIndex) => rowIndex === 1 ? '#ecfdf5' : '#f8fafc',
                                    hLineWidth: () => 0,
                                    vLineWidth: () => 0,
                                    paddingTop: () => 10,
                                    paddingBottom: () => 10
                                }
                            },
                            {
                                width: '33%',
                                table: {
                                    body: [
                                        [{ text: 'ROI ANNUEL', style: 'kpiLabel' }],
                                        [{ text: `${roi.toLocaleString('fr-FR')}€`, style: 'kpiValue', color: '#3b82f6' }],
                                        [{ text: 'Retour investissement', style: 'kpiDesc' }]
                                    ]
                                },
                                layout: {
                                    fillColor: (rowIndex) => rowIndex === 1 ? '#eff6ff' : '#f8fafc',
                                    hLineWidth: () => 0,
                                    vLineWidth: () => 0,
                                    paddingTop: () => 10,
                                    paddingBottom: () => 10
                                }
                            },
                            {
                                width: '33%',
                                table: {
                                    body: [
                                        [{ text: 'POTENTIEL', style: 'kpiLabel' }],
                                        [{ text: `${automationScore}%`, style: 'kpiValue', color: '#8b5cf6' }],
                                        [{ text: 'Automatisation', style: 'kpiDesc' }]
                                    ]
                                },
                                layout: {
                                    fillColor: (rowIndex) => rowIndex === 1 ? '#faf5ff' : '#f8fafc',
                                    hLineWidth: () => 0,
                                    vLineWidth: () => 0,
                                    paddingTop: () => 10,
                                    paddingBottom: () => 10
                                }
                            }
                        ],
                        columnGap: 15,
                        margin: [0, 0, 0, 40]
                    },
                    
                    // Section priorités
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [{
                                    stack: [
                                        { text: 'PRIORITÉ IMMÉDIATE IDENTIFIÉE', style: 'priorityTitle' },
                                        { text: getPriorityText(formData.sector), style: 'priorityText' }
                                    ],
                                    fillColor: '#fef3c7',
                                    color: '#92400e'
                                }]
                            ]
                        },
                        layout: {
                            hLineWidth: () => 0,
                            vLineWidth: () => 0,
                            paddingLeft: () => 20,
                            paddingRight: () => 20,
                            paddingTop: () => 15,
                            paddingBottom: () => 15
                        },
                        margin: [0, 0, 0, 40]
                    }
                ],
                pageBreak: 'after'
            },
            
            // === PAGE 2+: PLAN D'ACTION DÉTAILLÉ ===
            { text: 'PLAN D\'ACTION PERSONNALISÉ', style: 'pageTitle', margin: [0, 0, 0, 30] },
            
            // Sections de la roadmap
            ...generateRoadmapSections(data),
            
            // === SECTION CONTACT FINALE ===
            {
                table: {
                    widths: ['30%', '70%'],
                    body: [
                        [
                            {
                                stack: [
                                    {
                                        canvas: [
                                            {
                                                type: 'ellipse',
                                                x: 40, y: 40,
                                                r1: 35, r2: 35,
                                                color: '#3b82f6'
                                            }
                                        ]
                                    },
                                    {
                                        text: 'A',
                                        style: 'avatarLetter',
                                        absolutePosition: { x: 70, y: 320 }
                                    }
                                ]
                            },
                            {
                                stack: [
                                    { text: 'VOTRE EXPERT EN AUTOMATISATION', style: 'contactTitle' },
                                    { text: 'Antoine - Equilibre Tech', style: 'contactName' },
                                    { text: 'Spécialiste en transformation digitale', style: 'contactRole' },
                                    { text: 'Email: contact@equilibretech.com', style: 'contactInfo' },
                                    { text: 'LinkedIn: linkedin.com/in/equilibretech', style: 'contactInfo' },
                                    { text: 'Prêt à discuter de votre projet d\'automatisation', style: 'contactCta' }
                                ]
                            }
                        ]
                    ]
                },
                layout: {
                    fillColor: '#1e293b',
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingLeft: () => 20,
                    paddingRight: () => 20,
                    paddingTop: () => 20,
                    paddingBottom: () => 20
                },
                margin: [0, 40, 0, 0]
            }
        ],
        
        // === STYLES PROFESSIONNELS ===
        styles: {
            // Headers
            headerTitle: { fontSize: 14, bold: true, color: '#1e293b' },
            headerCompany: { fontSize: 10, color: '#64748b', italics: true },
            badge: { fontSize: 8, bold: true, color: '#3b82f6', alignment: 'center' },
            
            // Couverture
            coverTitle: { fontSize: 28, bold: true, margin: [0, 20, 0, 5], alignment: 'center' },
            coverSubtitle: { fontSize: 24, bold: true, margin: [0, 0, 0, 15], alignment: 'center' },
            coverDescription: { fontSize: 12, italics: true, margin: [0, 0, 0, 20], alignment: 'center' },
            
            // Entreprise
            companyName: { fontSize: 22, bold: true, color: '#1e293b', margin: [0, 0, 0, 8] },
            sectorText: { fontSize: 11, color: '#3b82f6', bold: true, margin: [0, 0, 0, 4] },
            sizeText: { fontSize: 10, color: '#64748b', margin: [0, 0, 0, 4] },
            dateText: { fontSize: 9, color: '#64748b', italics: true },
            
            // Dashboard
            dashboardTitle: { fontSize: 10, bold: true, color: 'white' },
            kpiLabel: { fontSize: 9, bold: true, color: '#374151', alignment: 'center' },
            kpiValue: { fontSize: 18, bold: true, alignment: 'center' },
            kpiDesc: { fontSize: 8, color: '#6b7280', alignment: 'center' },
            
            // Priorité
            priorityTitle: { fontSize: 12, bold: true, margin: [0, 0, 0, 8] },
            priorityText: { fontSize: 10, lineHeight: 1.4 },
            
            // Sections
            pageTitle: { fontSize: 20, bold: true, color: '#1e293b', alignment: 'center' },
            sectionTitle: { fontSize: 14, bold: true, color: 'white', margin: [0, 0, 0, 0] },
            sectionNumber: { fontSize: 10, bold: true, color: 'white' },
            itemTitle: { fontSize: 11, bold: true, margin: [0, 0, 0, 4] },
            itemDescription: { fontSize: 10, color: '#374151', lineHeight: 1.3 },
            
            // Contact
            avatarLetter: { fontSize: 20, bold: true, color: 'white' },
            contactTitle: { fontSize: 12, bold: true, color: '#f1f5f9', margin: [0, 0, 0, 8] },
            contactName: { fontSize: 14, bold: true, color: '#3b82f6', margin: [0, 0, 0, 4] },
            contactRole: { fontSize: 10, color: '#d1d5db', margin: [0, 0, 0, 8] },
            contactInfo: { fontSize: 9, color: '#e5e7eb', margin: [0, 0, 0, 3] },
            contactCta: { fontSize: 10, color: '#60a5fa', italics: true, margin: [0, 8, 0, 0] },
            
            // Footer
            footer: { fontSize: 8, color: '#64748b' }
        }
    };
}

// === FONCTIONS UTILITAIRES ===
function generateRoadmapSections(data) {
    if (!data.isJSON || !data.roadmap.sections) {
        return [{ text: 'Données non disponibles', style: 'itemDescription' }];
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
    return sectorNames[sector] || 'Autre secteur';
}

function getPriorityText(sector) {
    const priorities = {
        'esn': 'Automatiser la gestion des tickets clients et le reporting projet pour réduire les temps de réponse et améliorer la satisfaction client.',
        'finance': 'Centraliser les processus de validation et le reporting financier pour assurer la conformité et réduire les erreurs.',
        'service': 'Optimiser la gestion client et les workflows d\'approbation pour améliorer l\'efficacité opérationnelle.',
        'commerce': 'Automatiser la gestion des commandes et le suivi logistique pour réduire les délais de livraison.',
        'industrie': 'Digitaliser les processus de production et de maintenance pour optimiser la chaîne de valeur.',
        'sante': 'Simplifier la gestion des dossiers patients et des plannings pour améliorer la qualité des soins.',
        'education': 'Automatiser les inscriptions et le suivi pédagogique pour libérer du temps pour l\'enseignement.'
    };
    return priorities[sector] || 'Centraliser les communications et automatiser les tâches répétitives pour améliorer la productivité globale.';
}