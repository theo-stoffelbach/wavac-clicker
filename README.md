# Wasac-Clicker

Application de clicker inspirée du monde du travail moderne, permettant aux utilisateurs de cliquer pour gagner des points, améliorer leurs performances, rejoindre des guildes et compléter diverses quêtes.

## Structure du Projet

Le projet est divisé en deux parties principales :

- **backend** : API RESTful développée avec Node.js, Express et CockroachDB
- **frontend** : Application cliente développée avec React (à venir)

## Configuration du Backend

### Prérequis

- Node.js (v14 ou supérieur)
- CockroachDB (local ou distant)

### Installation

1. Cloner le dépôt :
```
git clone <repository-url>
cd wasac-clicker
```

2. Installer les dépendances du backend :
```
cd backend
npm install
```

3. Configurer les variables d'environnement :
   - Créer un fichier `.env` basé sur le modèle fourni
   - Configurer la chaîne de connexion CockroachDB et les autres variables

4. Démarrer le serveur en mode développement :
```
npm run dev
```

### Structure du Backend

- `src/config` : Configuration de la base de données
- `src/controllers` : Logique métier des routes
- `src/models` : Modèles de données Sequelize
- `src/routes` : Définition des routes de l'API
- `src/middlewares` : Middlewares pour authentification et gestion d'erreurs
- `src/utils` : Utilitaires divers

## Git Flow

Le projet utilise le workflow Git Flow avec les branches suivantes :

- `main` : Branche de production stable
- `develop` : Branche de développement
- `feature/*` : Branches pour les nouvelles fonctionnalités
- `release` : Branche pour les versions en préparation
- `hotfix` : Branche pour les correctifs urgents

### Branches de fonctionnalités :

- `feature/user-authentication` : Système d'authentification
- `feature/click-system` : Système de clic et comptage
- `feature/guild-system` : Système de guildes
- `feature/quest-system` : Système de quêtes
- `feature/upgrade-system` : Système d'améliorations

## Base de Données

Le projet utilise CockroachDB, une base de données SQL distribuée compatible avec PostgreSQL. Les principales entités sont :

- **Users** : Informations sur les utilisateurs et leurs statistiques de clics
- **Guilds** : Groupes d'utilisateurs
- **Quests** : Défis à accomplir par les utilisateurs
- **Upgrades** : Améliorations que les utilisateurs peuvent acheter
- **UserQuests** : Relation entre utilisateurs et quêtes
- **UserUpgrades** : Relation entre utilisateurs et améliorations

## API

### Utilisateurs
- POST `/api/users` : Inscription d'un utilisateur
- POST `/api/users/login` : Connexion d'un utilisateur
- GET `/api/users/profile` : Obtenir le profil de l'utilisateur (authentification requise)
- PUT `/api/users/click` : Mettre à jour le compteur de clics (authentification requise)

## Licence

Ce projet est sous licence MIT. 