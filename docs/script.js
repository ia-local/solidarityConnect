// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat-button');

    const articlesList = document.getElementById('articles-list');
    const articleIdInput = document.getElementById('article-id');
    const articleTitleInput = document.getElementById('article-title');
    const articleContentInput = document.getElementById('article-content');
    const articleAuthorInput = document.getElementById('article-author');
    const addArticleBtn = document.getElementById('add-article-btn');
    const updateArticleBtn = document.getElementById('update-article-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    let map = null; // Variable pour stocker l'instance de la carte Leaflet

    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });

        // Actions spécifiques au changement de section
        if (sectionId === 'news-section') {
            loadArticles();
        } else if (sectionId === 'map-section') {
            // Ajout d'un délai pour s'assurer que la section est rendue visible
            // et que le navigateur a eu le temps de calculer les dimensions du conteneur.
            console.log("Section carte activée. Tentative d'initialisation de la carte après délai...");
            setTimeout(() => {
                initializeMap();
            }, 200); // Délai de 200ms
        }
    }

    // --- Fonctions pour la gestion des articles (CRUD) ---
    async function loadArticles() {
        articlesList.innerHTML = '<p class="text-center text-gray-500">Chargement des actualités...</p>';
        try {
            const response = await fetch('/api/articles');
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const articles = await response.json();
            if (articles.length === 0) {
                articlesList.innerHTML = '<p class="text-center text-gray-500">Aucune actualité pour le moment.</p>';
                return;
            }
            articlesList.innerHTML = '';
            articles.forEach(article => {
                const articleDiv = document.createElement('div');
                articleDiv.classList.add('p-4', 'mb-4', 'bg-white', 'rounded-md', 'shadow-sm', 'border', 'border-gray-200');
                articleDiv.innerHTML = `
                    <h3 class="text-xl font-semibold text-primary-blue">${article.title}</h3>
                    <p class="text-sm text-gray-500 mb-2">Par ${article.author} le ${article.date_display}</p>
                    <p class="text-gray-700">${article.content}</p>
                    <div class="mt-3 flex gap-2">
                        <button class="edit-article-btn bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-3 rounded-md" data-id="${article.id}">Modifier</button>
                        <button class="delete-article-btn bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded-md" data-id="${article.id}">Supprimer</button>
                    </div>
                `;
                articlesList.appendChild(articleDiv);
            });
            document.querySelectorAll('.edit-article-btn').forEach(button => {
                button.addEventListener('click', (e) => editArticle(e.target.dataset.id));
            });
            document.querySelectorAll('.delete-article-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteArticle(e.target.dataset.id));
            });
        } catch (error) {
            console.error('Erreur lors du chargement des articles:', error);
            articlesList.innerHTML = '<p class="text-center text-red-500">Erreur lors du chargement des actualités.</p>';
        }
    }
    addArticleBtn.addEventListener('click', async () => {
        const title = articleTitleInput.value.trim();
        const content = articleContentInput.value.trim();
        const author = articleAuthorInput.value.trim();
        if (!title || !content || !author) { alert('Veuillez remplir tous les champs pour l\'article.'); return; }
        try {
            const response = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, author }) });
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            articleTitleInput.value = ''; articleContentInput.value = ''; articleAuthorInput.value = '';
            loadArticles();
        } catch (error) { console.error('Erreur lors de l\'ajout de l\'article:', error); alert('Erreur lors de l\'ajout de l\'article.'); }
    });
    async function editArticle(id) {
        try {
            const response = await fetch('/api/articles');
            const articles = await response.json();
            const articleToEdit = articles.find(a => a.id === id);
            if (articleToEdit) {
                articleIdInput.value = articleToEdit.id;
                articleTitleInput.value = articleToEdit.title;
                articleContentInput.value = articleToEdit.content;
                articleAuthorInput.value = articleToEdit.author;
                addArticleBtn.classList.add('hidden');
                updateArticleBtn.classList.remove('hidden');
                cancelEditBtn.classList.remove('hidden');
            }
        } catch (error) { console.error('Erreur lors de la préparation de la modification:', error); alert('Erreur lors de la récupération de l\'article pour modification.'); }
    }
    updateArticleBtn.addEventListener('click', async () => {
        const id = articleIdInput.value;
        const title = articleTitleInput.value.trim();
        const content = articleContentInput.value.trim();
        const author = articleAuthorInput.value.trim();
        if (!id || !title || !content || !author) { alert('Veuillez remplir tous les champs et sélectionner un article à modifier.'); return; }
        try {
            const response = await fetch(`/api/articles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, author }) });
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            articleIdInput.value = ''; articleTitleInput.value = ''; articleContentInput.value = ''; articleAuthorInput.value = '';
            addArticleBtn.classList.remove('hidden'); updateArticleBtn.classList.add('hidden'); cancelEditBtn.classList.add('hidden');
            loadArticles();
        } catch (error) { console.error('Erreur lors de la mise à jour de l\'article:', error); alert('Erreur lors de la mise à jour de l\'article.'); }
    });
    cancelEditBtn.addEventListener('click', () => {
        articleIdInput.value = ''; articleTitleInput.value = ''; articleContentInput.value = ''; articleAuthorInput.value = '';
        addArticleBtn.classList.remove('hidden'); updateArticleBtn.classList.add('hidden'); cancelEditBtn.classList.add('hidden');
    });
    async function deleteArticle(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) { return; }
        try {
            const response = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            loadArticles();
        } catch (error) { console.error('Erreur lors de la suppression de l\'article:', error); alert('Erreur lors de la suppression de l\'article.'); }
    }

    // --- Fonctions pour la cartographie ---

    async function initializeMap() {
        console.log("Début de initializeMap()...");
        const mapContainer = document.getElementById('map');

        if (!mapContainer) {
            console.error("Conteneur de carte #map non trouvé !");
            return;
        }

        // Vérifier les dimensions du conteneur AVANT d'initialiser la carte
        const rect = mapContainer.getBoundingClientRect();
        console.log(`Dimensions du conteneur de carte: Largeur=${rect.width}px, Hauteur=${rect.height}px`);

        if (rect.width === 0 || rect.height === 0) {
            console.warn("Le conteneur de carte a des dimensions nulles. La carte pourrait ne pas s'afficher correctement. Réessayez après un délai plus long si le problème persiste.");
            // Ne pas retourner ici, tenter quand même d'initialiser/invalider
            // car le setTimeout est censé avoir déjà aidé.
        }

        if (map === null) { // Initialiser la carte une seule fois
            console.log("Instance de carte est nulle, création d'une nouvelle carte...");
            map = L.map('map').setView([46.603354, 1.888334], 6); // Centre sur la France, zoom 6

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            await loadPovertyRegions();
            await loadBeneficiaryLocations();
            console.log("Couches de carte chargées.");

        } else {
            console.log("Instance de carte existe déjà. Pas de nouvelle création.");
        }

        // Invalider la taille de la carte pour s'assurer qu'elle s'affiche correctement
        // après que sa section soit devenue visible. C'est crucial.
        map.invalidateSize();
        console.log("map.invalidateSize() appelée. Fin de initializeMap().");
    }

    async function loadPovertyRegions() {
        try {
            const response = await fetch('/api/poverty-regions');
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const regions = await response.json();

            regions.forEach(region => {
                const circle = L.circle([region.lat, region.lon], {
                    color: `hsl(0, 70%, ${50 + region.color_intensity * 30}%)`,
                    fillColor: `hsl(0, 70%, ${50 + region.color_intensity * 30}%)`,
                    fillOpacity: 0.5,
                    radius: region.color_intensity * 50000
                }).addTo(map);

                circle.bindPopup(`
                    <b>${region.name}</b><br>
                    Taux de pauvreté: ${region.poverty_rate}%<br>
                    Loyer moyen: ${region.avg_rent}€<br>
                    ${region.description}
                `);
            });
            console.log("Données de pauvreté chargées sur la carte.");
        } catch (error) {
            console.error('Erreur lors du chargement des données de pauvreté:', error);
        }
    }

    async function loadBeneficiaryLocations() {
        try {
            const response = await fetch('/api/beneficiary-locations');
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const locations = await response.json();

            locations.forEach(location => {
                const marker = L.marker([location.lat, location.lon]).addTo(map);
                marker.bindPopup(`
                    <b>Ville: ${location.city}</b><br>
                    Impact: ${location.impact}<br>
                    Statut: ${location.status}
                `);
            });
            console.log("Emplacements des bénéficiaires chargés sur la carte.");
        } catch (error) {
            console.error('Erreur lors du chargement des emplacements des bénéficiaires:', error);
        }
    }

    // Gestion des clics sur les éléments de navigation du footer
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });

    // Initialisation : afficher la première section par défaut
    showSection('news-section');

    // --- Logique simulée pour le chatbot (inchangée) ---
    function addChatMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendChatButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            addChatMessage('user', message);
            chatInput.value = '';
            setTimeout(() => {
                addChatMessage('ai', `Je suis l'assistant IA. Vous avez dit : "${message}". Comment puis-je vous aider davantage ?`);
            }, 500);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatButton.click();
        }
    });

    // --- Logique pour le Modal (inchangée) ---
    window.openModal = function(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    window.closeModal = function(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    window.onclick = function(event) {
        const donationModal = document.getElementById('donationModal');
        if (event.target == donationModal) {
            donationModal.style.display = "none";
        }
    }

    // --- Simulation Google Sign-In (inchangée) ---
    const googleSignInBtn = document.getElementById('google-signin-btn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => {
            alert("Simulation de la connexion Google OAuth. En production, cela initierait le flux d'authentification Google.");
        });
    }
});
