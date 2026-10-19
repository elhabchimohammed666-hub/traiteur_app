# -*- coding: utf-8 -*-
"""
Générateur de Guide Complet PDF pour Elhabchi Traiteur
Utilise ReportLab pour créer un document haute fidélité, esthétique et pédagogique.
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
COLOR_ZELLIGE_DARK = colors.HexColor('#0A3E34') # Vert sombre
COLOR_SAFRAN = colors.HexColor('#B8923A')       # Or Safran noble
COLOR_SAFRAN_LIGHT = colors.HexColor('#D4B265') # Or doux
COLOR_CREME = colors.HexColor('#FBF5E6')        # Crème soie
COLOR_SABLE = colors.HexColor('#F4EEDF')        # Fond sable doux
COLOR_ANTHRACITE = colors.HexColor('#1E2522')   # Gris anthracite texte
COLOR_MUTED = colors.HexColor('#5A6662')        # Texte secondaire
COLOR_BORDER = colors.HexColor('#D8C8A8')       # Bordure dorée douce
COLOR_SUCCESS = colors.HexColor('#15803D')      # Vert validation
COLOR_ALERT = colors.HexColor('#B91C1C')        # Rouge alerte

class NumberedCanvas(canvas.Canvas):
    """Canvas personnalisé avec numérotation 'Page X sur Y' et en-tête courant"""
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
        # Ne pas décorer la page de garde (page 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        page_width, page_height = A4

        # En-tête
        self.setStrokeColor(COLOR_SAFRAN)
        self.setLineWidth(0.8)
        self.line(40, page_height - 40, page_width - 40, page_height - 40)

        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(COLOR_ZELLIGE)
        self.drawString(40, page_height - 35, "ELHABCHI TRAITEUR")
        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_MUTED)
        self.drawString(135, page_height - 35, "—  Guide Complet d'Utilisation et de Gestion (MERN)")

        # Pied de page
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(40, 42, page_width - 40, 42)

        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_MUTED)
        self.drawString(40, 30, "Document officiel confidentiel · Contact WhatsApp : +212 705 782 737")
        page_str = f"Page {self._pageNumber} sur {total_pages}"
        self.drawRightString(page_width - 40, 30, page_str)

        self.restoreState()


def build_guide_pdf(filename="Guide_Complet_Elhabchi_Traiteur.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Définition des styles personnalisés
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=COLOR_ZELLIGE,
        alignment=1, # Centre
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=16,
        textColor=COLOR_SAFRAN,
        alignment=1,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'ChapterH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=COLOR_ZELLIGE,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=COLOR_SAFRAN,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=COLOR_ANTHRACITE,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_ANTHRACITE,
        leftIndent=15,
        spaceAfter=3
    )

    tip_style = ParagraphStyle(
        'TipText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_ZELLIGE_DARK
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=COLOR_ANTHRACITE
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=COLOR_ZELLIGE
    )

    story = []

    # =========================================================================
    # PAGE DE GARDE (COVER PAGE)
    # =========================================================================
    story.append(Spacer(1, 20))
    
    # Boîte décorative d'en-tête
    cover_header = [
        [Paragraph("<font size=10 color='#B8923A'><b>MAISON FONDÉE AVEC PASSION · HAUTE GASTRONOMIE MAROCAINE</b></font>", ParagraphStyle('C1', alignment=1))],
        [Spacer(1, 4)],
        [Paragraph("<font size=14 color='#0F5C4D'><b>ELHABCHI TRAITEUR D'APPARAT</b></font>", ParagraphStyle('C2', alignment=1))]
    ]
    t_cover_header = Table(cover_header, colWidths=[515])
    t_cover_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_SABLE),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_SAFRAN),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_cover_header)
    story.append(Spacer(1, 40))

    # Titre Principal
    story.append(Paragraph("GUIDE COMPLET D'UTILISATION ET DE GESTION", title_style))
    story.append(Paragraph("Comprendre le projet, utiliser la plateforme et piloter l'activité avec une méthode simple et efficace", subtitle_style))
    story.append(HRFlowable(width="60%", thickness=2, color=COLOR_SAFRAN, spaceAfter=30))

    # Tableau de synthèse de la page de garde
    meta_info = [
        [Paragraph("<b>Projet</b>", table_cell_bold), Paragraph("Application Web MERN Elhabchi Traiteur (Vitrine, Simulateur WhatsApp & Back-Office)", table_cell_style)],
        [Paragraph("<b>Version</b>", table_cell_bold), Paragraph("1.0 (Conforme au Cahier des Charges Officiel)", table_cell_style)],
        [Paragraph("<b>Destinataires</b>", table_cell_bold), Paragraph("Propriétaire, Administrateur, Équipe Staff, Conseillers Événementiels", table_cell_style)],
        [Paragraph("<b>Stack Technique</b>", table_cell_bold), Paragraph("MongoDB Atlas, Express.js, React.js (Vite + Tailwind CSS), Node.js", table_cell_style)],
        [Paragraph("<b>Contact WhatsApp Officiel</b>", table_cell_bold), Paragraph("<b>0705782737</b> (format international : <code>+212 705 782 737</code>)", table_cell_style)],
        [Paragraph("<b>Identifiant Dossier Type</b>", table_cell_bold), Paragraph("Format normalisé : <code>ELH-AAAA-NNNNN</code> (ex : ELH-2026-00042)", table_cell_style)]
    ]
    t_meta = Table(meta_info, colWidths=[150, 365])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_meta)

    story.append(Spacer(1, 50))

    # Encadré Objectifs
    obj_box = [
        [Paragraph("<b>Ce que ce guide vous apporte :</b><br/>"
                   "• <b>Comprendre :</b> la vision globale, le flux de données et les règles de gestion métier.<br/>"
                   "• <b>Utiliser :</b> naviguer sur la vitrine, composer un événement en 6 étapes et transmettre un devis WhatsApp.<br/>"
                   "• <b>Gérer :</b> valider les demandes, encaisser les acomptes, surveiller le matériel et planifier les dates.", tip_style)]
    ]
    t_obj = Table(obj_box, colWidths=[515])
    t_obj.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_CREME),
        ('BOX', (0,0), (-1,-1), 1, COLOR_ZELLIGE),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(t_obj)

    story.append(PageBreak())

    # =========================================================================
    # SOMMAIRE / TABLE DES MATIÈRES
    # =========================================================================
    story.append(Paragraph("TABLE DES MATIÈRES", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_SAFRAN, spaceAfter=15))

    toc_data = [
        [Paragraph("<b>1. Comprendre le Projet en Toute Simplicité</b>", table_cell_bold), Paragraph("Page 3", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.1 La triple mission de l'application", table_cell_style), Paragraph("Page 3", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.2 L'architecture technique MERN expliquée simplement", table_cell_style), Paragraph("Page 3", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.3 Les 5 règles d'or de gestion métier", table_cell_style), Paragraph("Page 4", table_cell_style)],
        [Paragraph("<b>2. Guide d'Utilisation Client (Module Public)</b>", table_cell_bold), Paragraph("Page 5", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.1 Navigation et découverte de la Maison", table_cell_style), Paragraph("Page 5", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.2 Le Simulateur de devis pas-à-pas (6 étapes)", table_cell_style), Paragraph("Page 5", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.3 L'intégration et transmission WhatsApp (0705782737)", table_cell_style), Paragraph("Page 6", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.4 L'Espace Suivi de devis sans création de compte", table_cell_style), Paragraph("Page 7", table_cell_style)],
        [Paragraph("<b>3. Guide de Gestion & Pilotage (Back-Office Admin & Staff)</b>", table_cell_bold), Paragraph("Page 8", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.1 Accès sécurisé et rôles (Admin vs Staff)", table_cell_style), Paragraph("Page 8", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.2 Le Tableau de Bord exécutif et ses indicateurs", table_cell_style), Paragraph("Page 8", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.3 Traiter et valider une réservation / Saisie téléphonique", table_cell_style), Paragraph("Page 9", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.4 Gestion du Stock de matériel et alertes de casse", table_cell_style), Paragraph("Page 10", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.5 Gestion de la carte (Plats, Formules, Prestations)", table_cell_style), Paragraph("Page 11", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.6 Planning mensuel et calendrier des réceptions", table_cell_style), Paragraph("Page 11", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.7 Paramétrage métier et dates bloquées", table_cell_style), Paragraph("Page 12", table_cell_style)],
        [Paragraph("<b>4. Guide Pratique & Démarrage Rapide</b>", table_cell_bold), Paragraph("Page 13", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.1 Déployer le projet sur un autre ordinateur en 3 étapes", table_cell_style), Paragraph("Page 13", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.2 Tableau récapitulatif des accès et identifiants", table_cell_style), Paragraph("Page 13", table_cell_style)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.3 Résolution des problèmes fréquents (FAQ technique)", table_cell_style), Paragraph("Page 14", table_cell_style)]
    ]
    t_toc = Table(toc_data, colWidths=[430, 85])
    t_toc.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#F0ECE1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_toc)

    story.append(PageBreak())

    # =========================================================================
    # CHAPITRE 1 : COMPRENDRE LE PROJET
    # =========================================================================
    story.append(Paragraph("CHAPITRE 1 : COMPRENDRE LE PROJET EN TOUTE SIMPLICITÉ", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_SAFRAN, spaceAfter=12))

    story.append(Paragraph("1.1 La triple mission de l'application", h2_style))
    story.append(Paragraph(
        "L'application web <b>Elhabchi Traiteur</b> est une solution complète conçue pour digitaliser et professionnaliser "
        "l'activité d'un traiteur marocain haut de gamme. Elle remplit trois rôles stratégiques complémentaires :",
        body_style
    ))

    missions_table = [
        [Paragraph("<b>Pôle</b>", table_header_style), Paragraph("<b>Objectif Principal</b>", table_header_style), Paragraph("<b>Public Cible</b>", table_header_style)],
        [Paragraph("<b>1. Vitrine d'Apparat</b>", table_cell_bold), Paragraph("Séduire les visiteurs avec un univers visuel prestigieux, présenter l'histoire de la maison, la carte gastronomique marocaine, les formules clés en main et la galerie de réceptions.", table_cell_style), Paragraph("Visiteurs, futurs mariés, entreprises", table_cell_style)],
        [Paragraph("<b>2. Simulateur de Devis</b>", table_cell_bold), Paragraph("Permettre au client de concevoir son événement sur-mesure (date, invités, menu, matériel, serveurs), d'obtenir une estimation en direct et de transmettre le dossier sur WhatsApp en un clic.", table_cell_style), Paragraph("Clients particuliers et professionnels", table_cell_style)],
        [Paragraph("<b>3. Back-Office Pro</b>", table_cell_bold), Paragraph("Fournir à la direction et au staff les outils nécessaires pour valider les devis, enregistrer les paiements, suivre le stock de matériel (tentes, vaisselle) et planifier les événements.", table_cell_style), Paragraph("Administrateur, Staff, Logistique", table_cell_style)]
    ]
    t_missions = Table(missions_table, colWidths=[115, 260, 140])
    t_missions.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_missions)
    story.append(Spacer(1, 12))

    story.append(Paragraph("1.2 L'architecture technique MERN expliquée simplement", h2_style))
    story.append(Paragraph(
        "L'application repose sur la stack <b>MERN</b>, le standard moderne le plus performant pour les applications web interactives :",
        body_style
    ))
    story.append(Paragraph("• <b>MongoDB (Base de données) :</b> Stocke de manière flexible et rapide tous les plats, formules, matériels en stock, réservations, utilisateurs et paramètres.", bullet_style))
    story.append(Paragraph("• <b>Express.js & Node.js (Backend API) :</b> Le moteur central. Il calcule le montant précis des devis, vérifie la disponibilité des dates et des tentes, sécurise les mots de passe et génère les devis PDF officiels.", bullet_style))
    story.append(Paragraph("• <b>React.js & Vite (Frontend Client) :</b> L'interface visuelle ultra-fluide avec laquelle interagissent vos clients et votre personnel. Elle s'adapte instantanément aux téléphones, tablettes et ordinateurs.", bullet_style))
    story.append(Paragraph("• <b>Lien WhatsApp structuré :</b> Connecteur direct avec le numéro officiel <b>0705782737</b> (<code>wa.me/212705782737</code>), pré-remplissant l'ensemble du devis pour engager la conversation.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("1.3 Les 5 règles d'or de gestion métier (RG)", h2_style))
    rules_data = [
        [Paragraph("<b>Règle</b>", table_header_style), Paragraph("<b>Principe Métier</b>", table_header_style), Paragraph("<b>Application Concrète</b>", table_header_style)],
        [Paragraph("<b>RG1 : Préavis</b>", table_cell_bold), Paragraph("Délai de 7 jours minimum.", table_cell_style), Paragraph("Le simulateur bloque les dates à moins de 7 jours pour préserver la qualité de préparation. Pour une urgence, le client est orienté vers WhatsApp.", table_cell_style)],
        [Paragraph("<b>RG2 : Acompte</b>", table_cell_bold), Paragraph("Acompte obligatoire de 30 %.", table_cell_style), Paragraph("Pour qu'une réservation passe en statut 'Confirmé', l'encaissement de l'acompte (30% du total) doit être enregistré par l'administrateur.", table_cell_style)],
        [Paragraph("<b>RG3 : Stock</b>", table_cell_bold), Paragraph("Verrouillage du matériel réservé.", table_cell_style), Paragraph("Toute réservation en cours ou confirmée bloque le nombre d'articles loués sur sa période. Stock disponible = Total - Hors service - Réservé.", table_cell_style)],
        [Paragraph("<b>RG4 : Code Unique</b>", table_cell_bold), Paragraph("Code <code>ELH-AAAA-NNNNN</code>.", table_cell_style), Paragraph("Chaque devis reçoit un code chronologique unique (ex : ELH-2026-00042) servant de référence sur WhatsApp, sur le suivi et sur les PDF.", table_cell_style)],
        [Paragraph("<b>RG5 : RBAC</b>", table_cell_bold), Paragraph("Séparation des prérogatives.", table_cell_style), Paragraph("Le Staff peut établir des devis et gérer le stock. Seul l'Administrateur peut confirmer, encaisser des paiements, annuler ou modifier les prix.", table_cell_style)]
    ]
    t_rules = Table(rules_data, colWidths=[95, 140, 280])
    t_rules.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_rules)

    story.append(PageBreak())

    # =========================================================================
    # CHAPITRE 2 : GUIDE D'UTILISATION CLIENT
    # =========================================================================
    story.append(Paragraph("CHAPITRE 2 : GUIDE D'UTILISATION CLIENT (MODULE PUBLIC)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_SAFRAN, spaceAfter=12))

    story.append(Paragraph("2.1 Navigation & Découverte de la Maison", h2_style))
    story.append(Paragraph(
        "L'interface publique a été conçue pour offrir une expérience immersive d'exception, valorisant le savoir-faire marocain :",
        body_style
    ))
    story.append(Paragraph("• <b>Page d'Accueil :</b> Présentation de l'art de recevoir, des chiffres clés (25 ans d'expérience, 1200+ réceptions), aperçu des formules et témoignages.", bullet_style))
    story.append(Paragraph("• <b>Nos Menus :</b> Exploration par onglets : Entrées d'apparat, Grands Plats & Tajines, Méchouis dorés au four, Pâtisseries fines et Cérémonies du thé.", bullet_style))
    story.append(Paragraph("• <b>Nos Formules :</b> Comparatif détaillé des 4 formules clés en main (Moussem, Fassi, Impériale, Royale). Un bouton 'Choisir' injecte directement la formule dans le simulateur.", bullet_style))
    story.append(Paragraph("• <b>Galerie :</b> Mosaïque filtrable (Mariages, Fiançailles, Galas) avec agrandissement des photos haute résolution (Lightbox).", bullet_style))
    story.append(Paragraph("• <b>Bascule Multilingue & Thème :</b> Changement de langue FR / AR (avec inversion RTL droite-à-gauche automatique) et bascule Mode Clair / Sombre en un clic.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("2.2 Le Simulateur de Devis en 6 Étapes Pas-à-Pas", h2_style))
    story.append(Paragraph(
        "Accessible depuis le bouton <b>'Simulateur & Devis'</b> ou <code>/reserver</code>, ce composant exclusif guide le client en 6 étapes :",
        body_style
    ))

    stepper_table = [
        [Paragraph("<b>Étape</b>", table_header_style), Paragraph("<b>Contenu & Choix Client</b>", table_header_style), Paragraph("<b>Impact & Contrôle Automatique</b>", table_header_style)],
        [Paragraph("<b>1. Événement</b>", table_cell_bold), Paragraph("Type de célébration (Mariage, Fiançailles, Baptême, Entreprise), date prévue, ville (Casablanca, Rabat, Marrakech...) et type de lieu.", table_cell_style), Paragraph("Vérification en temps réel de la date. Alerte immédiate si la date est complète ou si le préavis de 7 jours n'est pas respecté.", table_cell_style)],
        [Paragraph("<b>2. Convives</b>", table_cell_bold), Paragraph("Nombre total d'invités (jauge interactive avec boutons -10 / +10 et curseur de 20 à 800 personnes).", table_cell_style), Paragraph("Calcul automatique indicatif du nombre de tables rondes nécessaires et du dimensionnement de la brigade de service.", table_cell_style)],
        [Paragraph("<b>3. Menus</b>", table_cell_bold), Paragraph("Sélection d'une formule globale ou composition à la carte + ajout de spécialités extras (Pastillas, Tajines, Méchoui).", table_cell_style), Paragraph("Mise à jour en temps réel du sous-total nourriture (prix formule × nombre d'invités + suppléments).", table_cell_style)],
        [Paragraph("<b>4. Matériel</b>", table_cell_bold), Paragraph("Location de tentes caïdales, tables d'honneur, chaises chiavari, vaisselle dorée + prestations (serveurs en jabador, orchestre).", table_cell_style), Paragraph("Contrôle automatique du stock disponible sur la période. Impossible de sélectionner plus d'articles que le stock réel.", table_cell_style)],
        [Paragraph("<b>5. Coordonnées</b>", table_cell_bold), Paragraph("Nom complet, numéro de téléphone WhatsApp obligatoire, email, mention entreprise éventuelle et consignes spécifiques.", table_cell_style), Paragraph("Sauvegarde continue du brouillon dans le navigateur (le client ne perd jamais sa saisie en cas de fermeture accidentelle).", table_cell_style)],
        [Paragraph("<b>6. Récapitulatif</b>", table_cell_bold), Paragraph("Synthèse complète : Nourriture + Matériel + Prestations + Frais de livraison selon la ville - Remise = <b>Total Estimé (MAD)</b>.", table_cell_style), Paragraph("Calcul automatique de l'acompte de confirmation (30%). Affichage du bouton géant WhatsApp.", table_cell_style)]
    ]
    t_stepper = Table(stepper_table, colWidths=[90, 240, 185])
    t_stepper.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_stepper)

    story.append(Spacer(1, 12))

    story.append(Paragraph("2.3 L'Intégration et Transmission WhatsApp (0705782737)", h2_style))
    story.append(Paragraph(
        "Lors de la validation de l'étape 6 :",
        body_style
    ))
    story.append(Paragraph("1. La demande est immédiatement enregistrée dans la base de données avec son statut <code>Nouveau</code> et son code unique <code>ELH-2026-NNNNN</code>.", bullet_style))
    story.append(Paragraph("2. Le système ouvre automatiquement WhatsApp (l'application sur smartphone ou WhatsApp Web sur ordinateur) sur le numéro officiel <b>+212 705 782 737</b>.", bullet_style))
    story.append(Paragraph("3. Le message est <b>intégralement pré-rédigé</b> : référence, nom, téléphone, date, convives, formule, matériel choisi et montant estimé.", bullet_style))
    story.append(Paragraph("4. Le client n'a plus qu'à cliquer sur 'Envoyer' pour amorcer l'échange personnalisé avec votre conseiller.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # SUITE CHAPITRE 2 : ESPACE SUIVI
    # =========================================================================
    story.append(Paragraph("2.4 L'Espace Suivi de Devis sans Création de Compte", h2_style))
    story.append(Paragraph(
        "Pour éliminer toute friction, vos clients n'ont pas besoin de mot de passe. Ils accèdent à leur dossier via la page <b>'Suivi de Devis'</b> (<code>/suivi</code>) "
        "en saisissant simplement leur référence unique (ex : <code>ELH-2026-00042</code>) et leur numéro de téléphone :",
        body_style
    ))

    story.append(Paragraph("<b>Ce que le client peut faire sur son espace de suivi :</b>", body_style))
    story.append(Paragraph("• <b>Visualiser la timeline d'avancement :</b> Frise chronologique visuelle indiquant l'état du dossier (*1. Demande reçue → 2. Devis chiffré → 3. Acompte & Confirmé → 4. En préparation → 5. Réception réussie*).", bullet_style))
    story.append(Paragraph("• <b>Accepter le devis officiel :</b> Dès que l'administrateur a envoyé le devis officiel, un bouton 'Accepter le devis' permet au client de confirmer son accord en ligne.", bullet_style))
    story.append(Paragraph("• <b>Demander une modification :</b> Une boîte de dialogue permet au client de formuler un ajustement (ex: 'ajouter 20 invités', 'remplacer le tajine') qui est aussitôt consigné dans les notes du dossier.", bullet_style))
    story.append(Paragraph("• <b>Télécharger le devis PDF officiel :</b> Généré en direct par le serveur avec entête royal, coordonnées, tableau chiffré et conditions de vente.", bullet_style))
    story.append(Paragraph("• <b>Bouton WhatsApp direct :</b> Ouvre un échange WhatsApp mentionnant automatiquement la référence du dossier.", bullet_style))

    story.append(Spacer(1, 15))

    # =========================================================================
    # CHAPITRE 3 : GUIDE D'ADMINISTRATION
    # =========================================================================
    story.append(Paragraph("CHAPITRE 3 : GUIDE DE GESTION & PILOTAGE (BACK-OFFICE)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_SAFRAN, spaceAfter=12))

    story.append(Paragraph("3.1 Accès Sécurisé & Rôles Utilisateurs", h2_style))
    story.append(Paragraph(
        "Le Back-Office est accessible sur <code>/admin/login</code>. Il est protégé par une authentification par jetons JWT sécurisés et gère deux niveaux d'accès (RBAC) :",
        body_style
    ))

    roles_table = [
        [Paragraph("<b>Rôle</b>", table_header_style), Paragraph("<b>Identifiants Démo</b>", table_header_style), Paragraph("<b>Droits et Périmètre</b>", table_header_style)],
        [Paragraph("<b>Administrateur</b>", table_cell_bold), Paragraph("<code>admin@elhabchitraiteur.ma</code><br/>Mot de passe : <code>Admin1234!</code>", table_cell_style), Paragraph("<b>Accès total :</b> Validation finale des devis, confirmation officielle, encaissement des acomptes/soldes, suppression, gestion du stock, CRUD des menus, blocage des dates et configuration système.", table_cell_style)],
        [Paragraph("<b>Staff (Équipe)</b>", table_cell_bold), Paragraph("<code>staff@elhabchitraiteur.ma</code><br/>Mot de passe : <code>Staff1234!</code>", table_cell_style), Paragraph("<b>Opérations courantes :</b> Consultation des réservations, passage de 'Nouveau' à 'Devis envoyé', ajout de consignes staff, saisie d'appels téléphoniques, mouvements de stock (casse/réparation) et calendrier.", table_cell_style)]
    ]
    t_roles = Table(roles_table, colWidths=[110, 185, 220])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_roles)

    story.append(Spacer(1, 12))

    story.append(Paragraph("3.2 Le Tableau de Bord Exécutif (Dashboard)", h2_style))
    story.append(Paragraph(
        "Dès votre connexion à l'espace administrateur (<code>/admin</code>), le tableau de bord affiche vos indicateurs clés de performance (KPIs) en temps réel :",
        body_style
    ))
    story.append(Paragraph("• <b>Nouvelles demandes :</b> Compteur des devis récents en attente de traitement commercial.", bullet_style))
    story.append(Paragraph("• <b>Événements des 30 prochains jours :</b> Nombre de réceptions confirmées nécessitant une préparation logistique.", bullet_style))
    story.append(Paragraph("• <b>Chiffre d'Affaires Confirmé & Encaissé :</b> Total des montants des réceptions confirmées et détail des acomptes déjà en caisse.", bullet_style))
    story.append(Paragraph("• <b>Alertes Stock Matériel :</b> Liste prioritaire des tentes, tables ou couverts dont la quantité disponible est inférieure au seuil critique.", bullet_style))
    story.append(Paragraph("• <b>Prochains Événements :</b> Liste rapide des 5 réceptions imminentes avec date, nombre d'invités, ville et lien vers la fiche détaillée.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # SUITE CHAPITRE 3 : RÉSERVATIONS ET STOCK
    # =========================================================================
    story.append(Paragraph("3.3 Traiter et Piloter les Réservations", h2_style))
    story.append(Paragraph(
        "La page <b>'Réservations & Devis'</b> (<code>/admin/reservations</code>) est le cœur de votre exploitation quotidienne :",
        body_style
    ))

    story.append(Paragraph("<b>1. Filtres et Recherche Instantanée :</b>", body_style))
    story.append(Paragraph("Filtrez par statut (*Nouveau, Devis envoyé, Confirmé, En préparation, Réalisé, Annulé*), par type d'événement ou tapez le nom du client, son téléphone ou son code de suivi.", bullet_style))

    story.append(Paragraph("<b>2. Fiche Dossier Interactive (Tiroir Latéral) :</b>", body_style))
    story.append(Paragraph("En cliquant sur 'Gérer', un panneau complet s'ouvre pour consulter et agir :", body_style))
    story.append(Paragraph("• <b>Changement de statut :</b> Modifiez le statut selon l'avancement. Si vous passez à 'Confirmé', le système s'assure qu'un acompte a bien été versé.", bullet_style))
    story.append(Paragraph("• <b>Encaisser un acompte ou solde :</b> Cliquez sur '+ Encaisser paiement', renseignez le montant (MAD), le mode (Virement, Espèces, Chèque, TPE) et la référence. Le solde restant dû est recalculé automatiquement.", bullet_style))
    story.append(Paragraph("• <b>WhatsApp Client en 1 clic :</b> Ouvre une conversation avec le numéro du client contenant un message de réponse pré-rédigé.", bullet_style))
    story.append(Paragraph("• <b>Notes internes & traçabilité :</b> Laissez des instructions pour votre brigade (ex : 'Attention, les mariés demandent une nappe blanche supplémentaire'). L'auteur et l'heure sont tracés.", bullet_style))
    story.append(Paragraph("• <b>Télécharger / Imprimer le Devis PDF :</b> Génère le document officiel pour envoi par email ou signature papier.", bullet_style))

    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>3. Saisie d'une Réservation Téléphonique (US A-07) :</b>", body_style))
    story.append(Paragraph(
        "Si un client vous contacte par téléphone ou se présente à votre agence, cliquez sur le bouton <b>'Saisie Téléphonique / Manuelle'</b>. "
        "Vous pourrez enregistrer son nom, téléphone, date, formule et prix convenu. Un code de suivi officiel lui sera automatiquement attribué.",
        body_style
    ))

    story.append(Spacer(1, 10))

    story.append(Paragraph("3.4 Gestion du Stock de Matériel & Alertes (Equipment)", h2_style))
    story.append(Paragraph(
        "La gestion du matériel (<code>/admin/materiel</code>) prévient les pénuries et garantit la réussite de vos installations :",
        body_style
    ))

    stock_flow = [
        [Paragraph("<b>Colonne</b>", table_header_style), Paragraph("<b>Signification</b>", table_header_style), Paragraph("<b>Formule / Règle Métier</b>", table_header_style)],
        [Paragraph("<b>Total en Stock</b>", table_cell_bold), Paragraph("Patrimoine complet possédé par Elhabchi Traiteur.", table_cell_style), Paragraph("Augmente lors d'un nouvel achat.", table_cell_style)],
        [Paragraph("<b>Hors Service</b>", table_cell_bold), Paragraph("Matériel cassé, endommagé ou en réparation atelier.", table_cell_style), Paragraph("Exclu automatiquement des disponibilités à la location.", table_cell_style)],
        [Paragraph("<b>Disponible</b>", table_cell_bold), Paragraph("Quantité réelle pouvant être louée pour une date donnée.", table_cell_style), Paragraph("<b>Disponible = Total - Hors Service - Réservé</b>", table_cell_style)],
        [Paragraph("<b>Seuil d'Alerte</b>", table_cell_bold), Paragraph("Niveau minimal de sécurité configuré par article.", table_cell_style), Paragraph("Dès que le disponible ≤ seuil, une alerte rouge s'active sur le Dashboard.", table_cell_style)]
    ]
    t_stock = Table(stock_flow, colWidths=[100, 195, 220])
    t_stock.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_stock)

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Enregistrer une Casse, Réparation ou Achat :</b>", body_style))
    story.append(Paragraph("Pour chaque article, l'icône de flèches vous permet d'enregistrer un <b>Ajustement de stock</b> : choisissez la nature (*Casse, Réparation, Nouvel achat, Perte*) et inscrivez le motif. Tout mouvement est historisé avec le nom de l'auteur.", body_style))

    story.append(PageBreak())

    # =========================================================================
    # SUITE CHAPITRE 3 : MENUS, PLANNING ET PARAMÈTRES
    # =========================================================================
    story.append(Paragraph("3.5 Gestion de la Carte Gastronomique & Formules", h2_style))
    story.append(Paragraph(
        "Depuis l'onglet <b>'Menus & Prestations'</b> (<code>/admin/menus</code>) :",
        body_style
    ))
    story.append(Paragraph("• <b>Plats & Mets :</b> Ajoutez ou modifiez des plats avec intitulé en français et en arabe, catégorie (*Entrée, Plat, Méchoui, Pâtisserie, Boisson*), style culinaire (*Traditionnel, Moderne, Fusion*), mode de facturation (*par personne* ou *au plat*) et allergènes.", bullet_style))
    story.append(Paragraph("• <b>Formules d'Apparat :</b> Ajustez les tarifs par personne des formules maîtresses, ainsi que les jauges minimale et maximale de convives.", bullet_style))
    story.append(Paragraph("• <b>Services & Animation :</b> Gérez les tarifs des maîtres d'hôtel, orchestres andalous et mises en place.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("3.6 Planning Mensuel & Calendrier des Réceptions", h2_style))
    story.append(Paragraph(
        "La page <b>'Planning & Calendrier'</b> (<code>/admin/calendrier</code>) offre une visualisation mensuelle complète :",
        body_style
    ))
    story.append(Paragraph("• Visualisez instantanément les dates chargées (pastille dorée et noms des réceptions dans les cases du calendrier).", bullet_style))
    story.append(Paragraph("• Cliquez sur n'importe quel jour pour afficher la liste des événements prévus, le nombre de convives et accéder à la fiche complète.", bullet_style))
    story.append(Paragraph("• Idéal pour organiser vos brigades de cuisine, assigner les maîtres d'hôtel et planifier le départ des camions de matériel.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("3.7 Paramétrage Métier & Dates Bloquées", h2_style))
    story.append(Paragraph(
        "Sur la page <b>'Paramètres & Règles'</b> (<code>/admin/parametres</code>), vous pouvez ajuster les règles de l'entreprise sans toucher au code :",
        body_style
    ))

    settings_table = [
        [Paragraph("<b>Paramètre</b>", table_header_style), Paragraph("<b>Valeur Actuelle</b>", table_header_style), Paragraph("<b>Utilité & Impact</b>", table_header_style)],
        [Paragraph("<b>Numéro WhatsApp</b>", table_cell_bold), Paragraph("<code>212705782737</code>", table_cell_style), Paragraph("Numéro officiel recevant toutes les demandes de devis générées par le simulateur.", table_cell_style)],
        [Paragraph("<b>Préavis Minimum</b>", table_cell_bold), Paragraph("<code>7 jours</code>", table_cell_style), Paragraph("Délai incompressible en ligne pour garantir les approvisionnements frais.", table_cell_style)],
        [Paragraph("<b>Taux d'Acompte</b>", table_cell_bold), Paragraph("<code>30 %</code>", table_cell_style), Paragraph("Pourcentage calculé automatiquement pour valider et confirmer un dossier.", table_cell_style)],
        [Paragraph("<b>Capacité Max / Jour</b>", table_cell_bold), Paragraph("<code>3 événements</code>", table_cell_style), Paragraph("Limite de réceptions simultanées pour préserver la qualité de service d'apparat.", table_cell_style)],
        [Paragraph("<b>Dates Bloquées</b>", table_cell_bold), Paragraph("Calendrier modifiable", table_cell_style), Paragraph("Permet de bloquer des dates spécifiques (congés de l'Aïd, réceptions complètes). La date apparaît aussitôt indisponible sur le simulateur.", table_cell_style)]
    ]
    t_settings = Table(settings_table, colWidths=[120, 115, 280])
    t_settings.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_settings)

    story.append(PageBreak())

    # =========================================================================
    # CHAPITRE 4 : GUIDE PRATIQUE & DÉMARRAGE RAPIDE
    # =========================================================================
    story.append(Paragraph("CHAPITRE 4 : GUIDE PRATIQUE & DÉMARRAGE RAPIDE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_SAFRAN, spaceAfter=12))

    story.append(Paragraph("4.1 Installer et Démarrer le Projet sur un Autre Ordinateur", h2_style))
    story.append(Paragraph(
        "Si vous souhaitez installer l'application sur un nouvel ordinateur (Windows, Mac ou Linux), suivez ces 3 étapes simples :",
        body_style
    ))

    story.append(Paragraph("<b>Étape 1 : Prérequis système</b><br/>"
                           "• Installer <b>Node.js</b> (version 18 ou 20 LTS depuis <code>nodejs.org</code>).<br/>"
                           "• S'assurer que <b>MongoDB</b> est actif en local (ou utiliser un compte gratuit MongoDB Atlas).", bullet_style))

    story.append(Paragraph("<b>Étape 2 : Préparer l'environnement</b><br/>"
                           "Ouvrez un terminal dans le dossier <code>traiteur</code> et copiez le fichier d'environnement :<br/>"
                           "<code>Copy-Item server\\.env.example server\\.env</code> (sur Windows)<br/>"
                           "Puis installez et initialisez les données :<br/>"
                           "<code>npm run seed</code> (insère tous les plats, formules, matériel et utilisateurs de démonstration)", bullet_style))

    story.append(Paragraph("<b>Étape 3 : Lancer l'application</b><br/>"
                           "Tapez simplement la commande racine :<br/>"
                           "<code>npm run dev</code><br/>"
                           "Le script universel <code>dev.js</code> démarre automatiquement le serveur sur le port 5000 et l'interface sur le port 5173.", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("4.2 Tableau Récapitulatif des Accès & URLs", h2_style))
    
    urls_table = [
        [Paragraph("<b>Espace</b>", table_header_style), Paragraph("<b>Adresse Web (URL)</b>", table_header_style), Paragraph("<b>Identifiants de Connexion</b>", table_header_style)],
        [Paragraph("<b>Vitrine Publique</b>", table_cell_bold), Paragraph("<code>http://localhost:5173</code>", table_cell_style), Paragraph("Accès libre tous visiteurs", table_cell_style)],
        [Paragraph("<b>Simulateur de Devis</b>", table_cell_bold), Paragraph("<code>http://localhost:5173/reserver</code>", table_cell_style), Paragraph("Accès libre (crée un code ELH-AAAA-NNNNN)", table_cell_style)],
        [Paragraph("<b>Suivi Client</b>", table_cell_bold), Paragraph("<code>http://localhost:5173/suivi</code>", table_cell_style), Paragraph("Code de suivi + Numéro de téléphone", table_cell_style)],
        [Paragraph("<b>Connexion Pro</b>", table_cell_bold), Paragraph("<code>http://localhost:5173/admin/login</code>", table_cell_style), Paragraph("Redirige vers le tableau de bord", table_cell_style)],
        [Paragraph("<b>Compte Admin</b>", table_cell_bold), Paragraph("<code>admin@elhabchitraiteur.ma</code>", table_cell_style), Paragraph("Mot de passe : <code>Admin1234!</code>", table_cell_style)],
        [Paragraph("<b>Compte Staff</b>", table_cell_bold), Paragraph("<code>staff@elhabchitraiteur.ma</code>", table_cell_style), Paragraph("Mot de passe : <code>Staff1234!</code>", table_cell_style)],
        [Paragraph("<b>API REST Backend</b>", table_cell_bold), Paragraph("<code>http://localhost:5000/api/v1</code>", table_cell_style), Paragraph("Documentation et endpoints système", table_cell_style)]
    ]
    t_urls = Table(urls_table, colWidths=[110, 195, 210])
    t_urls.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ZELLIGE),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_CREME]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_urls)

    story.append(Spacer(1, 10))

    story.append(Paragraph("4.3 Résolution des Problèmes Fréquents (FAQ Technique)", h2_style))
    faq_box = [
        [Paragraph("<b>Question : Que faire si le port 5173 ou 5000 est indiqué déjà utilisé ?</b><br/>"
                   "<b>Réponse :</b> Fermez les anciens terminaux ou tapez dans PowerShell : <code>Get-Process node | Stop-Process -Force</code> puis relancez <code>npm run dev</code>.<br/><br/>"
                   "<b>Question : Comment tester rapidement que toutes les fonctionnalités marchent ?</b><br/>"
                   "<b>Réponse :</b> Exécutez la suite de tests automatisés : <code>node server/test/test-scenarios.js</code>. Elle vérifie 14 scénarios critiques (calculs, WhatsApp, RBAC, suivi) et doit afficher 14/14 passés.<br/><br/>"
                   "<b>Question : Comment changer le logo ou les coordonnées de l'entreprise ?</b><br/>"
                   "<b>Réponse :</b> Directement dans l'interface d'administration sous <i>Paramètres</i>, ou dans le fichier <code>server/.env</code>.", tip_style)]
    ]
    t_faq = Table(faq_box, colWidths=[515])
    t_faq.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_SABLE),
        ('BOX', (0,0), (-1,-1), 1, COLOR_SAFRAN),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_faq)

    story.append(Spacer(1, 20))

    # Signature de fin
    fin_text = Paragraph("<font size=8 color='#5A6662'><i>Document généré pour Elhabchi Traiteur d'Apparat · Version 1.0 · Tous droits réservés.</i></font>", ParagraphStyle('F1', alignment=1))
    story.append(fin_text)

    # Construction du document avec NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Guide PDF généré avec succès : {filename}")

if __name__ == '__main__':
    filename = "Guide_Complet_Elhabchi_Traiteur.pdf"
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    build_guide_pdf(filename)
