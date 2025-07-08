/* public/js/main.js */

// Ce fichier gérera les interactions principales sur le frontend,
// y compris les requêtes asynchrones vers le serveur Express.

document.addEventListener('DOMContentLoaded', () => {
    console.log('SolidaritéConnect : Le DOM est entièrement chargé !');

    // --- Fonctionnalités de navigation (exemple) ---
    // Si vous avez un menu burger pour mobile, vous pourriez ajouter la logique ici.
    const navToggle = document.querySelector('.nav-toggle'); // Si vous ajoutez un bouton pour mobile
    const mainNav = document.querySelector('.main-nav ul');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active'); // Ajoute/retire une classe 'active' pour afficher/masquer
        });
    }

    // --- Exemple d'interaction asynchrone avec le serveur (future utilisation) ---
    // Imaginons que nous voulions vérifier le statut de l'API au chargement de la page
    checkApiStatus();

    // Gestion d'un formulaire simple (placeholder)
    const contactForm = document.getElementById('contact-form'); // Assurez-vous d'avoir un formulaire avec cet ID
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    // Initialisation d'autres modules (si vous en créez)
    // initProfileModule();
    // initAUMonitoring();
});


/**
 * Fonction pour vérifier le statut de l'API backend via une requête asynchrone.
 * Ceci est un exemple d'utilisation de fetch pour interagir avec votre serveur Express.
 */
async function checkApiStatus() {
    try {
        // La route /api/status est définie dans server/src/app.js
        const response = await fetch('/api/status');
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const data = await response.json();
        console.log('[API Status] API is running:', data.message);
        // Vous pourriez mettre à jour un élément HTML pour afficher le statut
        // document.getElementById('api-status-display').textContent = data.message;
    } catch (error) {
        console.error('[API Status Error] Impossible de se connecter à l\'API :', error);
        // document.getElementById('api-status-display').textContent = 'API hors ligne.';
    }
}

/**
 * Gestionnaire d'envoi de formulaire (exemple futur pour l'inscription ou le contact)
 * @param {Event} event - L'événement de soumission du formulaire.
 */
async function handleContactFormSubmit(event) {
    event.preventDefault(); // Empêche le rechargement de la page par défaut

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Convertit les données du formulaire en objet JS

    try {
        // Exemple d'envoi de données vers une future API de contact
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erreur d'envoi : ${response.status}`);
        }

        const result = await response.json();
        console.log('Formulaire envoyé avec succès :', result);
        alert('Votre message a été envoyé !');
        form.reset(); // Réinitialise le formulaire

    } catch (error) {
        console.error('Erreur lors de l\'envoi du formulaire :', error);
        alert('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
    }
}

// --- Fonctions utilitaires (à déplacer éventuellement dans public/js/utils.js) ---
// function sanitizeInput(input) {
//     // Implémentation de la désinfection des entrées
//     return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
// }

// function validateEmail(email) {
//     // Implémentation de la validation d'email
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }