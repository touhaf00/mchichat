# Mchichat

## Equipe

* Touhaf Aya
* Douimia Abdelmoughit

### Encadrement pédagogique

Projet réalisé dans le cadre du module **Conception-Web Services**.

Encadrants :

* M. Clément Fasquel
* M. Axel Soupé

---

# Présentation du projet

Mchichat est une application web fullstack de communication et de réseau social développée dans le cadre du module Conception-Web Services .

Le nom est inspiré du dialecte marocain, qui signifie chats.

L'objectif du projet est de proposer une plateforme permettant aux utilisateurs de :

* créer un compte ;
* personnaliser leur profil ;
* publier du contenu ;
* rejoindre ou créer des salons ;
* communiquer via une messagerie privée ;
* ajouter des amis ;
* partager des images, fichiers et messages vocaux ;
* consulter les actualités mondiales ;
* consulter les informations météorologiques.

Le projet s'inspire des fonctionnalités présentes dans plusieurs plateformes modernes de communication et de réseaux sociaux.

## Fonctionnalités principales

### Administration
Une interface d'administration permet la gestion des utilisateurs, des rôles et des statistiques de la plateforme.

* Tableau de bord administrateur
* Gestion des utilisateurs
* Attribution et retrait des rôles administrateur
* Suppression de comptes utilisateurs
* Statistiques globales de la plateforme

### Authentification

* Inscription
* Connexion
* Déconnexion
* Authentification JWT
* Refresh Token sécurisé
* Protection des routes privées
* Gestion des rôles utilisateur et administrateur

### Gestion du profil

* Modification du profil
* Avatar personnalisé
* Bannière personnalisée
* Biographie
* Suppression du compte

### Réseau social

* Création de publications
* Modification de publications
* Suppression de publications
* Likes
* Commentaires

### Gestion des amis

* Envoi de demandes d'amis
* Acceptation de demandes
* Suppression d'amis

### Salons

* Création de salons
* Modification de salons
* Suppression de salons
* Gestion des membres

### Messagerie

* Messages de salon
* Messages privés
* Modification de messages
* Suppression de messages

### Médias

* Images
* Fichiers
* Messages vocaux

### APIs externes

* Actualités mondiales via NewsData.io
* GIFs via Giphy
* Informations météorologiques via Open-Meteo

### Interface

* Responsive design
* Mode clair
* Mode sombre

### Documentation API

* Documentation Swagger interactive
* Test des endpoints directement depuis le navigateur
* Authentification JWT via Swagger

---

# Technologies utilisées

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* React Router DOM
* Axios
* Socket.IO Client

### Pourquoi ce choix ?

React offre une architecture moderne basée sur les composants et permet de construire une interface dynamique et réactive.

TypeScript apporte un typage fort permettant de réduire les erreurs de développement.

TailwindCSS permet de construire rapidement une interface moderne tout en conservant une bonne maintenabilité.

---

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* Prisma Client
* Cookie-parser
* Socket.IO
* JWT
* Zod
* Multer
* Helmet
* Express Rate Limit
* Fluent FFmpeg
* FFmpeg Static
* Swagger UI Express
* Swagger JSDoc
* Bcrypt
* Cookie Parser
* CORS
* Cloudinary

### Pourquoi ce choix ?

Express est un framework léger permettant de développer rapidement des APIs REST.

Prisma simplifie l'accès à la base de données tout en apportant un typage fort.

Socket.IO permet la communication temps réel entre les utilisateurs.

JWT facilite la sécurisation des routes de l'application.

---

## Base de données

* MySQL 8

### Hébergement de la base

* Aiven MySQL Cloud

---

## Hébergement

### Frontend

* Netlify

### Backend

* Render

### Base de données

* Aiven

---

# Gestion de projet

## Outils utilisés

* Git
* GitHub
* WebStorm
* Prisma Studio
* MySQL
* Netlify
* Render
* Aiven

Le projet a été développé de manière incrémentale avec l'utilisation régulière de commits Git permettant le suivi des différentes fonctionnalités développées.

---

# Expérience générale

Avant ce projet, l'équipe possédait des connaissances en :

* HTML
* CSS
* JavaScript
* React
* SQL

Ce projet a permis d'approfondir :

* TypeScript
* Express
* Prisma
* JWT
* Socket.IO
* APIs REST
* Hébergement Cloud
* Gestion des médias
* Architecture Full Stack

