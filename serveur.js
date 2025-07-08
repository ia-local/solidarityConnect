// server.js

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk'); // Importe le SDK Groq
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialisation du SDK Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Modèle Gemini Pro

// Initialisation du SDK Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // Modèle Groq (gemma2-9b-it)

// Chemins vers les fichiers de données
const DB_ARTICLES_PATH = path.join(__dirname, 'data', 'db_articles.json');
const POVERTY_REGIONS_PATH = path.join(__dirname, 'data', 'poverty_regions.json');
const BENEFICIARY_LOCATIONS_PATH = path.join(__dirname, 'data', 'beneficiary_locations.json');
// Dans server.js, ajoutez cette ligne avant app.get('*', ...)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});
// Middleware pour parser les requêtes JSON
app.use(express.json());
// Servir les fichiers statiques depuis le répertoire 'docs'
app.use(express.static(path.join(__dirname, 'docs')));

// --- Fonctions utilitaires pour la gestion des articles ---
async function readArticles() {
    try {
        const data = await fs.readFile(DB_ARTICLES_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') { return []; }
        console.error("Erreur de lecture de db_articles.json:", error);
        throw error;
    }
}
async function writeArticles(articles) {
    try {
        await fs.writeFile(DB_ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf8');
    } catch (error) {
        console.error("Erreur d'écriture dans db_articles.json:", error);
        throw error;
    }
}

// --- Fonctions utilitaires pour la gestion des données géographiques ---
async function readGeoData(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') { return []; }
        console.error(`Erreur de lecture de ${filePath}:`, error);
        throw error;
    }
}

// --- Routes API pour les articles (CRUD) ---
app.get('/api/articles', async (req, res) => {
    try {
        let articles = await readArticles();
        articles.sort((a, b) => b.timestamp - a.timestamp);
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les articles." });
    }
});
app.post('/api/articles', async (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) { return res.status(400).json({ error: "Titre, contenu et auteur sont requis." }); }
    try {
        const articles = await readArticles();
        const newArticle = {
            id: Date.now().toString(),
            title, content, author,
            timestamp: Date.now(),
            date_display: new Date().toLocaleDateString('fr-FR')
        };
        articles.push(newArticle);
        await writeArticles(articles);
        res.status(201).json(newArticle);
    } catch (error) { res.status(500).json({ error: "Impossible de créer l'article." }); }
});
app.put('/api/articles/:id', async (req, res) => {
    const articleId = req.params.id;
    const { title, content, author } = req.body;
    try {
        let articles = await readArticles();
        const articleIndex = articles.findIndex(a => a.id === articleId);
        if (articleIndex === -1) { return res.status(404).json({ error: "Article non trouvé." }); }
        if (title) articles[articleIndex].title = title;
        if (content) articles[articleIndex].content = content;
        if (author) articles[articleIndex].author = author;
        articles[articleIndex].timestamp = Date.now();
        articles[articleIndex].date_display = new Date().toLocaleDateString('fr-FR');
        await writeArticles(articles);
        res.json(articles[articleIndex]);
    } catch (error) { res.status(500).json({ error: "Impossible de mettre à jour l'article." }); }
});
app.delete('/api/articles/:id', async (req, res) => {
    const articleId = req.params.id;
    try {
        let articles = await readArticles();
        const initialLength = articles.length;
        articles = articles.filter(a => a.id !== articleId);
        if (articles.length === initialLength) { return res.status(404).json({ error: "Article non trouvé." }); }
        await writeArticles(articles);
        res.status(204).send();
    } catch (error) { res.status(500).json({ error: "Impossible de supprimer l'article." }); }
});

// --- Routes API pour la Cartographie ---
app.get('/api/poverty-regions', async (req, res) => {
    try {
        const regions = await readGeoData(POVERTY_REGIONS_PATH);
        res.json(regions);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les données des régions." });
    }
});
app.get('/api/beneficiary-locations', async (req, res) => {
    try {
        const locations = await readGeoData(BENEFICIARY_LOCATIONS_PATH);
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les emplacements des bénéficiaires." });
    }
});

