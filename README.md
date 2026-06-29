# 🚀 Projet BadWallet - Frontend (Angular)

Bienvenue sur le dépôt Frontend du projet **BadWallet**. 
Il s'agit de l'interface utilisateur (Single Page Application) développée pour interagir avec le backend Java Spring Boot dans le cadre de l'évaluation d'Architecture Logicielle.

## 🎯 Fonctionnalités de l'Interface
L'application s'adapte dynamiquement en fonction de l'utilisateur connecté :
- **Espace Agent (Admin)** : Permet de lister les portefeuilles existants, d'en créer de nouveaux, et d'effectuer des opérations de dépôt et de retrait pour les clients.
- **Espace Client** : Permet au client de visualiser son solde, d'afficher l'historique de ses transactions, de transférer de l'argent et de payer des factures (Senelec, Woyofal, ISM).

## 🔄 Communication avec le Backend
L'intégralité de l'interface est "branchée" en temps réel sur l'API principale (`badwallet-api`) qui doit tourner sur `localhost:8080`.
- **Aucune donnée n'est factice côté client.** Chaque action (connexion, rafraîchissement du solde, paiement) déclenche une requête HTTP via le module `HttpClient` d'Angular.
- **Gestion du CORS** : L'API Spring Boot a été configurée pour accepter les requêtes provenant du port 4200.
- **Encodage Réseau** : Les numéros de téléphone contenant un symbole `+` (ex: `+221770000003`) sont automatiquement encodés (`encodeURIComponent`) avant d'être envoyés dans l'URL pour éviter que Tomcat ne les interprète comme des espaces.

## 🛠️ Stack Technique
- **Framework** : Angular 17
- **Style** : TailwindCSS (pour une interface moderne et responsive)
- **Gestion d'état** : Utilisation des **Signals** d'Angular via un store minimaliste (`balance.store.ts`) pour une réactivité instantanée sans requêtes serveur inutiles.

## 🚀 Lancer l'interface en local

Avant de lancer le frontend, assurez-vous que les **deux terminaux du backend** (`badwallet-api` sur le port 8080 et `payment-service` sur le port 8081) sont en cours d'exécution.

Ouvrez un terminal dans le dossier du frontend et exécutez :
```bash
npm install
npm start
```

L'application sera accessible sur : **http://localhost:4200**

## 🔑 Identifiants de Test
Pour faciliter l'évaluation de l'application, les jeux de données suivants sont déjà injectés en base de données par le backend au démarrage :
- **Compte Client (avec factures à payer)** : Entrez le numéro `+221770000003` sur la page de connexion.
- **Compte Agent (Dashboard Admin)** : Entrez le numéro `+221770000000` sur la page de connexion.
