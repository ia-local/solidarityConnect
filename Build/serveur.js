// server/src/app.js

const express = require('express');
const path = require('path');
const dotenv = require('dotenv'); // Pour charger les variables d'environnement

// Charger les variables d'environnement.
// Le chemin est relatif à l'emplacement de 'app.js', donc '..' pour remonter à 'server/',
// puis un autre '..' pour remonter à la racine du projet SolidariteConnect, où se trouve le .env.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
// Utilisation du port 3014 comme demandé, ou 3000 par défaut si non défini dans .env
const PORT = process.env.PORT || 3014; 

// --- Middlewares de base ---
// Permet à Express de parser les requêtes au format JSON (pour les APIs)
app.use(express.json());
// Permet à Express de parser les données envoyées via des formulaires HTML classiques
app.use(express.urlencoded({ extended: true }));

// --- Configuration pour servir les fichiers statiques depuis le dossier 'public' ---
// Calcul du chemin absolu vers le dossier 'public'.
// __dirname est le répertoire actuel de 'app.js' (server/src).
// On remonte deux niveaux (../../) pour arriver à la racine du projet, puis on descend dans 'public'.
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
console.log(`[Express] Serveur Express configuré pour servir les fichiers statiques depuis : ${publicPath}`);

// --- Routage de base pour les pages statiques (optionnel, mais assure la redirection vers index.html) ---
// Cette route capture toutes les requêtes qui ne correspondent pas à des fichiers statiques ni à des routes API.
// Elle est utile pour les applications de type Single Page Application (SPA)
// ou pour s'assurer que les requêtes directes à des chemins non-API renvoient la page principale.
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// --- Routes API (Placeholders pour vos futures APIs) ---
// Ces routes sont préfixées par '/api' pour les distinguer des requêtes de fichiers statiques.
// Exemple : une requête à 'http://localhost:3014/api/citizens'
// require('../src/routes/citizenRoutes') est le chemin relatif depuis 'app.js'
// const citizenRoutes = require('./routes/citizenRoutes'); // Correction: chemin relatif depuis app.js
// const donationRoutes = require('./routes/donationRoutes'); // Correction: chemin relatif depuis app.js

// app.use('/api/citizens', citizenRoutes);
// app.use('/api/donations', donationRoutes);

// Route de test simple pour l'API
app.get('/api/status', (req, res) => {
    res.json({ 
        message: 'API SolidaritéConnect est opérationnelle !',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// --- Gestion des routes non trouvées (404) ---
// Cette middleware doit être placée APRÈS toutes les routes statiques et API.
app.use((req, res, next) => {
    // Si la requête accepte du HTML, on peut renvoyer une page 404 custom.
    // Sinon, on renvoie un simple statut 404.
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(publicPath, '404.html')); // Assurez-vous d'avoir un 404.html
    } else {
        res.status(404).send('Not Found');
    }
});

// --- Gestion globale des erreurs ---
// Middleware de gestion des erreurs, doit avoir 4 arguments.
app.use((err, req, res, next) => {
    console.error(`[Express Error] ${err.stack}`);
    // En mode production, évitez d'envoyer des détails d'erreur sensibles au client
    const errorMessage = process.env.NODE_ENV === 'production' ? 'Une erreur interne du serveur est survenue.' : err.message;
    res.status(500).send(errorMessage);
});

// --- Démarrage du serveur ---
app.listen(PORT, () => {
    console.log(`[Express] Serveur SolidaritéConnect démarré sur le port ${PORT}`);
    console.log(`[Express] Accédez à l'application via : http://localhost:${PORT}`);
    console.log(`[Express] Pour tester l'API : http://localhost:${PORT}/api/status`);
});

// Exportation de l'application Express pour faciliter les tests ou l'intégration dans d'autres modules
module.exports = app;