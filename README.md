# Mchichat

## Projet Web Full Stack

Mchichat est une application web full stack moderne de communication et de réseau social développée dans le cadre du module de conception.

Le projet combine :
- une authentification sécurisée,
- une messagerie temps réel,
- des salons publics et privés,
- des conversations privées,
- un système d’amis,
- un fil de publications,
- le partage de médias,
- les messages vocaux,
- les profils personnalisables,
- les notifications temps réel,
- des API externes,
- un mode clair / sombre.

---

## Encadrement pédagogique

Projet réalisé dans le cadre du module de conception.

### Encadrants

- M. Clément Fasquel
- M. Axel Soupé

---

## Auteurs

- Touhaf Aya
- Douimia Abdelmoughit

---

## Technologies utilisées

### Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Axios
- React Router DOM
- Socket.IO Client
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- Socket.IO
- JWT Authentication
- Multer
- Fluent FFmpeg
- FFmpeg Static
- Zod
- Helmet
- CORS
- Express Rate Limit

---

## Fonctionnalités principales

### Authentification

- Inscription
- Connexion sécurisée avec JWT
- Récupération de l’utilisateur connecté
- Protection des routes
- Gestion du token côté frontend

### Profils utilisateurs

- Consultation du profil
- Avatar personnalisé
- Bannière personnalisée
- Bio
- Modification du profil
- Suppression du compte

### Système d’amis

- Recherche d’utilisateurs
- Envoi de demande d’ami
- Acceptation ou refus des demandes
- Suppression d’un ami
- Notifications temps réel liées aux demandes d’amis

### Salons

- Création de salons publics ou privés
- Modification d’un salon
- Suppression d’un salon
- Liste des membres
- Invitations aux salons privés
- Demandes d’adhésion aux salons publics
- Acceptation ou refus des demandes d’adhésion

### Messages dans les salons

- Envoi de messages texte
- Envoi de fichiers
- Envoi d’images
- Envoi de vidéos
- Envoi de GIFs
- Envoi de messages vocaux
- Modification de messages
- Suppression de messages
- Réception temps réel avec Socket.IO

### Conversations privées

- Création d’une conversation privée entre amis
- Messages privés en temps réel
- Envoi de texte
- Envoi de fichiers
- Envoi de GIFs
- Envoi de messages vocaux
- Modification de messages privés
- Suppression de messages privés

### Publications sociales

- Création de posts
- Ajout d’image ou vidéo
- Modification de posts
- Suppression de posts
- Likes
- Commentaires
- Commentaires avec GIFs
- Fil d’actualité social

### Médias et audio

- Upload de fichiers avec Multer
- Upload d’avatars et bannières
- Upload de médias de posts
- Upload de pièces jointes dans les messages
- Enregistrement vocal côté navigateur
- Visualisation des fréquences pendant l’enregistrement
- Player audio personnalisé
- Conversion audio serveur avec FFmpeg
- Compatibilité tous les browser

### API externes

- Giphy API pour les GIFs
- NewsData.io pour les actualités
- Open-Meteo / géolocalisation inverse pour la météo

### Interface utilisateur

- Interface responsive
- Mode clair / sombre
- Notifications visuelles
- Navigation protégée
- Design avec TailwindCSS

---

## Architecture du projet

```txt

backend/
   ├── prisma/
   │
   ├── src/
   │   ├── config/
   │   ├── lib/
   │   ├── middlewares/
   │   ├── modules/
   │   │   ├── auth/
   │   │   ├── friends/
   │   │   ├── giphy/
   │   │   ├── messages/
   │   │   ├── news/
   │   │   ├── posts/
   │   │   ├── private-messages/
   │   │   ├── profiles/
   │   │   ├── salon-invitations/
   │   │   ├── salons/
   │   │   └── weather/
   │   │
   │   ├── routes/
   │   ├── types/
   │   ├── utils/
   │   ├── app.ts
   │   └── server.ts
```
Le backend suit une architecture modulaire organisée par :
controllers,
services,
routes,
schemas.