Nous continuerons probablement à utiliser React, TypeScript, Express et Prisma dans nos futurs projets en raison de leur simplicité d'utilisation et de leur efficacité.

---

# Installation

## Système recommandé

Le projet fonctionne sous :

* Windows
* Linux
* macOS

Linux ou macOS sont recommandés pour une meilleure compatibilité avec FFmpeg.

---

## Prérequis

Installer :

* Node.js
* npm
* Git
* MySQL
* FFmpeg

Le projet peut fonctionner soit avec une base MySQL locale,
soit avec une base MySQL hébergée sur Aiven.

---

## Clonage du projet

```bash
git clone https://gitlab.dpt-info.univ-littoral.fr/touhaf.aya/mchichat
cd mchichat
```

---

## Installation du Backend

```bash
cd backend
npm install
```

Installation des dépendances utilisées durant le projet :

```bash
npm install socket.io
npm install multer
npm install ffmpeg-static
npm install fluent-ffmpeg
npm install -D @types/multer @types/fluent-ffmpeg
npm audit fix
```

Créer un fichier `.env`.

Exemple :

```env
PORT=5000

DATABASE_URL="mysql://root:password@localhost:3306/mchichat"

SHADOW_DATABASE_URL="mysql://root:password@localhost:3306/mchichat_shadow"

JWT_ACCESS_SECRET="ton_secret_securisé_JWT"

JWT_ACCESS_EXPIRES_IN="15m"

JWT_REFRESH_SECRET="ton_refresh_secret_securisé"

JWT_REFRESH_EXPIRES_IN="1d"

CORS_ORIGIN="http://localhost:5173"

GIPHY_API_KEY="ta_cle_API"

NEWSDATA_API_KEY="ta_cle_API"

CLOUDINARY_CLOUD_NAME="ton_cloud_name"

CLOUDINARY_API_KEY="ta_cle_cloudinary"

CLOUDINARY_API_SECRET="ton_secret_cloudinary"
```

Créer les bases :

```sql
CREATE DATABASE mchichat;
CREATE DATABASE mchichat_shadow;
```

Initialiser Prisma :

```bash
npx prisma generate
npx prisma migrate dev
```

---

## Installation du Frontend

```bash
cd frontend
npm install
```

Installation des dépendances utilisées durant le projet :

```bash
npm install socket.io-client
npm audit fix
```

Créer un fichier `.env`.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1

