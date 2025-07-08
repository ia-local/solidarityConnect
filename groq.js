// server.js

// 1. Importations nécessaires
const express = require('express');
const path = require('path');
const Groq = require('groq-sdk'); // Importe le SDK Groq
require('dotenv').config(); // Pour charger les variables d'environnement depuis un fichier .env

// 2. Initialisation d'Express
const app = express();
const port = process.env.PORT || 3000; // Utilise le port défini dans les variables d'environnement ou 3000 par défaut

// 3. Initialisation du SDK Groq
// Assurez-vous d'avoir votre clé API Groq dans un fichier .env (GROQ_API_KEY=votre_clé_api)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 4. Servir les fichiers statiques depuis le répertoire 'public'
// Tous les fichiers HTML, CSS, JS, images, etc. placés dans 'public' seront accessibles directement.
// Par exemple, 'public/index.html' sera accessible via 'http://localhost:3000/'
// 'public/style.css' sera accessible via 'http://localhost:3000/style.css'
app.use(express.static(path.join(__dirname, 'public')));

// 5. Middleware pour parser les requêtes JSON (si vous avez des requêtes POST depuis le frontend)
app.use(express.json());

// 6. Route API pour l'interaction avec l'IA
// Cette route permettra à votre frontend (script.js) d'envoyer des requêtes à l'IA
app.post('/api/ai-chat', async (req, res) => {
    const { message, history } = req.body; // Récupère le message de l'utilisateur et l'historique de conversation
    
    if (!message) {
        return res.status(400).json({ error: "Le message est vide." });
    }

    try {
        // Construction du contexte de la conversation pour l'IA
        // Le rôle 'system' définit la personnalité ou l'objectif de l'IA
        // L'historique permet à l'IA de se souvenir du contexte précédent
        const messages = [
            {
                role: "system",
                content: "Vous êtes l'assistant de 'Solidarity Connect', une IA bienveillante dédiée à aider les personnes en situation de précarité à valoriser leurs compétences, trouver des formations et des emplois. Votre objectif est d'offrir des conseils pratiques, d'orienter vers des ressources et de donner de l'espoir. Utilisez un langage simple et encourageant."
            },
            ...history.map(item => ({ role: item.role, content: item.content })), // Ajoute l'historique des conversations précédentes
            {
                role: "user",
                content: message // Le nouveau message de l'utilisateur
            }
        ];

        // Appel à l'API Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "gemma2-9b-it", // Le modèle LPU que vous avez spécifié
            temperature: 0.7,      // Contrôle la créativité de la réponse (0.0 pour plus factuel, 1.0 pour plus créatif)
            max_tokens: 500        // Limite la longueur de la réponse de l'IA
        });

        // Envoie la réponse de l'IA au frontend
        res.json({ reply: chatCompletion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse." });

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Groq:", error);
        res.status(500).json({ error: "Erreur interne du serveur lors de l'interaction avec l'IA." });
    }
});

// 7. Route par défaut (fallback pour le SPA)
// Si vous utilisez une Single Page Application (SPA) avec des routes côté client,
// cette ligne s'assure que toutes les requêtes non-API renvoient index.html.
// Supprimez-la si vous n'avez qu'une seule page index.html sans routing côté client.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 8. Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur Solidarity Connect démarré sur http://localhost:${port}`);
    console.log(`Clé API Groq chargée : ${process.env.GROQ_API_KEY ? 'Oui' : 'Non (Vérifiez votre fichier .env)'}`);
});