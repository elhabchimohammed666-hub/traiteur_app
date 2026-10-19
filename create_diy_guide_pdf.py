# -*- coding: utf-8 -*-
"""
Générateur du Guide d'Atelier Pratique : Refaire le projet Elhabchi Traiteur de A à Z.
Ce guide pédagogique au format PDF permet à un développeur ou étudiant
de recréer l'intégralité du projet MERN pas-à-pas à partir d'un dossier vide.
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Palette de couleurs Elhabchi Traiteur
COLOR_ZELLIGE = colors.HexColor('#0F5C4D')      # Vert Zellige impérial
COLOR_ZELLIGE_DARK = colors.HexColor('#0A3E34') # Vert sombre profond
COLOR_SAFRAN = colors.HexColor('#B8923A')       # Or Safran noble
COLOR_SAFRAN_LIGHT = colors.HexColor('#D4B265') # Or doux
COLOR_CREME = colors.HexColor('#FBF5E6')        # Crème soie
COLOR_SABLE = colors.HexColor('#F4EEDF')        # Fond sable doux
COLOR_ANTHRACITE = colors.HexColor('#1E2522')   # Gris anthracite texte
COLOR_MUTED = colors.HexColor('#5A6662')        # Texte secondaire
COLOR_BORDER = colors.HexColor('#D8C8A8')       # Bordure dorée douce
COLOR_SUCCESS = colors.HexColor('#15803D')      # Vert validation
COLOR_ALERT = colors.HexColor('#B91C1C')        # Rouge alerte
COLOR_CODE_BG = colors.HexColor('#1E2421')     # Fond éditeur de code
COLOR_CODE_FG = colors.HexColor('#E2E8F0')     # Texte éditeur de code

class NumberedCanvas(canvas.Canvas):
    """Canvas avec numérotation automatique dynamique 'Page X sur Y' et en-tête"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        if self._pageNumber == 1:
            return

        self.saveState()
        page_width, page_height = A4

        # En-tête
        self.setStrokeColor(COLOR_SAFRAN)
        self.setLineWidth(0.8)
        self.line(40, page_height - 38, page_width - 40, page_height - 38)

        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(COLOR_ZELLIGE)
        self.drawString(40, page_height - 32, "ELHABCHI TRAITEUR")
        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_MUTED)
        self.drawString(135, page_height - 32, "—  Atelier Pratique : Recréer le Projet de Zéro (Full-Stack MERN)")

        # Pied de page
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(40, 38, page_width - 40, 38)

        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_MUTED)
        self.drawString(40, 27, "Guide d'apprentissage pas à pas · Pratique & Code source autonome")
        page_str = f"Page {self._pageNumber} sur {total_pages}"
        self.drawRightString(page_width - 40, 27, page_str)

        self.restoreState()


