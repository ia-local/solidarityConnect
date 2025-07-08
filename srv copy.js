// server.js

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const { Telegraf } = require('telegraf');
const { google } = require('googleapis'); // Importe la bibliothèque Google APIs
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialisation du SDK Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Utilisation de gemini-2.5-flash

// Initialisation du SDK Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialisation du bot Telegram
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
if (!telegramBotToken) {
    console.warn("TELEGRAM_BOT_TOKEN n'est pas défini dans le fichier .env. Le bot Telegram ne sera pas démarré.");
}
const bot = new Telegraf('6387827879:AAEolZGIjOlIE2p6IieLmugD9z3O8u46gek', {
    telegram: {
      webhookReply: true,
    },
  });
// Initialisation de l'API YouTube (pour les requêtes publiques si nécessaire)
// Pour l'upload ou la gestion, OAuth 2.0 est nécessaire et plus complexe à mettre en place.
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY, // Utilisez une clé API pour les accès publics
});

// Chemins vers les fichiers de données
const DB_ARTICLES_PATH = path.join(__dirname, 'data', 'db_articles.json');
const POVERTY_REGIONS_PATH = path.join(__dirname, 'data', 'poverty_regions.json');
const BENEFICIARY_LOCATIONS_PATH = path.join(__dirname, 'data', 'beneficiary_locations.json');

// Middleware pour parser les requêtes JSON
app.use(express.json());

