# 🌍 Solidarity Connect : L'IA au Cœur de la Générosité Programmée et de l'Accès à l'Emploi

Bienvenue dans le dépôt de "Solidarity Connect" ! Ce projet ambitieux vise à lutter contre la précarité et la pauvreté en France en utilisant l'Intelligence Artificielle et une approche innovante de générosité programmée. Notre mission est de valoriser les compétences, faciliter la formation et l'accès à l'emploi pour les plus démunis, tout en offrant une transparence et un impact mesurable grâce à la technologie.

---

## 🎯 Notre Mission et Vision

Nous pensons que l'IA peut être un puissant levier pour la solidarité. "Solidarity Connect" s'engage à :

* **Connecter les cœurs :** Faciliter les dons et la générosité ciblée.
* **Transformer les vies :** Aider les personnes en situation de précarité à retrouver autonomie et dignité grâce à l'emploi et la formation.
* **Agir localement :** Adapter l'aide aux réalités géographiques du seuil de pauvreté.
* **Innover par l'IA :** Utiliser l'intelligence artificielle pour personnaliser l'accompagnement et optimiser les ressources.

---

## 💻 Architecture Technique Globale

Le projet "Solidarity Connect" repose sur une architecture web moderne et évolutive, centrée sur la performance, la sécurité et la flexibilité.

```
├── / (Racine du Projet)
     ├── server.js 🚀 (Serveur Node.js principal)
     ├── package.json 📦 (Dépendances Node.js)
     ├── .env 🔑 (Variables d'environnement sécurisées)
     ├── public/ 🌐 (Fichiers Statiques du Frontend Public)
     │    ├── index.html (Structure de la page web principale)
     │    ├── style.css (Charte graphique et styles)
     │    ├── script.js (Logique frontend, interactions IA, cartographie)
     │    └── assets/ (Images, QR codes, etc.)
     ├── admin/ ⚙️ (Fichiers du Tableau de Bord Administrateur)
     │    ├── admin.html (Interface du tableau de bord)
     │    └── dashboard.js (Logique JavaScript du tableau de bord)
     ├── data/ 🗄️ (Fichiers JSON de données)
     │    ├── db_articles.json
     │    ├── poverty_regions.json
     │    └── beneficiary_locations.json
     └── guide/ 📚 (Documentation et Guides - Routé via `/docs`)
         └── ... (vos fichiers de documentation)
```

**Routes Servies par `server.js` :**
* `/` : Application publique (`public/index.html`)
* `/api/*` : Points d'API pour les données (articles, géographie) et l'IA.
* `/admin` : Tableau de bord administrateur (`admin/admin.html`) et ses assets statiques.
* `/docs/*` : Accès aux fichiers du répertoire `guide/`.

---

## 🧠 Modèle(s) d'Intelligence Artificielle

Au cœur de notre projet se trouvent des assistants IA conçus pour guider et soutenir, avec une capacité de sélection de modèle pour une flexibilité accrue.

**Rôle de l'IA :** Les IA de "Solidarity Connect" agissent comme des conseillers bienveillants et pragmatiques, adaptant leur ton et leurs informations au rôle de l'utilisateur (bénéficiaire, donateur, administrateur). Elles aident à naviguer dans les systèmes d'aide, à identifier les compétences, à trouver des formations adaptées et des opportunités d'emploi, à suivre l'impact des dons, ou à optimiser la plateforme.

**Modèles Intégrés :**
1.  **`gemini-pro`** (via le SDK `@google/generative-ai`) : Offre un excellent équilibre entre performance, intelligence et capacités conversationnelles avancées, idéal pour des interactions personnalisées.
2.  **`gemma2-9b-it`** (via le SDK `groq-sdk`) : Exploite la rapidité des LPU (Large Processing Units) de Groq pour des réponses à faible latence, utile pour des interactions rapides et directes.

**Implémentation dans `server.js` (`/api/ai-chat`) :**
* Le fichier `server.js` initialise les SDK `@google/generative-ai` et `groq-sdk` en utilisant les clés API stockées dans `.env`.
* La route `/api/ai-chat` est améliorée pour permettre une **sélection dynamique du modèle** via un paramètre de requête (`?model_choice=gemini` ou `?model_choice=gemma`).
* Le **prompt système est également dynamique**, s'adaptant au `userRole` (bénéficiaire, donateur, administrateur) afin de définir la personnalité et la mission de l'IA pour chaque interaction.
* L'historique de la conversation est formaté selon les exigences de chaque SDK (`parts` pour Google, `content` pour Groq), permettant aux IA de maintenir le contexte.
* Chaque interaction utilisateur met à jour l'historique de la conversation, permettant à l'IA de maintenir le contexte.