def build_diy_guide_pdf(filename="Guide_Pratique_Refaire_Le_Projet_A_Zero.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=38,
        rightMargin=38,
        topMargin=48,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Styles typographiques personnalisés
    title_style = ParagraphStyle(
        'CoverTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=22, leading=27,
        textColor=COLOR_ZELLIGE, alignment=1, spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=12, leading=16,
        textColor=COLOR_SAFRAN, alignment=1, spaceAfter=18
    )

    h1_style = ParagraphStyle(
        'ChapterH1', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=14, leading=18,
        textColor=COLOR_ZELLIGE, spaceBefore=10, spaceAfter=6, keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14,
        textColor=COLOR_SAFRAN, spaceBefore=8, spaceAfter=4, keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=COLOR_ANTHRACITE, spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'BulletCustom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8, leading=11.5,
        textColor=COLOR_ANTHRACITE, leftIndent=12, spaceAfter=2.5
    )

    code_style = ParagraphStyle(
        'CodeSnippet', parent=styles['Normal'],
        fontName='Courier', fontSize=7.5, leading=10,
        textColor=COLOR_CODE_FG
    )

    table_header_style = ParagraphStyle(
        'TableHeader', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8, leading=10,
        textColor=colors.white, alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontName='Helvetica', fontSize=7.5, leading=10,
        textColor=COLOR_ANTHRACITE
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=7.5, leading=10,
        textColor=COLOR_ZELLIGE
    )

    def create_callout(title, text, bg_color=COLOR_SABLE, border_color=COLOR_BORDER, icon="💡"):
        p_title = Paragraph(f"<b>{icon} {title}</b>", ParagraphStyle('CTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=COLOR_ZELLIGE))
        p_body = Paragraph(text, ParagraphStyle('CBody', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=COLOR_ANTHRACITE))
        t = Table([[p_title], [p_body]], colWidths=[515])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    def create_code_block(code_text):
        p_code = Paragraph(code_text.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)
        t = Table([[p_code]], colWidths=[515])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), COLOR_CODE_BG),
            ('BOX', (0,0), (-1,-1), 1, COLOR_ZELLIGE_DARK),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return t

    story = []

    # =========================================================================
    # PAGE 1 : PAGE DE GARDE PRESTIGE & ATELIER PRATIQUE
    # =========================================================================
    story.append(Spacer(1, 25))

    banner_data = [
        [Paragraph("<font color='#B8923A'><b>ATELIER DE DÉVELOPPEMENT PRATIQUE · FULL-STACK MERN</b></font>", ParagraphStyle('Ban1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, alignment=1))],
        [Paragraph("<b>RECRÉER LE PROJET DE ZÉRO</b>", title_style)],
        [Paragraph("Le Guide étape par étape pour coder l'application Elhabchi Traiteur en toute autonomie", subtitle_style)]
    ]
    t_banner = Table(banner_data, colWidths=[515])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_CREME),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_SAFRAN),
        ('TOPPADDING', (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 18))

    story.append(Paragraph("<b>À qui s'adresse ce guide ?</b>", h2_style))
    story.append(Paragraph(
        "Ce manuel a été conçu spécialement pour vous si vous désirez <b>recommencer le projet de zéro dans un nouveau dossier</b> "
        "afin de vous entraîner, comprendre les mécanismes internes d'une application professionnelle et consolider vos compétences "
        "en développement web moderne. Chaque commande, chaque fichier et chaque concept métier y sont expliqués avec une méthode simple et accessible.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # Objectifs d'apprentissage
    obj_data = [
        [Paragraph("<b>Objectifs Pratiques Clés de l'Atelier</b>", table_header_style)],
        [Paragraph("• <b>Architecture Monorepo Propre :</b> Organiser et relier proprement un Backend Express et un Frontend React 18.<br/>"
                   "• <b>Base de Données MongoDB & Mongoose :</b> Modéliser des collections réelles (Réservations, Menus, Stocks, Rôles).<br/>"
                   "• <b>Algorithme Métier & Règle des 7 Jours :</b> Coder le calcul automatique des tarifs en Dirhams (MAD) et les contraintes de délai.<br/>"
                   "• <b>Génération Automatique WhatsApp :</b> Créer le pont direct entre l'estimation Web et la messagerie instantanée.<br/>"
                   "• <b>Back-Office Complet & Sécurisé :</b> Implémenter l'authentification JWT avec contrôle d'accès basé sur les rôles (Admin/Staff).<br/>"
                   "• <b>Design Prestige & Multilingue :</b> Maîtriser Tailwind CSS, la gestion du mode RTL (Arabe) et le thème sombre/clair.", body_style)]
    ]
    t_obj = Table(obj_data, colWidths=[515])
    t_obj.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), COLOR_ZELLIGE),
        ('BACKGROUND', (0,1), (0,1), COLOR_SABLE),
        ('BOX', (0,0), (-1,-1), 1, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_obj)
    story.append(Spacer(1, 15))

    meta_table = Table([
        [Paragraph("<b>Durée estimée de l'atelier :</b> 4 à 6 heures pas-à-pas", table_cell_style),
         Paragraph("<b>Niveau requis :</b> Débutant curieux à Intermédiaire", table_cell_style)],
        [Paragraph("<b>Stack technique :</b> MongoDB, Express, React 18, Node.js", table_cell_style),
         Paragraph("<b>Système compatible :</b> Windows, macOS, Linux", table_cell_style)]
    ], colWidths=[255, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_CREME),
        ('BOX', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2 : SOMMAIRE & FEUILLE DE ROUTE PÉDAGOGIQUE
    # =========================================================================
    story.append(Paragraph("Feuille de Route & Sommaire Pédagogique", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=10))

    story.append(Paragraph(
        "Pour réussir la reconstruction du projet sans encombre, nous découpons le travail en <b>8 étapes chronologiques simples</b>. "
        "Suivez chaque phase méthodiquement : ne passez à l'étape suivante qu'après avoir testé et validé l'étape en cours.",
        body_style
    ))
    story.append(Spacer(1, 6))

    plan_data = [
        [Paragraph("<b>Phase</b>", table_header_style), Paragraph("<b>Titre de l'étape & Contenu pratique</b>", table_header_style), Paragraph("<b>Temps conseillé</b>", table_header_style)],
        [Paragraph("<b>Phase 1</b>", table_cell_bold), Paragraph("<b>Préparation & Initialisation du Projet :</b> Outils indispensables, création de l'arborescence, configuration des fichiers package.json et création du script dev.js.", table_cell_style), Paragraph("25 min", table_cell_style)],
        [Paragraph("<b>Phase 2</b>", table_cell_bold), Paragraph("<b>Backend Partie 1 (Serveur & Données) :</b> Initialisation Express, connexion MongoDB Mongoose, création des schémas (User, Booking, Menu, Equipment).", table_cell_style), Paragraph("45 min", table_cell_style)],
        [Paragraph("<b>Phase 3</b>", table_cell_bold), Paragraph("<b>Backend Partie 2 (Logique Métier & Sécurité) :</b> Règle des 7 jours, calcul du devis, contrôleurs CRUD, authentification JWT, rôles et script de seed.", table_cell_style), Paragraph("45 min", table_cell_style)],
        [Paragraph("<b>Phase 4</b>", table_cell_bold), Paragraph("<b>Frontend Partie 1 (Setup & Design Prestige) :</b> Création du projet Vite, configuration de Tailwind CSS, charte graphique luxe, AppContext (FR/AR/EN, RTL, Dark/Light).", table_cell_style), Paragraph("40 min", table_cell_style)],
        [Paragraph("<b>Phase 5</b>", table_cell_bold), Paragraph("<b>Frontend Partie 2 (Le Simulateur 6 Étapes) :</b> Construction pas à pas de l'assistant de devis dynamique, calcul en direct et lien automatique WhatsApp.", table_cell_style), Paragraph("60 min", table_cell_style)],
        [Paragraph("<b>Phase 6</b>", table_cell_bold), Paragraph("<b>Frontend Partie 3 (Suivi Client & Back-Office) :</b> Recherche de commande sans compte (`ELH-AAAA-NNNNN`), Dashboard d'administration, stocks et calendrier.", table_cell_style), Paragraph("50 min", table_cell_style)],
        [Paragraph("<b>Phase 7</b>", table_cell_bold), Paragraph("<b>Orchestration & Déploiement :</b> Lancement simultané sans conflit de ports, tests d'intégration complets et préparation au build de production.", table_cell_style), Paragraph("20 min", table_cell_style)],
        [Paragraph("<b>Phase 8</b>", table_cell_bold), Paragraph("<b>Exercices Pratiques & Défis Développeur :</b> 5 défis stimulants pour aller plus loin et tester votre maîtrise du code.", table_cell_style), Paragraph("Libre", table_cell_style)],
    ]
    t_plan = Table(plan_data, colWidths=[55, 395, 65])
    t_plan.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_plan)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Les 4 Règles d'Or pour Réussir votre Pratique", h2_style))
    rules_text = (
        "1. <b>Tapez le code au clavier au lieu de copier-coller aveuglément :</b> C'est la mémoire musculaire qui forme les grands développeurs.<br/>"
        "2. <b>Observez vos consoles (Terminal et F12 du navigateur) :</b> 95% des erreurs donnent un message précis avec la ligne exacte.<br/>"
        "3. <b>Commencez toujours par le Backend :</b> Assurez-vous que l'API renvoie du JSON valide avant de commencer à concevoir vos interfaces React.<br/>"
        "4. <b>Sauvegardez régulièrement sur Git :</b> Faites un commit après chaque phase complétée avec succès."
    )
    story.append(create_callout("Méthode de Travail Gagnante", rules_text, COLOR_CREME, COLOR_SAFRAN, "🏆"))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3 : PHASE 1 — PRÉPARATION DE L'ENVIRONNEMENT & INITIALISATION
    # =========================================================================
    story.append(Paragraph("Phase 1 : Préparation & Initialisation du Projet", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=8))

    story.append(Paragraph("Étape 1.1 — Vérifier vos prérequis système", h2_style))
    story.append(Paragraph(
        "Ouvrez un terminal (PowerShell sous Windows, ou Terminal sous Mac/Linux) et vérifiez que Node.js et MongoDB sont installés :",
        body_style
    ))
    story.append(create_code_block("node -v          # Doit afficher v18.0.0 ou supérieur\nnpm -v           # Doit afficher v9.0.0 ou supérieur\nmongod --version # Ou s'assurer d'avoir une URL MongoDB Atlas"))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 1.2 — Créer le dossier racine et l'arborescence", h2_style))
    story.append(Paragraph(
        "Créez un nouveau dossier vierge (ex: <code>traiteur-practice</code>) et créez les sous-dossiers fondamentaux :",
        body_style
    ))
    story.append(create_code_block(
        "mkdir traiteur-practice\n"
        "cd traiteur-practice\n"
        "mkdir server client\n"
        "git init"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 1.3 — Initialiser le package.json racine", h2_style))
    story.append(Paragraph(
        "À la racine du projet, créez un fichier <code>package.json</code> pour orchestrer l'installation et le lancement des deux mondes :",
        body_style
    ))
    story.append(create_code_block(
        "{\n"
        '  "name": "elhabchi-traiteur-app",\n'
        '  "version": "1.0.0",\n'
        '  "private": true,\n'
        '  "scripts": {\n'
        '    "install:all": "npm --prefix server install && npm --prefix client install",\n'
        '    "server": "npm --prefix server start",\n'
        '    "client": "npm --prefix client dev",\n'
        '    "dev": "node dev.js",\n'
        '    "seed": "npm --prefix server run seed"\n'
        '  }\n'
        "}"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 1.4 — Créer le script d'orchestration dev.js (Sans dépendance externe)", h2_style))
    story.append(Paragraph(
        "Pour éviter les incompatibilités de commandes Windows avec <code>concurrently</code>, nous créons un petit script natif <code>dev.js</code> à la racine :",
        body_style
    ))
    story.append(create_code_block(
        "const { spawn } = require('child_process');\n"
        "const isWin = process.platform === 'win32';\n\n"
        "function run(name, dir, cmd, args) {\n"
        "  const p = spawn(isWin ? 'cmd.exe' : cmd, isWin ? ['/c', cmd, ...args] : args, {\n"
        "    cwd: dir, stdio: 'inherit'\n"
        "  });\n"
        "  p.on('exit', code => console.log(`[${name}] quitte avec code ${code}`));\n"
        "}\n\n"
        "console.log('--- Démarrage Elhabchi Traiteur (Server + Client) ---');\n"
        "run('SERVER', './server', 'npm', ['run', 'dev']);\n"
        "run('CLIENT', './client', 'npm', ['run', 'dev']);"
    ))
    story.append(Spacer(1, 6))

    story.append(create_callout(
        "Astuce de Pro : Pourquoi cette structure ?",
        "Ce découpage en <b>monorepo simplifié</b> vous permet d'avoir tout votre code sous les yeux dans un seul projet VS Code, "
        "tout en séparant rigoureusement les dépendances serveur (sécurité, base de données) des dépendances client (UI, React).",
        COLOR_CREME, COLOR_BORDER, "💡"
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4 : PHASE 2 — BACKEND PARTIE 1 : SERVEUR & MODÈLES MONGOOSE
    # =========================================================================
    story.append(Paragraph("Phase 2 : Backend — Serveur & Modèles Mongoose", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=8))

    story.append(Paragraph("Étape 2.1 — Installer les dépendances du serveur", h2_style))
    story.append(Paragraph(
        "Déplacez-vous dans le dossier <code>server</code> et installez les paquets nécessaires :",
        body_style
    ))
    story.append(create_code_block(
        "cd server\n"
        "npm init -y\n"
        "npm install express mongoose dotenv cors bcryptjs jsonwebtoken nodemailer pdfkit\n"
        "npm install -D nodemon"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 2.2 — Fichier server/.env & Connexion MongoDB", h2_style))
    story.append(Paragraph(
        "Créez le fichier <code>server/.env</code> avec vos variables :",
        body_style
    ))
    story.append(create_code_block(
        "PORT=5000\n"
        "MONGO_URI=mongodb://127.0.0.1:27017/elhabchi_traiteur\n"
        "JWT_SECRET=super_secret_cle_jwt_elhabchi_2026\n"
        "FRONTEND_URL=http://localhost:5173"
    ))
    story.append(Paragraph(
        "Dans <code>server/src/config/db.js</code>, codez la connexion robuste avec reconnexion automatique :",
        body_style
    ))
    story.append(create_code_block(
        "const mongoose = require('mongoose');\n"
        "const connectDB = async () => {\n"
        "  try {\n"
        "    const conn = await mongoose.connect(process.env.MONGO_URI);\n"
        "    console.log(`[MongoDB] Connecté avec succès : ${conn.connection.host}`);\n"
        "  } catch (err) {\n"
        "    console.error(`[MongoDB] Erreur critique : ${err.message}`);\n"
        "    process.exit(1);\n"
        "  }\n"
        "};\n"
        "module.exports = connectDB;"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 2.3 — Modéliser les 4 Collections Clés (Mongoose)", h2_style))
    story.append(Paragraph(
        "Dans <code>server/src/models/</code>, créez vos 4 fichiers de schéma :",
        body_style
    ))

    models_data = [
        [Paragraph("<b>Modèle Mongoose</b>", table_header_style), Paragraph("<b>Fichier</b>", table_header_style), Paragraph("<b>Champs essentiels & Règles métier</b>", table_header_style)],
        [Paragraph("<b>User</b>", table_cell_bold), Paragraph("<code>User.js</code>", table_cell_style), Paragraph("<code>name, email (unique), password (haché bcrypt), role ('admin'|'staff'), isActive</code>", table_cell_style)],
        [Paragraph("<b>Booking</b>", table_cell_bold), Paragraph("<code>Booking.js</code>", table_cell_style), Paragraph("<code>bookingReference (ex: ELH-2026-00042), clientName, clientPhone, clientEmail, eventType, eventDate, guestCount, formula, selectedOptions, totalPriceMAD, status ('devis'|'confirme'|'annule')</code>", table_cell_style)],
        [Paragraph("<b>Menu</b>", table_cell_bold), Paragraph("<code>Menu.js</code>", table_cell_style), Paragraph("<code>title, formula ('Royal'|'Prestige'|'Tradition'), pricePerGuestMAD, minGuests, appetizers, mainCourses, desserts, tag</code>", table_cell_style)],
        [Paragraph("<b>Equipment</b>", table_cell_bold), Paragraph("<code>Equipment.js</code>", table_cell_style), Paragraph("<code>name, category, totalQuantity, inUseQuantity, brokenQuantity, alertThreshold, notes</code>", table_cell_style)],
    ]
    t_models = Table(models_data, colWidths=[75, 80, 360])
    t_models.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_models)
    story.append(Spacer(1, 6))

    story.append(create_callout(
        "Point Clé : Le Numéro de Devis Unique",
        "Pour générer le code <code>ELH-AAAA-NNNNN</code>, créez un pré-hook Mongoose <code>bookingSchema.pre('save')</code> "
        "qui compte les documents de l'année en cours et formate le résultat avec <code>String(count + 1).padStart(5, '0')</code>.",
        COLOR_CREME, COLOR_SAFRAN, "🔑"
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5 : PHASE 3 — BACKEND PARTIE 2 : CONTRÔLEURS & SÉCURITÉ
    # =========================================================================
    story.append(Paragraph("Phase 3 : Backend — Logique Métier & Sécurité", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=8))

    story.append(Paragraph("Étape 3.1 — Règle des 7 Jours & Calcul du Prix dans bookingController.js", h2_style))
    story.append(Paragraph(
        "Dans <code>server/src/controllers/bookingController.js</code>, implémentez la vérification stricte du préavis et le calcul dynamique :",
        body_style
    ))
    story.append(create_code_block(
        "exports.createBooking = async (req, res) => {\n"
        "  const { eventDate, guestCount, formula, selectedOptions } = req.body;\n"
        "  \n"
        "  // 1. Règle des 7 jours minimum\n"
        "  const diffDays = Math.ceil((new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24));\n"
        "  if (diffDays < 7) {\n"
        "    return res.status(400).json({ success: false, message: 'Délai minimum de 7 jours requis.' });\n"
        "  }\n"
        "  \n"
        "  // 2. Calcul du prix par invité selon formule\n"
        "  const menu = await Menu.findOne({ formula });\n"
        "  const baseRate = menu ? menu.pricePerGuestMAD : 450;\n"
        "  let total = baseRate * guestCount;\n"
        "  // Ajout des options fixes (Naggafa, tente, orchestre)\n"
        "  (selectedOptions || []).forEach(opt => { total += (opt.priceMAD || 0); });\n"
        "  \n"
        "  const booking = await Booking.create({ ...req.body, totalPriceMAD: total });\n"
        "  res.status(201).json({ success: true, data: booking });\n"
        "};"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 3.2 — Middleware de Sécurité JWT & Contrôle des Rôles (RBAC)", h2_style))
    story.append(Paragraph(
        "Dans <code>server/src/middleware/auth.js</code>, protégez les routes d'administration contre les accès non autorisés :",
        body_style
    ))
    story.append(create_code_block(
        "const jwt = require('jsonwebtoken');\n"
        "const User = require('../models/User');\n\n"
        "exports.protect = async (req, res, next) => {\n"
        "  let token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1];\n"
        "  if (!token) return res.status(401).json({ message: 'Accès refusé : token manquant.' });\n"
        "  try {\n"
        "    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n"
        "    req.user = await User.findById(decoded.id).select('-password');\n"
        "    next();\n"
        "  } catch (err) { res.status(401).json({ message: 'Token invalide ou expiré.' }); }\n"
        "};\n\n"
        "exports.restrictTo = (...roles) => (req, res, next) => {\n"
        "  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Permission insuffisante.' });\n"
        "  next();\n"
        "};"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 3.3 — Créer le script de Seed (server/src/seeds/seed.js)", h2_style))
    story.append(Paragraph(
        "Ce script injecte automatiquement vos utilisateurs (Admin / Staff), les menus officiels et l'inventaire matériel initial.",
        body_style
    ))
    story.append(create_code_block(
        "node src/seeds/seed.js\n"
        "# Résultat attendu : \n"
        "# [SEED] 2 utilisateurs créés (Admin + Staff)\n"
        "# [SEED] 3 menus gastronomiques injectés (Royal, Prestige, Tradition)\n"
        "# [SEED] 10 matériels d'inventaire initialisés"
    ))
    story.append(Spacer(1, 6))

    story.append(create_callout(
        "Test de Validation Backend",
        "Lancez <code>npm run dev</code> dans <code>server/</code> puis testez l'URL <code>http://localhost:5000/api/v1/health</code>. "
        "Vous devez recevoir la réponse JSON : <code>{\"status\":\"ok\",\"timestamp\":...}</code>.",
        COLOR_CREME, COLOR_BORDER, "✅"
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6 : PHASE 4 — FRONTEND : VITE, TAILWIND CSS & CONTEXT
    # =========================================================================
    story.append(Paragraph("Phase 4 : Frontend — Setup, Tailwind & État Global", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=8))

    story.append(Paragraph("Étape 4.1 — Initialisation rapide avec Vite & React", h2_style))
    story.append(Paragraph(
        "Depuis le dossier racine de votre projet, initialisez le dossier client :",
        body_style
    ))
    story.append(create_code_block(
        "cd client\n"
        "npm create vite@latest . -- --template react\n"
        "npm install\n"
        "npm install tailwindcss postcss autoprefixer react-router-dom lucide-react\n"
        "npx tailwindcss init -p"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 4.2 — Charte Graphique Luxe dans tailwind.config.js", h2_style))
    story.append(Paragraph(
        "Configurez les couleurs prestigieuses et les polices marocaines dans <code>client/tailwind.config.js</code> :",
        body_style
    ))
    story.append(create_code_block(
        "module.exports = {\n"
        "  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n"
        "  darkMode: 'class',\n"
        "  theme: {\n"
        "    extend: {\n"
        "      colors: {\n"
        "        zellige: { DEFAULT: '#0F5C4D', dark: '#0A3E34', light: '#167D69' },\n"
        "        safran:  { DEFAULT: '#B8923A', light: '#D4B265', dark: '#8C6C26' },\n"
        "        creme:   { DEFAULT: '#FBF5E6', sand: '#F4EEDF' },\n"
        "      }\n"
        "    }\n"
        "  },\n"
        "  plugins: []\n"
        "};"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 4.3 — Création du Context Global (client/src/context/AppContext.jsx)", h2_style))
    story.append(Paragraph(
        "Ce contexte centralise la langue (FR/AR/EN), la direction RTL, le thème et les données de devis :",
        body_style
    ))
    story.append(create_code_block(
        "import React, { createContext, useContext, useState, useEffect } from 'react';\n"
        "import { translations } from '../utils/translations';\n\n"
        "const AppContext = createContext();\n\n"
        "export const AppProvider = ({ children }) => {\n"
        "  const [lang, setLang] = useState(localStorage.getItem('elh_lang') || 'fr');\n"
        "  const [theme, setTheme] = useState(localStorage.getItem('elh_theme') || 'light');\n"
        "  const [quoteData, setQuoteData] = useState({ guestCount: 100, formula: 'Royal', options: [] });\n\n"
        "  useEffect(() => {\n"
        "    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';\n"
        "    document.documentElement.lang = lang;\n"
        "    localStorage.setItem('elh_lang', lang);\n"
        "  }, [lang]);\n\n"
        "  const t = (key) => translations[lang]?.[key] || translations['fr']?.[key] || key;\n\n"
        "  return (\n"
        "    <AppContext.Provider value={{ lang, setLang, theme, setTheme, quoteData, setQuoteData, t }}>\n"
        "      {children}\n"
        "    </AppContext.Provider>\n"
        "  );\n"
        "};\n"
        "export const useApp = () => useContext(AppContext);"
    ))
    story.append(Spacer(1, 6))

    story.append(create_callout(
        "Pourquoi un Context unique ?",
        "Pour une application traiteur de cette envergure, React Context évite d'installer Redux tout en offrant "
        "une réactivité instantanée sur toute l'interface (traduction en direct et calcul de prix synchrone).",
        COLOR_CREME, COLOR_BORDER, "💡"
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7 : PHASE 5 — LE CŒUR MÉTIER : LE SIMULATEUR EN 6 ÉTAPES
    # =========================================================================
    story.append(Paragraph("Phase 5 : Le Cœur Métier — Simulateur en 6 Étapes", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=8))

    story.append(Paragraph("Étape 5.1 — Structure du composant Simulator.jsx", h2_style))
    story.append(Paragraph(
        "Le composant gère une variable d'état <code>step</code> de 1 à 6 avec barre de progression interactive :",
        body_style
    ))

    sim_steps = [
        [Paragraph("<b>Étape</b>", table_header_style), Paragraph("<b>Titre de l'écran</b>", table_header_style), Paragraph("<b>Composants & Contrôles d'entrée utilisateur</b>", table_header_style)],
        [Paragraph("<b>1</b>", table_cell_bold), Paragraph("Type d'événement", table_cell_style), Paragraph("Cartes sélectionnables : Mariage impérial, Fiançailles, Baptême, Dîner gala, Entreprise.", table_cell_style)],
        [Paragraph("<b>2</b>", table_cell_bold), Paragraph("Date & Invités", table_cell_style), Paragraph("Sélecteur de date (min: aujourd'hui + 7 jours) et curseur d'invités (20 à 1000).", table_cell_style)],
        [Paragraph("<b>3</b>", table_cell_bold), Paragraph("Formule Gastronomique", table_cell_style), Paragraph("Choix de la carte : Formule Tradition (380 MAD), Prestige (550 MAD) ou Royale (850 MAD).", table_cell_style)],
        [Paragraph("<b>4</b>", table_cell_bold), Paragraph("Options Traditionnelles", table_cell_style), Paragraph("Cases à cocher : Naggafa et Amariya, Orchestre Andalou, Fontaine chocolat, Pièce montée.", table_cell_style)],
        [Paragraph("<b>5</b>", table_cell_bold), Paragraph("Logistique & Service", table_cell_style), Paragraph("Tentes Caïdales de réception, Tables rondes damassées, Équipe maîtres d'hôtel.", table_cell_style)],
        [Paragraph("<b>6</b>", table_cell_bold), Paragraph("Coordonnées & Validation", table_cell_style), Paragraph("Nom, téléphone, email, ville + Récapitulatif chiffré en MAD + Bouton WhatsApp instantané.", table_cell_style)],
    ]
    t_steps = Table(sim_steps, colWidths=[30, 135, 350])
    t_steps.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_steps)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Étape 5.2 — La Fonction Génératrice du Message WhatsApp", h2_style))
    story.append(Paragraph(
        "Voici la fonction exacte pour générer le lien prérempli qui transforme le devis en conversation commerciale instantanée :",
        body_style
    ))
    story.append(create_code_block(
        "const buildWhatsAppUrl = (booking) => {\n"
        "  const phone = '212705782737'; // Numéro officiel Elhabchi Traiteur\n"
        "  const text = `Salam Alaykoum Elhabchi Traiteur,%0A%0A` +\n"
        "    `Je souhaite confirmer mon devis en ligne :%0A` +\n"
        "    `• Référence : *${booking.bookingReference}*%0A` +\n"
        "    `• Événement : ${booking.eventType}%0A` +\n"
        "    `• Date : ${new Date(booking.eventDate).toLocaleDateString('fr-FR')}%0A` +\n"
        "    `• Invités : ${booking.guestCount} personnes%0A` +\n"
        "    `• Formule : ${booking.formula}%0A` +\n"
        "    `• Total Estimé : *${booking.totalPriceMAD.toLocaleString()} MAD*%0A%0A` +\n"
        "    `Nom : ${booking.clientName}%0A` +\n"
        "    `Téléphone : ${booking.clientPhone}`;\n"
        "  \n"
        "  return `https://wa.me/${phone}?text=${text}`;\n"
        "};"
    ))
    story.append(Spacer(1, 6))

    story.append(create_callout(
        "Avantage Métier Immédiat",
        "Cette intégration WhatsApp directe multiplie par 3 le taux de conversion des visiteurs en clients signés "
        "en supprimant la barrière du formulaire d'inscription classique.",
        COLOR_CREME, COLOR_SAFRAN, "✨"
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 8 : PHASE 6 — SUIVI CLIENT & BACK-OFFICE ADMINISTRATEUR
    # =========================================================================
    story.append(Paragraph("Phase 6 : Suivi Client & Back-Office Admin", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=8))

    story.append(Paragraph("Étape 6.1 — Le Portail de Suivi sans compte (Track.jsx)", h2_style))
    story.append(Paragraph(
        "Les clients peuvent suivre l'état de leur commande sur <code>/suivi</code> grâce à une double clé de vérification :",
        body_style
    ))
    story.append(create_code_block(
        "// Appel API vers la route publique sécurisée\n"
        "const handleTrack = async (e) => {\n"
        "  e.preventDefault();\n"
        "  const res = await fetch(`/api/v1/bookings/track?ref=${refCode}&phone=${phone}`);\n"
        "  const result = await res.json();\n"
        "  if (result.success) setBooking(result.data);\n"
        "  else setError('Aucun devis trouvé avec ces identifiants.');\n"
        "};"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 6.2 — Architecture de la Suite Back-Office (/admin)", h2_style))
    story.append(Paragraph(
        "L'espace d'administration comprend 6 modules modulaires sous <code>client/src/pages/admin/</code> :",
        body_style
    ))

    admin_modules = [
        [Paragraph("<b>Composant Admin</b>", table_header_style), Paragraph("<b>Route</b>", table_header_style), Paragraph("<b>Rôle & Fonctionnalités clés</b>", table_header_style)],
        [Paragraph("<b>Dashboard.jsx</b>", table_cell_bold), Paragraph("<code>/admin</code>", table_cell_style), Paragraph("Indicateurs clés : CA estimé, devis en attente, alertes de casse matériel.", table_cell_style)],
        [Paragraph("<b>BookingsManage.jsx</b>", table_cell_bold), Paragraph("<code>/admin/bookings</code>", table_cell_style), Paragraph("Tableau complet, filtres par statut, confirmation en 1 clic, saisie de commande téléphonique.", table_cell_style)],
        [Paragraph("<b>EquipmentManage.jsx</b>", table_cell_bold), Paragraph("<code>/admin/equipment</code>", table_cell_style), Paragraph("Suivi de l'inventaire en temps réel, signalement de casse et décompte des réparations.", table_cell_style)],
        [Paragraph("<b>MenuManage.jsx</b>", table_cell_bold), Paragraph("<code>/admin/menus</code>", table_cell_style), Paragraph("CRUD complet sur les cartes et plats de la gastronomie marocaine.", table_cell_style)],
        [Paragraph("<b>CalendarView.jsx</b>", table_cell_bold), Paragraph("<code>/admin/calendar</code>", table_cell_style), Paragraph("Vue mensuelle des réceptions avec code couleur par statut.", table_cell_style)],
    ]
    t_admin = Table(admin_modules, colWidths=[110, 95, 310])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Étape 6.3 — Connexion & Protection par Route Privée (ProtectedRoute)", h2_style))
    story.append(Paragraph(
        "Enveloppez les routes d'administration dans un composant qui vérifie la présence du token JWT :",
        body_style
    ))
    story.append(create_code_block(
        "const ProtectedRoute = ({ children, allowedRoles }) => {\n"
        "  const token = localStorage.getItem('elh_token');\n"
        "  const user = JSON.parse(localStorage.getItem('elh_user') || '{}');\n"
        "  if (!token) return <Navigate to='/admin/login' replace />;\n"
        "  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to='/' replace />;\n"
        "  return children;\n"
        "};"
    ))
    story.append(Spacer(1, 6))

    story.append(create_callout(
        "Identifiants de Test Injectés par le Seed",
        "• <b>Super-Admin :</b> <code>admin@elhabchitraiteur.ma</code> / Mot de passe : <code>Admin1234!</code><br/>"
        "• <b>Staff Opérationnel :</b> <code>staff@elhabchitraiteur.ma</code> / Mot de passe : <code>Staff1234!</code>",
        COLOR_CREME, COLOR_BORDER, "🔐"
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 9 : PHASE 7 — ORCHESTRATION & PRODUCTION
    # =========================================================================
    story.append(Paragraph("Phase 7 : Orchestration & Déploiement", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=8))

    story.append(Paragraph("Étape 7.1 — Tester la chaîne de démarrage complète", h2_style))
    story.append(Paragraph(
        "Une fois les fichiers en place, testez la séquence complète depuis la racine du projet :",
        body_style
    ))
    story.append(create_code_block(
        "# 1. Installer toutes les dépendances serveur + client\n"
        "npm run install:all\n\n"
        "# 2. Injecter les données de test (comptes, menus, matériels)\n"
        "npm run seed\n\n"
        "# 3. Lancer simultanément le backend et le frontend\n"
        "npm run dev"
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("Étape 7.2 — Les points de vérification après démarrage", h2_style))
    story.append(Paragraph(
        "Ouvrez votre navigateur et testez ces 4 adresses indispensables :",
        body_style
    ))

    checks_data = [
        [Paragraph("<b>URL à tester</b>", table_header_style), Paragraph("<b>Comportement attendu</b>", table_header_style)],
        [Paragraph("<code>http://localhost:5173</code>", table_cell_bold), Paragraph("Page d'accueil du site vitrine avec animations de prestige et boutons de devis.", table_cell_style)],
        [Paragraph("<code>http://localhost:5173/simulateur</code>", table_cell_bold), Paragraph("Simulateur interactif en 6 étapes avec calcul direct des tarifs en MAD.", table_cell_style)],
        [Paragraph("<code>http://localhost:5173/admin/login</code>", table_cell_bold), Paragraph("Formulaire de connexion administrateur sécurisé.", table_cell_style)],
        [Paragraph("<code>http://localhost:5000/api/v1/health</code>", table_cell_bold), Paragraph("API Backend en direct répondant <code>{\"status\":\"ok\"}</code>.", table_cell_style)],
    ]
    t_checks = Table(checks_data, colWidths=[175, 340])
    t_checks.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_checks)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Étape 7.3 — Compilation & Déploiement en Production", h2_style))
    story.append(Paragraph(
        "Pour mettre le site en ligne sur un serveur réel (VPS, Vercel ou Render) :",
        body_style
    ))
    story.append(create_code_block(
        "# Dans le dossier client : créer le bundle optimisé de production\n"
        "cd client\n"
        "npm run build\n"
        "# Le dossier 'dist/' généré contient tout le site minifié (HTML/CSS/JS ultra-rapide) !"
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Dans <code>server/src/app.js</code>, ajoutez simplement ces 3 lignes pour que le serveur Node serve automatiquement le frontend :",
        body_style
    ))
    story.append(create_code_block(
        "if (process.env.NODE_ENV === 'production') {\n"
        "  app.use(express.static(path.join(__dirname, '../../client/dist')));\n"
        "  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html')));\n"
        "}"
    ))
    story.append(Spacer(1, 6))

    story.append(create_callout(
        "Prêt pour le Cloud",
        "Grâce à cette configuration, votre application peut être déployée en 1 seul service Node sur Render ou Railway, "
        "ou avec la base de données hébergée gratuitement sur MongoDB Atlas.",
        COLOR_CREME, COLOR_BORDER, "☁️"
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 10 : PHASE 8 — EXERCICES PRATIQUES & DÉFIS DÉVELOPPEUR
    # =========================================================================
    story.append(Paragraph("Phase 8 : Exercices Pratiques & Défis Développeur", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.2, color=COLOR_SAFRAN, spaceAfter=8))

    story.append(Paragraph(
        "Félicitations pour être arrivé jusqu'ici ! Pour consolider définitivement votre savoir-faire et devenir totalement "
        "autonome, voici <b>5 défis pratiques</b> à coder vous-même :",
        body_style
    ))
    story.append(Spacer(1, 4))

    defis = [
        [Paragraph("<b>Défi Développeur</b>", table_header_style), Paragraph("<b>Consigne & Compétence ciblée</b>", table_header_style), Paragraph("<b>Difficulté</b>", table_header_style)],
        [Paragraph("<b>Défi 1 : Code Promo</b>", table_cell_bold), Paragraph("Ajoutez un champ 'Code Réduction' à l'étape 6 du simulateur (ex: <code>RAMADAN2026</code> = -10% sur le total). Cible : State React et calcul côté contrôleur.", table_cell_style), Paragraph("★☆☆ (Facile)", table_cell_style)],
        [Paragraph("<b>Défi 2 : Export Excel</b>", table_cell_bold), Paragraph("Dans l'admin, créez un bouton qui télécharge la liste des commandes du mois au format <code>.csv</code> ou <code>.xlsx</code> pour la comptabilité.", table_cell_style), Paragraph("★★☆ (Moyen)", table_cell_style)],
        [Paragraph("<b>Défi 3 : SMS de Confirmation</b>", table_cell_bold), Paragraph("Branchez l'API Twilio ou un webhook pour envoyer un SMS automatique au client dès que son statut passe à 'Confirmé'.", table_cell_style), Paragraph("★★☆ (Moyen)", table_cell_style)],
        [Paragraph("<b>Défi 4 : Filtres Matériel</b>", table_cell_bold), Paragraph("Ajoutez une barre de recherche en temps réel et un filtre par catégorie (Vaisselle, Mobilier, Tentes) sur la page <code>EquipmentManage.jsx</code>.", table_cell_style), Paragraph("★☆☆ (Facile)", table_cell_style)],
        [Paragraph("<b>Défi 5 : Avis Clients</b>", table_cell_bold), Paragraph("Créez une collection Mongoose <code>Review</code> et permettez aux clients de laisser une note avec étoiles (1 à 5) visible sur la page d'accueil.", table_cell_style), Paragraph("★★★ (Avancé)", table_cell_style)],
    ]
    t_defis = Table(defis, colWidths=[110, 320, 85])
    t_defis.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_defis)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Checklist Finale d'Auto-Évaluation", h2_style))
    checklist_text = (
        "Cochez ces points pour valider que votre projet refait de zéro est 100% opérationnel :<br/>"
        "□ [Backend] L'API démarre sur le port 5000 et répond à <code>/api/v1/health</code>.<br/>"
        "□ [Base de données] MongoDB contient les collections users, bookings, menus et equipments.<br/>"
        "□ [Règle métier] Le simulateur bloque les réservations à moins de 7 jours d'intervalle.<br/>"
        "□ [WhatsApp] Le clic sur 'Valider via WhatsApp' ouvre bien le chat avec le message prérempli.<br/>"
        "□ [Suivi] Un client peut retrouver son devis avec son code et son numéro de téléphone.<br/>"
        "□ [Back-Office] La connexion Admin fonctionne et donne accès au Dashboard et aux stocks."
    )
    story.append(create_callout("Auto-Évaluation Développeur", checklist_text, COLOR_CREME, COLOR_ZELLIGE, "🎯"))
    story.append(Spacer(1, 12))

    footer_p = Paragraph(
        "<font color='#5A6662'><i>Félicitations pour votre apprentissage ! Prenez le temps de pratiquer régulièrement et amusez-vous à personnaliser votre application Elhabchi Traiteur.</i></font>",
        ParagraphStyle('FootMsg', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, alignment=1)
    )
    story.append(footer_p)

    # Construction effective du PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Guide DIY généré avec succès : {filename}")

if __name__ == '__main__':
    build_diy_guide_pdf()
