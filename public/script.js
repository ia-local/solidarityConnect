// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

    // Historique de la conversation pour l'IA
    let conversationHistory = [];

    // Fonction pour ajouter un message au chat
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll vers le bas
    }

    // Fonction pour envoyer un message à l'IA
    async function sendMessageToAI() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage('user', message); // Affiche le message de l'utilisateur
        conversationHistory.push({ role: 'user', content: message }); // Ajoute à l'historique
        chatInput.value = ''; // Efface le champ d'entrée

        try {
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message, history: conversationHistory }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiReply = data.reply;
            
            addMessage('ai', aiReply); // Affiche la réponse de l'IA
            conversationHistory.push({ role: 'assistant', content: aiReply }); // Ajoute la réponse de l'IA à l'historique

        } catch (error) {
            console.error('Erreur lors de la communication avec l\'IA:', error);
            addMessage('ai', 'Désolé, je rencontre un problème. Veuillez réessayer plus tard.');
        }
    }

    // Écouteurs d'événements
    sendButton.addEventListener('click', sendMessageToAI);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageToAI();
        }
    });

    // Message de bienvenue initial de l'IA
    addMessage('ai', "Bonjour ! Je suis l'assistant de Solidarity Connect. Comment puis-je vous aider aujourd'hui à valoriser vos compétences ou trouver des opportunités ?");
});