```txt
frontend/
   ├── public/
   │
   ├── src/
   │   ├── app/
   │   │
   │   ├── assets/
   │   │
   │   ├── components/
   │   │   ├── layout/
   │   │   │
   │   │   └── ui/
   │   │
   │   ├── features/
   │   │   ├── auth/
   │   │   │
   │   │   ├── feed/
   │   │   │
   │   │   ├── friends/
   │   │   │
   │   │   ├── giphy/
   │   │   │
   │   │   ├── messages/
   │   │   │
   │   │   ├── news/
   │   │   │
   │   │   ├── notifications/
   │   │   │
   │   │   ├── private-messages/
   │   │   │
   │   │   ├── profiles/
   │   │   │
   │   │   ├── salon-invitations/
   │   │   │
   │   │   ├── salons/
   │   │   │
   │   │   ├── theme/
   │   │   │
   │   │   ├── voice/
   │   │   │
   │   │   └── weather/
   │   │
   │   ├── lib/
   │   │
   │   ├── pages/
   │   │
   │   ├── App.css
   │   ├── App.tsx
   │   ├── index.css
   │   ├── main.tsx
   │   └── vite-env.d.ts

````
Le frontend suit une architecture feature-based

---

## Base de données

Le projet utilise MySQL avec Prisma ORM.

### Principaux modèles Prisma

* User
* Salon
* SalonMember
* Message
* Friendship
* PrivateConversation
* PrivateConversationParticipant
* PrivateMessage
* SalonInvitation
* SalonMembershipRequest
* Post
* PostLike
* PostComment

---

## Installation du projet

### Prérequis

Avant de commencer, installer :

* Node.js
* npm
* MySQL
* FFmpeg
* Git

---

## 1. Cloner le dépôt

```bash
git clone https://gitlab.dpt-info.univ-littoral.fr/touhaf.aya/mchichat.git
cd mchichat
```

---

## 2. Créer la base de données MySQL

Se connecter à MySQL :

```bash
mysql -u root -p
```

Créer la base de données principale :

```sql
CREATE DATABASE mchichat;
```

Créer la base de données shadow utilisée par Prisma :

```sql
CREATE DATABASE mchichat_shadow;
```

---

# Installation Backend

## 1. Accéder au backend

```bash
cd backend
```

## 2. Installer les dépendances

```bash
npm install
```

## 3. Installer Socket.IO côté backend

```bash
npm install socket.io
```

## 4. Installer Multer pour les uploads

```bash
npm install multer
npm install -D @types/multer
```

## 5. Installer Fluent FFmpeg

```bash
npm install fluent-ffmpeg
npm install -D @types/fluent-ffmpeg
```

## 6. Installer FFmpeg Static

```bash
npm install ffmpeg-static
```

## 7. Corriger les vulnérabilités npm si nécessaire

```bash
npm audit fix
```

---

## Installation de FFmpeg sur la machine

Même si le projet utilise `ffmpeg-static`, il est recommandé d’avoir FFmpeg installé sur la machine.

### macOS

```bash
brew install ffmpeg
```

### Linux / Ubuntu

```bash
sudo apt update
sudo apt install ffmpeg
```

### Windows

Télécharger FFmpeg depuis le site officiel :

```txt
https://ffmpeg.org/download.html
```

Puis ajouter FFmpeg au PATH système.

---

## Configuration Backend

Créer un fichier `.env` dans le dossier `backend` :

```env
PORT=5000

NODE_ENV=development

DATABASE_URL="mysql://root:password@localhost:3306/mchichat"

SHADOW_DATABASE_URL="mysql://root:password@localhost:3306/mchichat_shadow"

JWT_ACCESS_SECRET="ton_ACCESS_SECRET"

JWT_EXPIRES_IN="1d"

CORS_ORIGIN="http://localhost:5173"

GIPHY_API_KEY="ta_giphy_api_key"