// --- SERVIR LES FICHIERS STATIQUES ---
// Servir les fichiers statiques depuis le répertoire 'docs' (pour l'application front-end)
app.use(express.static(path.join(__dirname, 'docs'))); // Changé de 'public' à 'docs'
// Servir les fichiers statiques depuis le répertoire 'admin' (pour le tableau de bord admin)
app.use('/admin', express.static(path.join(__dirname, 'admin')));


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
    const userRole = req.query.role || 'beneficiaire';
    const modelChoice = req.query.model_choice || 'gemini';

    if (!message) {
        return res.status(400).json({ error: "Le message est vide." });
    }

    try {
        let systemPrompt = "";

        if (userRole === 'beneficiaire') {
            systemPrompt = "Vous êtes un assistant IA empathique et pragmatique de Solidarity Connect, dédié à aider les personnes en situation de précarité en France. Votre mission est de fournir des informations claires et actionnables sur les aides sociales, les formations, les opportunités d'emploi, le logement, et la gestion budgétaire, en tenant compte de leur localisation et de leur situation personnelle. Votre ton est encourageant, respectueux et direct. Vous êtes un facilitateur d'autonomie.";
        } else if (userRole === 'donateur') {
            systemPrompt = "Vous êtes un assistant IA informatif et transparent de Solidarity Connect, dédié à guider les donateurs et à leur montrer l'impact de leur générosité. Votre mission est de fournir des informations claires sur les projets financés, l'utilisation des fonds, les réussites, et les besoins actuels. Vous encouragez la générosité programmée et la compréhension de notre modèle d'économie circulaire. Votre ton est professionnel, inspirant et axé sur les résultats.";
        } else if (userRole === 'administrateur') {
            // Prompt système pour l'administrateur, incluant l'aide à la génération de contenu YouTube
            systemPrompt = "Vous êtes un assistant IA analytique et optimisateur de Solidarity Connect, dédié à soutenir les administrateurs et développeurs dans la gestion et l'amélioration de la plateforme. Votre mission est de fournir des analyses de données, des rapports de performance, d'identifier des tendances, de suggérer des optimisations techniques ou stratégiques, et d'aider à la conformité. Vous assistez également dans la **création et l'optimisation de contenu vidéo pour YouTube (idées, scripts, titres, descriptions) en tirant parti des capacités génératives**. Votre ton est factuel, précis et orienté solution.";
        } else {
            systemPrompt = "Vous êtes l'assistant général de Solidarity Connect, une IA bienveillante dédiée à aider les personnes en situation de précarité. Je suis là pour vous accompagner vers une plus grande autonomie et une vie digne.";
        }

        let aiReply = "Désolé, je n'ai pas pu générer de réponse.";

        if (modelChoice === 'gemma') {
            const groqHistory = [
                { role: "system", content: systemPrompt },
                { role: "assistant", content: "Compris. Je suis prêt à vous assister selon votre rôle." }
            ];
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

        } else {
            const geminiHistory = [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Compris. Je suis prêt à vous assister selon votre rôle." }] }
            ];
            history.map(item => ({
                role: item.role === 'ai' ? 'model' : item.role,
                parts: [{ text: item.content }]
            })).forEach(item => geminiHistory.push(item));
            geminiHistory.push({ role: "user", parts: [{ text: message }] });

            console.log("Utilisation du modèle Google Gemini (gemini-2.5-flash)");
            const chat = geminiModel.startChat({ // Utilise geminiModel (gemini-2.5-flash)
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

// --- Intégration du Bot Telegram ---

// Gestion des commandes Telegram
bot.command('start', (ctx) => {
    ctx.reply('Bienvenue sur le bot Solidarity Connect ! Je suis là pour vous aider. Utilisez /aide pour voir les commandes disponibles.');
});

bot.command('aide', (ctx) => {
    ctx.reply('Voici les commandes disponibles :\n' +
             '/cmd1 - Commande 1 (Exemple)\n' +
             '/cmd2 - Commande 2 (Exemple)\n' +
             'Envoyez-moi un message pour discuter avec l\'IA.');
});

// Commande 1 (exemple)
bot.command('cmd1', (ctx) => {
    ctx.reply('Vous avez activé la Commande 1. Ceci est un exemple de fonctionnalité.');
});

// Commande 2 (exemple)
bot.command('cmd2', (ctx) => {
    ctx.reply('Vous avez activé la Commande 2. Ceci est une autre fonctionnalité.');
});

// Gestion des messages texte normaux (conversation avec l'IA) pour Telegram
bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;
    const userId = ctx.from.id;

    console.log(`Message Telegram reçu de ${userId}: ${userMessage}`);

    try {
        const systemPrompt = "Vous êtes l'assistant IA de Solidarity Connect sur Telegram, dédié à aider les personnes en situation de précarité. Votre mission est de fournir des informations, des conseils et des orientations de manière concise et directe. Votre ton est bienveillant et pratique.";
        
        const groqHistory = [
            { role: "system", content: systemPrompt },
            { role: "assistant", content: "Compris. Je suis prêt à vous assister." }
        ];
        groqHistory.push({ role: "user", content: userMessage });

        console.log("Appel à Groq pour la réponse Telegram...");
        const chatCompletion = await groq.chat.completions.create({
            messages: groqHistory,
            model: "gemma2-9b-it",
            temperature: 0.7,
            max_tokens: 500,
        });

        const aiReply = chatCompletion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse pour le moment.";
        ctx.reply(aiReply);

    } catch (error) {
        console.error("Erreur lors de l'interaction IA avec Telegram:", error);
        ctx.reply("Désolé, je rencontre un problème pour traiter votre demande en ce moment. Veuillez réessayer plus tard.");
    }
});

// Démarrer le bot Telegram
if (telegramBotToken) {
    bot.launch()
        .then(() => console.log('Bot Telegram démarré avec succès !'))
        .catch(err => console.error('Erreur au démarrage du bot Telegram:', err));
}

// --- Routes API pour l'intégration YouTube ---

// Route pour générer une idée de vidéo/short (assistée par IA)
app.post('/api/youtube/generate-idea', async (req, res) => {
    const { topic, format, length } = req.body; // Ex: topic="impact social", format="short", length="60 secondes"
    if (!topic || !format || !length) {
        return res.status(400).json({ error: "Topic, format et longueur sont requis pour générer une idée." });
    }

    try {
        const prompt = `Génère une idée de vidéo YouTube sur le thème "${topic}" pour Solidarity Connect. Le format est "${format}" et la durée souhaitée est "${length}". Inclue un titre accrocheur, un bref synopsis et des points clés pour le contenu.`;
        
        // Utilisation de Gemma pour la génération d'idées rapides
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gemma2-9b-it",
            temperature: 0.8, // Plus de créativité pour les idées
            max_tokens: 1000,
        });
        const idea = chatCompletion.choices[0]?.message?.content;
        res.json({ idea });
    } catch (error) {
        console.error("Erreur lors de la génération d'idée YouTube par l'IA:", error);
        res.status(500).json({ error: "Erreur lors de la génération d'idée vidéo." });
    }
});

