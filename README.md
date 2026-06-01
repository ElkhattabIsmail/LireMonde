📚 LireMonde

LireMonde est une bibliothèque numérique développée pour la plateforme ReadSphere.
L'application permet aux utilisateurs de consulter des livres, rechercher des ouvrages, gérer leur liste de lecture et administrer le catalogue à travers une interface moderne et interactive.

🚀 Fonctionnalités
Utilisateur
Affichage automatique des livres depuis une API REST simulée
Recherche de livres par titre ou auteur
Filtrage par genre
Consultation des détails d'un livre
Gestion de la liste de lecture
Persistance des données avec LocalStorage
Administration
Ajouter un livre
Modifier un livre
Supprimer un livre
Affichage du catalogue complet
🛠️ Technologies utilisées
HTML5
CSS3
JavaScript (ES6+)
JSON Server
LocalStorage
📂 Structure du projet
liremonde/
│
├── index.html
├── css/
│   └── style.css
│
├── js/
│   └── app.js
│
├── db.json
├── package.json
└── README.md
⚙️ Installation
1. Cloner le projet
git clone <repository-url>
2. Accéder au dossier
cd liremonde
3. Installer les dépendances
npm install
▶️ Démarrer l'API
npm run api

ou

npm start

L'API sera disponible sur :

http://localhost:3000
🗃️ Exemple d'endpoint
Tous les livres
GET /books
Ajouter un livre
POST /books
Modifier un livre
PUT /books/:id
Supprimer un livre
DELETE /books/:id
🛑 Arrêter le port 3000
npm run kill
📌 Auteur

Projet réalisé dans le cadre de la modernisation de la plateforme LireMonde de ReadSphere.

📄 Licence

Projet éducatif destiné à l'apprentissage du développement Frontend et de la consommation d'API REST.