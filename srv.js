// server.js

// 1. Importations nécessaires
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Importe le SDK Google GenAI
require('dotenv').config(); // Pour charger les variables d'environnement depuis un fichier .env

// 2. Initialisation d'Express
const app = express();
const port = process.env.PORT || 3000;

// 3. Initialisation du SDK Google Generative AI
// Assurez-vous d'avoir votre clé API Google dans un fichier .env (GOOGLE_API_KEY=votre_clé_api)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Utilise le modèle Gemini Pro pour le chat

// 4. Servir les fichiers statiques depuis le répertoire 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 5. Middleware pour parser les requêtes JSON
app.use(express.json());

// 6. Route API pour l'interaction avec l'IA
app.post('/api/ai-chat', async (req, res) => {
    const { message, history } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: "Le message est vide." });
    }

    try {
        // --- MISE À JOUR MAJEURE : Intégration de la VISION de Gemini pour Solidarity Connect ---
        // Le rôle 'system' définit la personnalité et la mission de l'IA
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "En tant qu'IA de Solidarity Connect, comment peux-tu aider les personnes en situation de précarité ?" }]
                },
                {
                    role: "model",
                    parts: [{ text: "Je suis ici pour être un soutien essentiel aux personnes confrontées à la pauvreté et à la précarité. Ma mission est de vous aider à accéder à l'information vitale, à valoriser vos compétences, et à trouver des opportunités de formation et d'emploi. Je peux : \n\n1.  **Vous informer sur vos droits et les aides sociales :** Je vous guide vers les dispositifs auxquels vous pourriez prétendre (RSA, APL, etc.) et les démarches pour les obtenir, en tenant compte de votre localisation. \n2.  **Valoriser vos compétences et vous orienter :** Je vous aide à identifier vos aptitudes, même informelles, et à les transformer en atouts pour le marché du travail ou la monétisation de services. Je peux suggérer des parcours de formation adaptés à vos besoins et aux débouchés locaux. \n3.  **Faciliter l'accès à l'emploi :** Je peux vous aider à rédiger des CV, à trouver des offres ciblées, et même à préparer des entretiens. Mon objectif est de vous connecter aux opportunités qui mènent à un travail rémunéré et stable. \n4.  **Guider vers des solutions de logement :** Je peux vous aider à chercher des logements sociaux ou abordables correspondant à vos critères. \n5.  **Optimiser l'utilisation de vos ressources :** Je peux vous donner des conseils pratiques pour gérer votre budget et optimiser vos dépenses, en tenant compte du coût de la vie dans votre région. \n\nJe suis là pour vous accompagner, étape par étape, vers une plus grande autonomie et une vie digne. Posez-moi vos questions, je suis à votre écoute avec compassion et pragmatisme." }]
                }
            ],
            // Vous pouvez ajuster la température pour contrôler la créativité (0.0 très factuel, 1.0 très créatif)
            // Pour des conseils pratiques, une valeur modérée (0.5-0.7) est souvent bonne.
            generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 800, // Augmenté pour des réponses potentiellement plus détaillées
            },
        });

        // Convertir l'historique de conversation du frontend au format attendu par Gemini
        // Gemini utilise { role: 'user', parts: [{ text: '...' }] } ou { role: 'model', parts: [{ text: '...' }] }
        const formattedHistory = history.map(item => ({
            role: item.role === 'ai' ? 'model' : item.role, // Le rôle 'ai' de notre frontend doit être 'model' pour Gemini
            parts: [{ text: item.content }]
        }));

        // Envoyer l'historique formaté et le nouveau message à l'IA
        const result = await chat.sendMessage(message);
        const aiReply = result.response.text(); // Récupère la réponse de l'IA

        // Envoie la réponse de l'IA au frontend
        res.json({ reply: aiReply || "Désolé, je n'ai pas pu générer de réponse." });

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Google Gemini:", error);
        if (error.response && error.response.data) {
            console.error("Détails de l'erreur API:", error.response.data);
        }
        res.status(500).json({ error: "Erreur interne du serveur lors de l'interaction avec l'IA." });
    }
});

// 7. Route par défaut (fallback pour le SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 8. Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur Solidarity Connect démarré sur http://localhost:${port}`);
    console.log(`Clé API Google chargée : ${process.env.GOOGLE_API_KEY ? 'Oui' : 'Non (Vérifiez votre fichier .env)'}`);
});