---

## ✨ Fonctionnalités Clés de l'Application

### 1. Accès et Authentification Simplifiés 🔑
* **Création de Compte :** Facilité d'accès grâce à Google OAuth (Gmail). Cela permet une inscription rapide et sécurisée pour les utilisateurs ayant déjà un compte Google.
* **Mobile-First & Responsive :** L'application est conçue pour être totalement responsive, garantissant une expérience fluide sur tous les appareils, en particulier les smartphones.
* **Menu de Navigation :** Un menu de navigation clair dans le footer du mobile pour un accès spontané et facile aux sections principales (Accueil, Mon Profil, Cagnottes, Assistant IA, etc.).
* **Composants UI/UX :** Utilisation de `modal.js` pour les pop-ups concises, `chatbot.js` pour l'intégration de l'IA, `pagination.js` pour la gestion de listes, et `dashboard.js` pour des vues d'ensemble personnalisées.

### 2. Générosité Programmée et Gestion des Cagnottes 💖
* **Dons Ponctuels :** Via un QR code PayPal intégré directement sur la page web pour des dons simples et immédiats.
* **Micro-Dons Récurrents :** Possibilité pour les donateurs de mettre en place des contributions régulières de petits montants, créant un flux de soutien stable pour les programmes et les bénéficiaires.
* **Cagnottes Spécifiques :** Les bénéficiaires (ou des parrains) peuvent créer des cagnottes pour des besoins précis (ex: ordinateur pour formation, frais de transport pour entretien). La transparence sur les fonds collectés est assurée.
* **Minimisation des Frais :** L'objectif est de réduire au maximum les frais de transaction pour que le don ait un impact maximal. Cela passera, à terme, par l'exploration de solutions blockchain à faible coût (stablecoins sur Layer 2).

### 3. Budget de Trésorerie & Seuil de Pauvreté 📊
* **Calcul du "Minimum Viable" (MV) :** L'application vise à aider les bénéficiaires à atteindre un revenu mensuel qui leur permet de dépasser le seuil de pauvreté. Ce MV est calculé dynamiquement en fonction de la géolocalisation.
* **Prise en Compte du Revenu Fiscal de Référence (RFR) :** Le RFR sert de point de départ pour évaluer la situation financière initiale du bénéficiaire et mesurer l'écart à combler jusqu'au MV.
* **Recettes des Bénéficiaires :**
    * Revenus du Travail Valorisé par l'IA : Micro-tâches, services, formations qualifiantes, aide à la recherche d'emploi.
    * Dons de la Générosité Programmée : Micro-dons récurrents, cagnottes ciblées.
    * Optimisation des Aides Sociales : L'IA aide à identifier et maximiser les aides existantes.
* **Trésorerie de l'Association :** Le "compte de campagne" du parti gère les recettes (dons, potentielles "Taxes IA" futures) et les dépenses (développement, redistribution, frais de fonctionnement) dans une logique d'opérations à l'équilibre et d'économie circulaire.

### 4. Cartographie et Topologie de la Pauvreté 🗺️
* **Visualisation de l'Impact :** L'application intégrera une carte interactive pour visualiser les zones de précarité en France.
* **Données Socio-économiques :** Utilisation de données de l'INSEE et d'autres sources fiables pour afficher les seuils de pauvreté, RFR moyens, taux de chômage par région/département.
* **Géolocalisation Anonymisée des Bénéficiaires :** Affichage de marqueurs (agrégés par ville/département) sur la carte pour montrer où "Solidarity Connect" agit, sans révéler d'informations personnelles (respect total du RGPD).
* **Ajustement Local du MV :** Le coût de la vie étant variable (ex: loyer à Paris vs. Normandie), la cartographie permettra d'ajuster le "Minimum Viable" et les objectifs de cagnotte en fonction de la géolocalisation du bénéficiaire.

### 5. Tableau de Bord Administrateur (Desktop-First) 🖥️
* **Interface Dédiée :** Une interface d'administration distincte, optimisée pour les écrans de bureau, accessible via `/admin`.
* **Layout :** Organisation en trois lignes principales :
    * **Header :** En-tête global avec titre et options d'administration.
    * **Main Content :** Divisé en deux colonnes : un `aside` (menu de navigation à gauche) et un conteneur principal (70% de la largeur) pour afficher les données et outils de gestion.
    * **Footer :** Pied de page administratif.
