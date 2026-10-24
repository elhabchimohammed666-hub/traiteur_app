## License
   © 2026 Elhabchi Mohammed. All Rights Reserved.

# Elhabchi Traiteur — Application Web MERN d'Exception

> Application web MERN de présentation, réservation en ligne et gestion logistique pour un traiteur marocain haut de gamme, conforme aux 32 pages du **Cahier des Charges Elhabchi Traiteur v1.0**.

---

## 🌟 Points Forts & Architecture

- **Vitrine d'Apparat & Identité Royale** : Direction artistique marocaine prestigieuse (Vert Zellige `#0F5C4D`, Or Safran `#B8923A`, Crème Soie `#FBF5E6`), typographies nobles (Playfair Display, Amiri, Cairo, Inter), mode Sombre / Clair, et support bilingue FR / AR (RTL) / EN.
- **Simulateur de Devis & Réservation en 6 Étapes** :
  1. Nature de l'événement, date avec vérification de disponibilité en temps réel et préavis obligatoire (7 jours).
  2. Jauge d'invités (slider dynamique & calcul d'estimation des tables, vaisselle et brigade).
  3. Sélection des formules gastronomiques clés en main ou composition à la carte avec plats extras (Pastillas, Tajines, Méchouis, Cornes de gazelle, Thé à la menthe).
  4. Location de matériel (tentes caïdales, mobilier, vaisselle dorée) avec contrôle de stock en direct et prestations de service (serveurs en jabador, orchestre andalou, maîtres d'hôtel).
  5. Coordonnées du client et demandes particulières.
  6. Récapitulatif instantané, estimation chiffrée en dirhams (MAD), calcul automatique de l'acompte (30%), sauvegarde automatique du brouillon dans le navigateur, et soumission directe avec lien WhatsApp pré-rempli officiel (**0705782737** / `+212 705 782 737`).
- **Suivi de Dossier Client sans Compte** : Consultation par code unique `ELH-AAAA-NNNNN` et numéro de téléphone, timeline interactive, acceptation du devis en ligne, demande de modification, annulation et téléchargement officiel du devis en PDF.
- **Back-Office Administrateur & Staff** :
  - **Tableau de bord exécutif** : KPIs (revenus prévisionnels et encaissés, événements des 7 et 30 jours, devis en attente, alertes stocks).
  - **Gestion des réservations** : Filtres avancés, saisie téléphonique manuelle, changement de statut avec contrôle de rôle (RBAC), encaissement des acomptes/soldes, notes internes et bouton de réponse WhatsApp client instantané.
  - **Gestion du stock de matériel** : Suivi des quantités totales, réservées, hors service (casse/dégradation) et disponibles. Traçabilité complète des mouvements de stock avec motif et auteur.
  - **Catalogue culinaire** : CRUD des plats, formules composées et prestations.
  - **Calendrier & Planning** : Vue mensuelle interactive des événements pour l'organisation des brigades.
  - **Paramètres & Règles** : Configuration du numéro WhatsApp, préavis minimum, taux d'acompte, zones tarifaires et dates bloquées.

---

## 🛠️ Stack Technique

- **Frontend** : React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Context API persisté.
- **Backend** : Node.js, Express.js (Architecture MVC : Routes, Contrôleurs, Services, Modèles Mongoose).
- **Base de données** : MongoDB (Collections: `users`, `dishes`, `packages`, `services`, `equipment`, `bookings`, `stock_movements`, `blocked_dates`, `settings`, `testimonials`, `gallery`, `counters`).
- **Documents & Notifications** : PDFKit (génération de devis officiels PDF), Nodemailer (emails de confirmation client et admin), wa.me URL generator structuré.
- **Sécurité** : JWT (Access token court + Refresh token en cookie HttpOnly), Bcrypt, Helmet, CORS strict, Rate Limiting (général et protection anti-spam sur les réservations publiques).

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
# À la racine
npm install

# Serveur
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configuration d'environnement

Fichier `server/.env` :
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/elhabchi_traiteur
JWT_ACCESS_SECRET=secret
JWT_REFRESH_SECRET=secret
JWT_ACCESS_EXPIRES=secret
JWT_REFRESH_EXPIRES=secret
WHATSAPP_NUMBER=2126404404
```

### 3. Initialisation de la base de données (Seed)

Remplir la base avec les plats gastronomiques, formules de prestige, stock de matériel, comptes admin/staff et réservations de test :

```bash
npm run seed
```


### 4. Lancement de l'application

```bash
# Lancement simultané du serveur (port 5000) et du client (port 5173)
npm run dev
```


### 5. Exécution des tests de recette

```bash
npm run test:server
```
*Validation de l'ensemble des scénarios critiques (R1 à R8) : calcul de prix, génération du code de suivi, intégration WhatsApp, authentification RBAC et suivi client.*
