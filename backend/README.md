# Wasac-Clicker Backend API

API backend pour l'application Wasac-Clicker utilisant CockroachDB.

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Démarrer en mode production
npm start
```

## Configuration de CockroachDB

1. Installer CockroachDB localement ou utiliser CockroachDB Cloud
2. Créer une base de données `wasac_clicker`
3. Configurer les variables d'environnement

## Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
PORT=5000
DATABASE_URL=postgresql://root@localhost:26257/wasac_clicker?sslmode=disable
JWT_SECRET=your_jwt_secret
```

Remplacez les valeurs par celles correspondant à votre configuration CockroachDB.

## Endpoints API

### Utilisateurs

- `GET /api/users` - Récupérer tous les utilisateurs
- `POST /api/users` - Créer un nouvel utilisateur
- `PATCH /api/users/:id/score` - Mettre à jour le score d'un utilisateur

## Structure du projet

```
new-backend/
├── config/           # Configuration de la base de données
├── models/           # Modèles de données Sequelize
├── routes/           # Routes API
├── .env              # Variables d'environnement
├── .gitignore        # Fichiers à ignorer par Git
├── index.js          # Point d'entrée de l'application
├── package.json      # Configuration du projet
└── README.md         # Documentation
``` 

### INFO UTILE :

npm run db:create - Crée les tables
npm run db:drop - Supprime les tables
npm run db:reset - Réinitialise la base de données (drop + create)
