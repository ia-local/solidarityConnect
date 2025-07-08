// admin/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.admin-aside-nav a');
    const dashboardSections = document.querySelectorAll('.dashboard-section');

    // --- Éléments pour la gestion des articles dans l'admin dashboard ---
    const adminArticlesList = document.getElementById('admin-articles-list');
    const adminArticleIdInput = document.getElementById('admin-article-id');
    const adminArticleTitleInput = document.getElementById('admin-article-title');
    const adminArticleContentInput = document.getElementById('admin-article-content');
    const adminArticleAuthorInput = document.getElementById('admin-article-author');
    const adminAddArticleBtn = document.getElementById('admin-add-article-btn');
    const adminUpdateArticleBtn = document.getElementById('admin-update-article-btn');
    const adminCancelEditBtn = document.getElementById('admin-cancel-edit-btn');

    // --- Éléments pour l'aperçu des intégrations (existants) ---
    const telegramStatusElem = document.getElementById('telegram-status');
    const telegramLastActivityElem = document.getElementById('telegram-last-activity');
    const youtubeChannelNameElem = document.getElementById('youtube-channel-name');
    const youtubeSubscribersElem = document.getElementById('youtube-subscribers');
    const youtubeTotalViewsElem = document.getElementById('youtube-total-views');
    const githubRepoLinkElem = document.getElementById('github-repo-link');
    const githubLastCommitElem = document.getElementById('github-last-commit');

    // --- Nouveaux éléments pour la comptabilité et trésorerie ---
    const totalCollectedElem = document.getElementById('total-collected');
    const totalDisbursedElem = document.getElementById('total-disbursed');
    const currentBalanceElem = document.getElementById('current-balance');
    const recurringDonorsElem = document.getElementById('recurring-donors');
    const monthlyRecurringCommitmentElem = document.getElementById('monthly-recurring-commitment');
    const recentTransactionsList = document.getElementById('recent-transactions');


    // Fonction pour afficher une section du dashboard
    function showDashboardSection(sectionId) {
        dashboardSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        // Actions spécifiques au chargement de certaines sections
        if (sectionId === 'articles-management') {
            loadAdminArticles(); // Charge les articles pour la gestion
        }
        if (sectionId === 'overview-dashboard') {
            loadDashboardOverview(); // Charge les données de l'aperçu général
        }
        if (sectionId === 'accounting-treasury-management') {
            loadAccountingTreasuryData(); // Charge les données de comptabilité et trésorerie
        }
        // Ajoutez ici d'autres logiques de chargement pour d'autres sections
    }

    // --- Logique pour l'Aperçu du Dashboard ---
    async function loadDashboardOverview() {
        // Simule le chargement de données pour l'aperçu général
        document.getElementById('total-beneficiaries').textContent = 'Chargement...';
        document.getElementById('monthly-donations').textContent = 'Chargement...';
        document.getElementById('completed-trainings').textContent = 'Chargement...';
        document.getElementById('recent-activity').innerHTML = '<li>Chargement des activités...</li>';

        // Simule le chargement des données Telegram, YouTube, GitHub
        telegramStatusElem.textContent = 'Chargement...';
        telegramLastActivityElem.textContent = 'Chargement...';
        youtubeChannelNameElem.textContent = 'Chargement...';
        youtubeSubscribersElem.textContent = 'Chargement...';
        youtubeTotalViewsElem.textContent = 'Chargement...';
        githubLastCommitElem.textContent = 'Chargement...';


        await new Promise(resolve => setTimeout(resolve, 500)); // Simule un délai réseau

        // Données simulées pour l'aperçu général
        document.getElementById('total-beneficiaries').textContent = '125';
        document.getElementById('monthly-donations').textContent = '€ 5,780';
        document.getElementById('completed-trainings').textContent = '42';
        document.getElementById('recent-activity').innerHTML = `
            <li>Nouvel article publié : "Lancement du programme IA"</li>
            <li>Don de 50€ reçu de Jean D.</li>
            <li>Bénéficiaire Marie D. a complété sa formation.</li>
            <li>Nouvel utilisateur enregistré : Paul S.</li>
        `;

        // Données simulées pour les intégrations
        telegramStatusElem.textContent = 'Actif ✅';
        telegramLastActivityElem.textContent = 'Il y a 5 minutes';
        youtubeChannelNameElem.textContent = 'IA_SolidarityConnect';
        youtubeSubscribersElem.textContent = '1,250';
        youtubeTotalViewsElem.textContent = '87,500';
        githubRepoLinkElem.textContent = 'ia-local/solidarityConnect'; // Le texte du lien
        githubRepoLinkElem.href = 'https://github.com/ia-local/solidarityConnect'; // L'URL du lien
        githubLastCommitElem.textContent = '2 jours ago (feat: int. youtube)'; // Exemple de dernier commit
    }

    // --- Logique pour la Comptabilité et la Trésorerie ---
    async function loadAccountingTreasuryData() {
        // Simule le chargement des données
        totalCollectedElem.textContent = 'Chargement...';
        totalDisbursedElem.textContent = 'Chargement...';
        currentBalanceElem.textContent = 'Chargement...';
        recurringDonorsElem.textContent = 'Chargement...';
        monthlyRecurringCommitmentElem.textContent = 'Chargement...';
        recentTransactionsList.innerHTML = '<li>Chargement des transactions...</li>';

        await new Promise(resolve => setTimeout(resolve, 700)); // Simule un délai réseau plus long

        // Données simulées
        const totalCollected = 150000;
        const totalDisbursed = 120000;
        const currentBalance = totalCollected - totalDisbursed;
        const recurringDonors = 345;
        const monthlyRecurringCommitment = 4200;

        totalCollectedElem.textContent = `€ ${totalCollected.toLocaleString('fr-FR')}`;
        totalDisbursedElem.textContent = `€ ${totalDisbursed.toLocaleString('fr-FR')}`;
        currentBalanceElem.textContent = `€ ${currentBalance.toLocaleString('fr-FR')}`;
        recurringDonorsElem.textContent = recurringDonors;
        monthlyRecurringCommitmentElem.textContent = `€ ${monthlyRecurringCommitment.toLocaleString('fr-FR')}`;

        // Transactions récentes simulées
        recentTransactionsList.innerHTML = `
            <li><span class="font-semibold text-green-700">+€ 250</span> - Don ponctuel (05/07/2024)</li>
            <li><span class="font-semibold text-red-700">-€ 1200</span> - Aide au logement (04/07/2024)</li>
            <li><span class="font-semibold text-green-700">+€ 50</span> - Don récurrent (03/07/2024)</li>
            <li><span class="font-semibold text-red-700">-€ 300</span> - Formation IA (01/07/2024)</li>
            <li><span class="font-semibold text-green-700">+€ 100</span> - Don via Taxe IA (30/06/2024)</li>
        `;
    }


    // --- Fonctions pour la gestion des articles (CRUD) dans l'admin ---

    // Charger et afficher les articles dans la section admin
    async function loadAdminArticles() {
        adminArticlesList.innerHTML = '<p class="text-center text-gray-500">Chargement des articles...</p>';
        try {
            const response = await fetch('/api/articles');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const articles = await response.json();
            
            if (articles.length === 0) {
                adminArticlesList.innerHTML = '<p class="text-center text-gray-500">Aucun article pour le moment.</p>';
                return;
            }

            adminArticlesList.innerHTML = ''; // Vide le conteneur
            articles.forEach(article => {
                const articleDiv = document.createElement('div');
                articleDiv.classList.add('p-4', 'mb-4', 'bg-white', 'rounded-md', 'shadow-sm', 'border', 'border-gray-200', 'flex', 'justify-between', 'items-center');
                articleDiv.innerHTML = `
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">${article.title}</h3>
                        <p class="text-sm text-gray-500">Par ${article.author} le ${article.date_display}</p>
                        <p class="text-gray-700 text-sm mt-1">${article.content.substring(0, 100)}...</p>
                    </div>
                    <div class="flex flex-col gap-2 ml-4">
                        <button class="admin-edit-article-btn bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-3 rounded-md" data-id="${article.id}">Modifier</button>
                        <button class="admin-delete-article-btn bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded-md" data-id="${article.id}">Supprimer</button>
                    </div>
                `;
                adminArticlesList.appendChild(articleDiv);
            });

            // Attache les écouteurs d'événements aux nouveaux boutons
            document.querySelectorAll('.admin-edit-article-btn').forEach(button => {
                button.addEventListener('click', (e) => editAdminArticle(e.target.dataset.id));
            });
            document.querySelectorAll('.admin-delete-article-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteAdminArticle(e.target.dataset.id));
            });

        } catch (error) {
            console.error('Erreur lors du chargement des articles pour l\'admin:', error);
            adminArticlesList.innerHTML = '<p class="text-center text-red-500">Erreur lors du chargement des articles.</p>';
        }
    }

    // Ajouter un article
    adminAddArticleBtn.addEventListener('click', async () => {
        const title = adminArticleTitleInput.value.trim();
        const content = adminArticleContentInput.value.trim();
        const author = adminArticleAuthorInput.value.trim();

        if (!title || !content || !author) {
            alert('Veuillez remplir tous les champs pour l\'article.');
            return;
        }

        try {
            const response = await fetch('/api/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, author })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            adminArticleTitleInput.value = '';
            adminArticleContentInput.value = '';
            adminArticleAuthorInput.value = '';
            loadAdminArticles(); // Recharge la liste des articles
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'article:', error);
            alert('Erreur lors de l\'ajout de l\'article.');
        }
    });

    // Pré-remplit le formulaire pour modifier un article
    async function editAdminArticle(id) {
        try {
            const response = await fetch('/api/articles');
            const articles = await response.json();
            const articleToEdit = articles.find(a => a.id === id);

            if (articleToEdit) {
                adminArticleIdInput.value = articleToEdit.id;
                adminArticleTitleInput.value = articleToEdit.title;
                adminArticleContentInput.value = articleToEdit.content;
                adminArticleAuthorInput.value = articleToEdit.author;

                adminAddArticleBtn.classList.add('hidden');
                adminUpdateArticleBtn.classList.remove('hidden');
                adminCancelEditBtn.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Erreur lors de la préparation de la modification:', error);
            alert('Erreur lors de la récupération de l\'article pour modification.');
        }
    }

    // Met à jour un article
    adminUpdateArticleBtn.addEventListener('click', async () => {
        const id = adminArticleIdInput.value;
        const title = adminArticleTitleInput.value.trim();
        const content = adminArticleContentInput.value.trim();
        const author = adminArticleAuthorInput.value.trim();

        if (!id || !title || !content || !author) {
            alert('Veuillez remplir tous les champs et sélectionner un article à modifier.');
            return;
        }

        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, author })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Réinitialise le formulaire
            adminArticleIdInput.value = '';
            adminArticleTitleInput.value = '';
            adminArticleContentInput.value = '';
            adminArticleAuthorInput.value = '';
            adminAddArticleBtn.classList.remove('hidden');
            adminUpdateArticleBtn.classList.add('hidden');
            adminCancelEditBtn.classList.add('hidden');
            loadAdminArticles(); // Recharge la liste
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'article:', error);
            alert('Erreur lors de la mise à jour de l\'article.');
        }
    });

    // Annule la modification
    adminCancelEditBtn.addEventListener('click', () => {
        adminArticleIdInput.value = '';
        adminArticleTitleInput.value = '';
        adminArticleContentInput.value = '';
        adminArticleAuthorInput.value = '';
        adminAddArticleBtn.classList.remove('hidden');
        adminUpdateArticleBtn.classList.add('hidden');
        adminCancelEditBtn.classList.add('hidden');
    });

    // Supprime un article
    async function deleteAdminArticle(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            return;
        }
        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            loadAdminArticles(); // Recharge la liste
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'article:', error);
            alert('Erreur lors de la suppression de l\'article.');
        }
    }


    // Gestion des clics sur les liens de navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche le rechargement de la page
            const sectionId = e.target.dataset.section;
            if (sectionId) {
                showDashboardSection(sectionId);
            }
        });
    });

    // Initialisation : affiche la section d'aperçu par défaut
    showDashboardSection('overview-dashboard');
});