VITE_SOCKET_URL=http://localhost:5000
```

---

# Utilisation

## Lancer le Backend

```bash
cd backend
npm run dev
```

API disponible sur :

```txt
http://localhost:5000
```

---

## Lancer le Frontend

```bash
cd frontend
npm run dev
```

Application disponible sur :

```txt
http://localhost:5173
```

---

## Build de production

### Backend

```bash
npm run build
npm run start
```

### Frontend

```bash
npm run build
npm run preview
```

---

# Concepts du module mis en œuvre

## Architecture client / serveur

Le projet est construit selon une architecture client / serveur :

* Frontend React responsable de l'interface utilisateur ;
* Backend Express responsable de la logique métier ;
* Base de données MySQL responsable du stockage des données ;
* Communication via API REST et Socket.IO.

## JSON

Les échanges entre le frontend et le backend utilisent exclusivement le format JSON.

## REST

L'API implémente les verbes HTTP étudiés durant le module :

* GET
* POST
* PUT
* DELETE

## Sécurité

Le projet implémente plusieurs mécanismes de sécurité :

* JWT
* Hashage des mots de passe avec bcrypt
* Validation des données avec Zod
* Helmet
* Express Rate Limit
* Refresh Tokens sécurisés
* Gestion des rôles ADMIN / USER
* Protection CORS
* Validation des types de fichiers envoyés
* Limitation de la taille des fichiers uploadés
* Protection des routes sensibles par middleware
* Protection contre les accès non autorisés aux ressources administrateur
* Cookies HTTP Only
* Validation des fichiers uploadés
* Stockage externe des médias via Cloudinary

## Temps réel

Le projet utilise Socket.IO afin de permettre :

* les notifications en temps réel ;
* la réception instantanée des messages ;
* les mises à jour automatiques des salons ;
* la synchronisation des événements entre utilisateurs.

## Documentation d'API

Le projet intègre Swagger afin de :

* documenter les endpoints ;
* tester les routes directement depuis le navigateur ;
* documenter les schémas d'entrée et de sortie.

## Consommation de services externes

Le backend consomme plusieurs APIs externes :

* NewsData.io
* Giphy
* Open-Meteo

---

# Routes d'API

Le projet dispose d'une documentation Swagger interactive.

### Documentation locale

http://localhost:5000/api-docs

### Documentation en production

https://mchichat.onrender.com/api-docs

Les principales routes sont listées ci-dessous.

## Administration

```txt
[GET] /api/v1/admin/stats
[GET] /api/v1/admin/users
[PATCH] /api/v1/admin/users/:userId/role
[DELETE] /api/v1/admin/users/:userId
```

## Authentification

```txt
[POST] /api/v1/auth/register
[POST] /api/v1/auth/login
[POST] /api/v1/auth/refresh
[POST] /api/v1/auth/logout
[GET] /api/v1/auth/me
```

## Profil

```txt
[GET] /api/v1/profiles/:username
[PUT] /api/v1/profiles/me/settings
[DELETE] /api/v1/profiles/me
```

## Amis

```txt
[GET] /api/v1/friends/search
[POST] /api/v1/friends/requests
[GET] /api/v1/friends/requests/received
[GET] /api/v1/friends/requests/sent
[PATCH] /api/v1/friends/requests/:requestId
[GET] /api/v1/friends
[DELETE] /api/v1/friends/:friendId
```

## Invitations/ demandes salons 

```txt
[POST] /api/v1/salons/:id/membership-requests
[GET] /api/v1/salons/membership-requests
[POST] /api/v1/salons/membership-requests/:requestId/accept
[POST] /api/v1/salons/membership-requests/:requestId/reject
[POST] /api/v1/salons/:id/invite
[GET] /api/v1/salon-invitations
[POST] /api/v1/salon-invitations/:id/accept
[POST] /api/v1/salon-invitations/:id/reject
```

## Salons

```txt
[GET] /api/v1/salons
[POST] /api/v1/salons
[PUT] /api/v1/salons/:id
[DELETE] /api/v1/salons/:id
```

## Messages de salon

```txt
[GET] /api/v1/messages/salon/:id
[POST] /api/v1/messages
[PATCH] /api/v1/messages/:id
[DELETE] /api/v1/messages/:id
```

## Conversations privées

```txt
[GET] /api/v1/private-conversations
[POST] /api/v1/private-conversations
[GET] /api/v1/private-conversations/:id/messages
[POST] /api/v1/private-conversations/:id/messages
[PATCH] /api/v1/private-messages/:id
[DELETE] /api/v1/private-messages/:id
```

## Publications

```txt
[GET] /api/v1/posts
[POST] /api/v1/posts
[PATCH] /api/v1/posts/:id
[DELETE] /api/v1/posts/:id
```

## Actualités

```txt
[GET] /api/v1/news
```

## Météo

```txt
[GET] /api/v1/weather
```

## GIFs

```txt
[GET] /api/v1/giphy/search?q=cat
```

---

# Déploiement

Le projet est déployé sur des services cloud avec le dépôt GitHub : https://github.com/touhaf00/mchichat.

## Frontend

Netlify

https://mchichat.netlify.app

## Backend

Render

https://mchichat.onrender.com

## Base de données

Aiven MySQL

### Stockage des médias

* Cloudinary

## Documentation API

Swagger

https://mchichat.onrender.com/api-docs

---

# Notes finales

Le projet respecte les objectifs du module Conception-Web Services :

* conception d'une API REST complète ;
* consommation des services via une interface React ;
* authentification JWT ;
* documentation Swagger ;
* consommation d'APIs externes ;
* utilisation d'une base de données relationnelle MySQL ;
* communication temps réel entre utilisateurs grâce à Socket.IO ;
* déploiement cloud complet.

Le projet est accessible en ligne :

* Frontend : https://mchichat.netlify.app
* Backend : https://mchichat.onrender.com
* Swagger : https://mchichat.onrender.com/api-docs

Mchichat a permis de mettre en pratique l'ensemble des notions abordées durant le module : REST, JSON, sécurité, architecture web moderne, APIs externes et documentation de services.

## Perspectives d'amélioration

Plusieurs évolutions sont envisageables :

* mise en place d'une modération avancée ;
* ajout des appels audio et vidéo ;
* création d'applications mobiles Android et iOS ;
* amélioration du système de notifications ;
* ajout d'un moteur de recherche global.