NEWSDATA_API_KEY="ta_newsdata_api_key"
```

### Générer un secret JWT robuste

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Prisma

### Générer Prisma Client

```bash
npx prisma generate
```

### Lancer les migrations

```bash
npx prisma migrate dev
```

### Réinitialiser la base de données en cas de besoin

```bash
npx prisma migrate reset
```

---

## Lancer le backend

```bash
npm run dev
```

Le backend sera disponible sur :

```txt
http://localhost:5000
```

Endpoint de test :

```txt
http://localhost:5000/api/v1/health
```

---

# Installation Frontend

## 1. Accéder au frontend

```bash
cd frontend
```

Si vous êtes dans le dossier backend :

```bash
cd ../frontend
```

## 2. Installer les dépendances

```bash
npm install
```

## 3. Installer Socket.IO côté frontend

```bash
npm install socket.io-client
```

## 4. Corriger les vulnérabilités npm si nécessaire

```bash
npm audit fix
```

---

## Configuration Frontend

Créer un fichier `.env` dans le dossier `frontend` :

```env
VITE_API_BASE_URL="http://localhost:5000/api/v1"

VITE_SOCKET_URL="http://localhost:5000"
```

---

## Lancer le frontend

```bash
npm run dev
```

Le frontend sera disponible sur :

```txt
http://localhost:5173
```

---

# Scripts disponibles

## Backend

```bash
npm run dev
```

les commandes suivantes peuvent aussi être utilisées :

```bash
npm run build
npm run start
```

## Frontend

```bash
npm run dev
npm run build
npm run preview
```

---

# Utilisation générale

1. Lancer MySQL.
2. Lancer le backend :

```bash
cd backend
npm run dev
```

3. Lancer le frontend dans un deuxième terminal :

```bash
cd frontend
npm run dev
```

4. Ouvrir l’application :

```txt
http://localhost:5173
```

---

# Sécurité

Le projet inclut plusieurs mécanismes de sécurité :

* Authentification JWT
* Middleware de protection des routes
* Validation des données avec Zod
* CORS configuré
* Helmet
* Rate limiting
* Vérification des permissions utilisateur
* Contrôle des accès aux salons privés
* Contrôle des auteurs pour modifier ou supprimer messages/posts

---

# Temps réel

Socket.IO est utilisé pour :

* réception des messages de salon,
* réception des messages privés,
* notifications de demandes d’amis,
* notifications d’invitations aux salons,
* notifications de likes,
* notifications de commentaires,
* demandes d’adhésion aux salons.

---

# Gestion des uploads

Les fichiers sont stockés dans le dossier :

```txt
backend/uploads/
```

Types d’uploads présents dans le projet :

```txt
backend/uploads/messages/
backend/uploads/posts/
backend/uploads/profiles/
```

Les uploads sont gérés avec Multer.

---

# Gestion audio

Le projet gère les messages vocaux avec :

* MediaRecorder côté frontend,
* visualisation des fréquences,
* création d’un fichier audio,
* upload vers le backend,
* conversion avec Fluent FFmpeg,
* lecture avec un player personnalisé.

Cette logique permet une meilleure compatibilité entre les browsers.

---

# API externes utilisées

## Giphy

Utilisée pour rechercher et envoyer des GIFs.

## NewsData.io

Utilisée pour afficher des actualités dans le fil.

## Open-Meteo

Utilisée pour afficher la météo locale.

---

# Fonctionnalités avancées réalisées

* Application full stack complète
* Architecture modulaire backend
* Architecture feature-based frontend
* Authentification JWT
* Messagerie temps réel
* Conversations privées
* Salons publics et privés
* Upload multimédia
* Messages vocaux
* Conversion audio
* Feed social
* Profils personnalisés
* Système d’amis
* Notifications temps réel
* Light / Dark mode
* APIs externes
* Prisma ORM avec MySQL

---

# Conclusion

Mchichat est une application web full stack complète mettant en œuvre des notions avancées de conception web.

Le projet démontre la maîtrise :

* du frontend React avec TypeScript,
* du backend Express avec TypeScript,
* de la base de données relationnelle avec Prisma et MySQL,
* de la communication temps réel avec Socket.IO,
* de la gestion des fichiers multimédias,
* de l’authentification sécurisée,
* et de l’intégration d’API externes.