// Route pour générer un script de vidéo/short (assistée par IA)
app.post('/api/youtube/generate-script', async (req, res) => {
    const { idea, format, length } = req.body; // L'idée générée ou une idée manuelle
    if (!idea || !format || !length) {
        return res.status(400).json({ error: "Une idée, un format et une longueur sont requis pour générer un script." });
    }

    try {
        const prompt = `Rédige un script détaillé pour une vidéo YouTube de format "${format}" et de durée "${length}" basée sur l'idée suivante : "${idea}". Le script doit inclure des indications visuelles et sonores.`;
        
        // Utilisation de Gemma pour la génération de scripts
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gemma2-9b-it",
            temperature: 0.7, // Équilibre entre créativité et structure
            max_tokens: 2000,
        });
        const script = chatCompletion.choices[0]?.message?.content;
        res.json({ script });
    } catch (error) {
        console.error("Erreur lors de la génération de script YouTube par l'IA:", error);
        res.status(500).json({ error: "Erreur lors de la génération de script vidéo." });
    }
});

// Placeholder pour l'upload de vidéo YouTube (nécessite OAuth 2.0)
app.post('/api/youtube/upload-video', async (req, res) => {
    // Ici, la logique d'upload de vidéo via l'API YouTube Data API v3
    // Cela implique une authentification OAuth 2.0 avec un compte YouTube.
    // Pour une implémentation complète, vous auriez besoin de:
    // 1. Configurer les identifiants OAuth 2.0 dans la Google Cloud Console.
    // 2. Mettre en place un flux d'autorisation OAuth côté serveur pour obtenir un jeton d'accès.
    // 3. Utiliser googleapis pour appeler youtube.videos.insert() avec le fichier vidéo.
    console.log("Requête d'upload de vidéo YouTube reçue. Implémentation OAuth 2.0 requise.");
    res.status(501).json({ message: "La fonctionnalité d'upload de vidéo n'est pas encore implémentée (nécessite OAuth 2.0)." });
});

// Placeholder pour la récupération des statistiques YouTube
app.get('/api/youtube/analytics', async (req, res) => {
    // Ici, la logique pour récupérer des statistiques via l'API YouTube Analytics API
    // Nécessite une authentification OAuth 2.0 pour les données privées du canal.
    console.log("Requête d'analyse YouTube reçue. Implémentation OAuth 2.0 requise.");
    res.status(501).json({ message: "La fonctionnalité d'analyse YouTube n'est pas encore implémentée (nécessite OAuth 2.0)." });
});


// --- Routes Express (inchangées) ---

// Route spécifique pour servir admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

// Route par défaut (fallback pour le SPA)
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'docs', 'index.html')); });
app.listen(port, () => {
    console.log(`Serveur Solidarity Connect démarré sur http://localhost:${port}`);
    console.log(`Clé API Google chargée : ${process.env.GOOGLE_API_KEY ? 'Oui' : 'Non (Vérifiez votre fichier .env)'}`);
    console.log(`Clé API Groq chargée : ${process.env.GROQ_API_KEY ? 'Oui' : 'Non (Vérifiez votre fichier .env)'}`);
    console.log(`Token Bot Telegram chargé : ${process.env.TELEGRAM_BOT_TOKEN ? 'Oui' : 'Non (Le bot ne démarrera pas sans)'}`);
    console.log(`Clé API YouTube chargée : ${process.env.YOUTUBE_API_KEY ? 'Oui' : 'Non (Pour accès public uniquement)'}`);
});
