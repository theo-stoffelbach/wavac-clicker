# Wasac-Clicker - Backend

Ce dossier contient la partie serveur du projet Wasac-Clicker, une application de clicker inspirée du monde du travail moderne.

## Technologies

- **Node.js** et **Express** : Framework backend
- **CockroachDB** : Base de données SQL distribuée, compatible avec PostgreSQL
- **Sequelize** : ORM pour interagir avec la base de données
- **Socket.io** : Communication en temps réel pour les mises à jour de clics et de guildes
- **JWT** : Authentification des utilisateurs
- **Jest** : Tests unitaires et d'intégration

## Structure du projet

```
src/
  ├── config/          # Configuration (base de données)
  ├── controllers/     # Logique métier
  ├── middlewares/     # Middlewares Express
  ├── models/          # Modèles Sequelize
  ├── routes/          # Routes API
  ├── tests/           # Tests unitaires et d'intégration
  ├── utils/           # Fonctions utilitaires
  └── server.js        # Point d'entrée de l'application
```

## API REST

Le backend expose les API REST suivantes :

### Utilisateurs

- `POST /api/users` : Inscription
- `POST /api/users/login` : Connexion
- `GET /api/users/profile` : Profil de l'utilisateur (authentifié)
- `PUT /api/users/click` : Mise à jour du compteur de clics

### Guildes

- `GET /api/guilds` : Liste des guildes
- `GET /api/guilds/:id` : Détails d'une guilde
- `POST /api/guilds` : Création d'une guilde (authentifié)
- `PUT /api/guilds/:id` : Mise à jour d'une guilde (propriétaire uniquement)
- `DELETE /api/guilds/:id` : Suppression d'une guilde (propriétaire uniquement)
- `PUT /api/guilds/:id/join` : Rejoindre une guilde (authentifié)
- `PUT /api/guilds/:id/leave` : Quitter une guilde (authentifié)
- `PUT /api/guilds/:id/transfer-ownership` : Transférer la propriété (propriétaire uniquement)
- `PUT /api/guilds/:id/contribute` : Contribuer des clics à la guilde (authentifié)

## WebSockets

Le backend utilise Socket.io pour les communications en temps réel :

- Mise à jour des clics individuels
- Notification des activités de guilde
- Mise à jour du statut des quêtes

## Installation

1. Installer les dépendances :
```
npm install
```

2. Créer un fichier `.env` avec les variables suivantes :
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://root@localhost:26257/wasac_clicker?sslmode=disable
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

3. Lancer le serveur de développement :
```
npm run dev
```

## Tests

Lancer les tests unitaires et d'intégration :
```
npm test
```

Lancer les tests en mode watch :
```
npm run test:watch
``` 