* **Fonctionnalités :** Inclut des sections pour l'aperçu du tableau de bord, la gestion complète des articles (CRUD), la gestion des utilisateurs, les rapports et analyses, les paramètres de configuration, et la configuration de l'IA.

---

## ⚖️ Cadre Juridique et Fiscal (Contexte Parti Politique)

Le projet "Solidarity Connect", porté par un parti politique, s'inscrit dans un cadre juridique et fiscal spécifique, nécessitant une grande rigueur.

* **Statut de Parti Politique :** La comptabilité et les financements sont soumis à des règles strictes de transparence (ex: contrôle CNCCFP). Le "compte de campagne" est le centre de gestion des recettes et dépenses.
* **Opérations à l'Équilibre :** Le modèle vise à réinvestir tous les fonds collectés dans les programmes sociaux, sans but lucratif.
* **"Taxe IA" (Concept) :** Une contribution innovante suggérée ou prélevée sur la valeur générée par l'IA ou les activités facilitées, réinjectée dans le cycle d'aide. Sa qualification juridique et fiscale (assujettissement à la TVA ou non) sera déterminante et nécessitera l'avis d'experts.
* **TVA sur Collecte/Décaissement :**
    * Les dons reçus par le parti ne sont pas assujettis à la TVA.
    * Les flux de collecte et redistribution des cagnottes, s'ils sont de simples intermédiations sans prestation de service, ne sont pas non plus soumis à la TVA.
    * Si la "Taxe IA" est qualifiée de rémunération de service, elle pourrait potentiellement être soumise à la TVA.
* **Consultation d'experts fiscaux et comptables est IMPÉRATIVE** pour valider ce modèle financier complexe.
* **Classes de Comptes Associées :** La comptabilité interne suivra des classes de comptes dédiées pour distinguer les dons (756 - Libéralités reçues), les fonds affectés aux redistributions (458 - Opérations de redistribution / Fonds affectés), et les charges/produits liés au fonctionnement de l'association.

---

## 🚀 Fonctionnalités Futures / Améliorations

* **Intégration Telegram & YouTube :** Possibilité de configurer et d'implémenter des fonctionnalités liées à Telegram et YouTube, gérées via le tableau de bord administrateur (ex: notifications, diffusion de contenu).
* **Implémentation d'un système d'authentification robuste :** Remplacement de la simulation de rôle par une gestion réelle des utilisateurs et de leurs permissions après l'authentification Google OAuth.
* **Développement des fonctionnalités de gestion des utilisateurs** dans le tableau de bord admin.
* **Implémentation des modules d'analyse et de rapports** dans le tableau de bord admin.
* **Exploration et implémentation de solutions blockchain** pour la minimisation des frais de transaction et une transparence accrue des dons (stablecoins sur Layer 2).

---

## 🌐 Ressources Communautaires

Connectez-vous avec la communauté "Solidarity Connect" et suivez nos avancées :

* **Dépôt GitHub :** [https://github.com/ia-local/solidarityConnect](https://github.com/ia-local/solidarityConnect)
* **Groupe Telegram :** [https://t.me/+5AriZHOa4-owYmFk](https://t.me/+5AriZHOa4-owYmFk)
* **Chaîne YouTube :** [https://www.youtube.com/@IA_SolidarityConnect](https://www.youtube.com/@IA_SolidarityConnect)

---

## 🛠️ Instructions de Démarrage Rapide

Pour lancer le serveur de développement :

1.  **Cloner le dépôt :**
    ```bash
    git clone [https://github.com/ia-local/solidarityConnect.git](https://github.com/ia-local/solidarityConnect.git)
    cd solidarityConnect
    ```
2.  **Installer les dépendances :**
    ```bash
    npm install
    ```
3.  **Configurer les variables d'environnement :**
    Créez un fichier `.env` à la racine du projet et ajoutez vos clés API Google et Groq :
    ```
    GOOGLE_API_KEY=votre_clé_api_google_ici
    GROQ_API_KEY=votre_clé_api_groq_ici
    PORT=3000
    ```
    *(Remplacez `votre_clé_api_google_ici` et `votre_clé_api_groq_ici` par vos clés réelles.)*
4.  **Lancer le serveur :**
    ```bash
    npm start
    ```
    Le serveur sera accessible sur `http://localhost:3000` pour l'application publique et `http://localhost:3000/admin` pour le tableau de bord administrateur.
    Votre documentation sera accessible via `http://localhost:3000/docs/`.

N'hésitez pas à poser vos questions ou à soumettre des modifications. La collaboration est au cœur de "Solidarity Connect" ! 💪