// --- Route API pour l'interaction avec l'IA (mise à jour pour les rôles et la sélection de modèle) ---
app.post('/api/ai-chat', async (req, res) => {
    const { message, history } = req.body;
    // SIMULATION DU RÔLE DE L'UTILISATEUR POUR LE DÉVELOPPEMENT
    // En production, ce rôle viendrait de l'authentification (ex: JWT)
    const userRole = req.query.role || 'beneficiaire'; // Par défaut 'beneficiaire'
    // Sélection du modèle d'IA via paramètre de requête
    const modelChoice = req.query.model_choice || 'gemini'; // Par défaut 'gemini', peut être 'gemma'

    if (!message) {
        return res.status(400).json({ error: "Le message est vide." });
    }

    try {
        let systemPrompt = "";

        // Définition du prompt système en fonction du rôle de l'utilisateur
        if (userRole === 'beneficiaire') {
            systemPrompt = "Vous êtes un assistant IA empathique et pragmatique de Solidarity Connect, dédié à aider les personnes en situation de précarité en France. Votre mission est de fournir des informations claires et actionnables sur les aides sociales, les formations, les opportunités d'emploi, le logement, et la gestion budgétaire, en tenant compte de leur localisation et de leur situation personnelle. Votre ton est encourageant, respectueux et direct. Vous êtes un facilitateur d'autonomie.";
        } else if (userRole === 'donateur') {
            systemPrompt = "Vous êtes un assistant IA informatif et transparent de Solidarity Connect, dédié à guider les donateurs et à leur montrer l'impact de leur générosité. Votre mission est de fournir des informations claires sur les projets financés, l'utilisation des fonds, les réussites, et les besoins actuels. Vous encouragez la générosité programmée et la compréhension de notre modèle d'économie circulaire. Votre ton est professionnel, inspirant et axé sur les résultats.";
        } else if (userRole === 'administrateur') {
            systemPrompt = "Vous êtes un assistant IA analytique et optimisateur de Solidarity Connect, dédié à soutenir les administrateurs et développeurs dans la gestion et l'amélioration de la plateforme. Votre mission est de fournir des analyses de données, des rapports de performance, d'identifier des tendances, de suggérer des optimisations techniques ou stratégiques, et d'aider à la conformité. Votre ton est factuel, précis et orienté solution.";
        } else {
            // Prompt par défaut si le rôle n'est pas reconnu ou non spécifié
            systemPrompt = "Vous êtes l'assistant général de Solidarity Connect, une IA bienveillante dédiée à aider les personnes en situation de précarité. Je suis là pour vous accompagner vers une plus grande autonomie et une vie digne.";
        }

        let aiReply = "Désolé, je n'ai pas pu générer de réponse.";

        // Sélection du modèle d'IA à utiliser
        if (modelChoice === 'gemma') {
            // Pour Groq, l'historique est un tableau d'objets avec 'role' et 'content'
            const groqHistory = [
                { role: "system", content: systemPrompt },
                { role: "assistant", content: "Compris. Je suis prêt à vous assister selon votre rôle." }
            ];
            // Ajouter l'historique de conversation précédent
            history.forEach(item => {
                groqHistory.push({ role: item.role === 'ai' ? 'assistant' : item.role, content: item.content });
            });
            groqHistory.push({ role: "user", content: message });

            console.log("Utilisation du modèle Groq (gemma2-9b-it)");
            const chatCompletion = await groq.chat.completions.create({
                messages: groqHistory,
                model: "gemma2-9b-it",
                temperature: 0.6,
                max_tokens: 800,
            });
            aiReply = chatCompletion.choices[0]?.message?.content;

        } else { // Par défaut, ou si modelChoice est 'gemini'
            // Pour Gemini, l'historique est un tableau d'objets avec 'role' et 'parts'
            const geminiHistory = [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Compris. Je suis prêt à vous assister selon votre rôle." }] }
            ];
            // Ajouter l'historique de conversation précédent
            history.map(item => ({
                role: item.role === 'ai' ? 'model' : item.role,
                parts: [{ text: item.content }]
            })).forEach(item => geminiHistory.push(item));
            geminiHistory.push({ role: "user", parts: [{ text: message }] });

            console.log("Utilisation du modèle Google Gemini (gemini-pro)");
            const chat = geminiModel.startChat({
                history: geminiHistory,
                generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
            });
            const result = await chat.sendMessage(message);
            aiReply = result.response.text();
        }

        res.json({ reply: aiReply || "Désolé, je n'ai pas pu générer de réponse." });

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API IA:", error);
        if (error.response && error.response.data) { console.error("Détails de l'erreur API:", error.response.data); }
        res.status(500).json({ error: "Erreur interne du serveur lors de l'interaction avec l'IA." });
    }
});

// Route par défaut (fallback pour le SPA)
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'docs', 'index.html')); });
app.listen(port, () => {
    console.log(`Serveur Solidarity Connect démarré sur http://localhost:${port}`);
    console.log(`Clé API Google chargée : ${process.env.GOOGLE_API_KEY ? 'Oui' : 'Non (Vérifiez votre fichier .env)'}`);
    console.log(`Clé API Groq chargée : ${process.env.GROQ_API_KEY ? 'Oui' : 'Non (Vérifiez votre fichier .env)'}`);
});
