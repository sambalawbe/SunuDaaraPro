

**Sunu Daara Pro** est une application web moderne conçue pour simplifier la gestion quotidienne des Daaras. Elle s'appuie sur une philosophie **Offline-First** (base locale robuste et persistance instantanée) pour pallier les éventuels problèmes de connectivité internet, tout en offrant des fonctionnalités collaboratives avancées.

La plateforme intègre la gestion pédagogique, le suivi médical, l'hébergement en dortoir, les stocks de logistique, la trésorerie solidaire, et la communication SMS automatique avec les tuteurs.

---

## 🚀 Fonctionnalités Clés

### 1. 📊 Tableau de Bord Intuitif
*   **Statistiques Clés en Temps Réel** : Suivi des effectifs (élèves, enseignants actifs), niveau de mémorisation (Hafiz) et états du stock.
*   **Alertes Automatiques** : Alerte visuelle en cas de trésorerie critique (solde insuffisant pour couvrir les besoins alimentaires du mois prochain) et alerte de stock bas.
*   **Graphiques Interactifs** : Répartition des élèves par niveau d'étude (Débutant, Intermédiaire, Hafiz) et évolution historique de la caisse (Entrées vs Sorties).

### 2. 👥 Gestion des Talibés (Élèves)
*   **Fiches Pédagogiques** : Suivi rigoureux de l'état d'avancement dans le Coran (Hizb, Sourates, Versets), points de comportement (Tarbyya) et statut de la pension.
*   **Lien Parental** : Coordonnées des parents et des tuteurs associées à chaque profil d'élève.

### 3. 🏫 Équipe Pédagogique (Enseignants)
*   **Profils Enseignants** : Fiches détaillées contenant spécialités, compétences, matricules et salaires mensuels.
*   **Suivi des Paiements** : Suivi mensuel du statut des rémunérations (Payé, En attente).

### 4. 🏨 Gestion de l'Hébergement & Dortoirs
*   **Grille Interactive des Dortoirs** : Visualisation en temps réel de chaque lit disponible dans les dortoirs configurés (*Dortoir Al-Azhar*, *Dortoir Medina*, *Dortoir Touba*).
*   **Attribution Dynamique** : Affectation des élèves internes sur des lits libres et libération instantanée en cas de départ.

### 5. 🩺 Suivi de la Santé (Médical)
*   **Fiches Médicales** : Suivi confidentiel du groupe sanguin, du poids, des allergies et des antécédents médicaux majeurs.
*   **Registre des Consultations** : Suivi des visites médicales avec symptômes observés, diagnostics, traitements prescrits et statut scolaire de l'élève (Repos ou En classe).

### 6. 📦 Gestion des Stocks (Logistique)
*   **Registre d'Inventaire** : Gestion des denrées alimentaires (sacs de riz, huile), de la literie et du matériel pédagogique.
*   **Mouvements de Stock** : Historisation détaillée des entrées (dons en nature, achats) et sorties (consommation de la cuisine, distribution).

### 7. 💬 Communications & Envoi de SMS (SMPP)
*   **Templates personnalisables** : Modèles prédéfinis pour les alertes médicales, rappels de paiement et remerciements de dons.
*   **Service SMPP Intégré** : Envoi de SMS directs via le protocole SMPP.
*   **Mode Simulation** : Si aucun serveur SMPP n'est configuré, les SMS sont simulés et imprimés dans la console du serveur local pour faciliter le développement.

### 8. 💰 Comptabilité & Trésorerie Solidaire
*   **Registre des Dons** : Historique des dons financiers, modes de paiement (Espèces, Transfert, Nature) et assignation.
*   **Registre des Dépenses** : Contrôle des sorties financières classées par catégories (Alimentation, Salaires, Santé, Logistique).

### 9. ⚙️ Administration & Sauvegardes (Backup)
*   **Permissions par Rôle** : Système basé sur des rôles d'accès (`SUPER_ADMIN`, `INTENDANT`, `MEDECIN`, `ENSEIGNANT`).
*   **Téléchargement de Base de Données** : Bouton dans la configuration permettant de sauvegarder et télécharger directement le fichier SQLite actif `sama_daara.db` pour prévenir les pertes de données.

---

## 🌍 Multilingue

L'application supporte le changement dynamique de langue en un clic depuis la barre supérieure (sans recharger la page) et persiste le choix dans le stockage local :
*   🇫🇷 **Français**
*   🇸🇳 **Wolof**
*   🇸🇦 **العربية (Arabe)**

---

## 🛠️ Stack Technique

*   **Frontend** : [React 19](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/) (Styling), [Motion / Framer Motion](https://motion.dev/) (Animations), [Recharts](https://recharts.org/) (Graphiques), [Lucide React](https://lucide.dev/) (Icônes).
*   **Backend** : [Express.js](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx) (moteur d'exécution TypeScript pour Node.js).
*   **Base de Données** : [SQLite](https://www.sqlite.org/) via la bibliothèque performante [better-sqlite3](https://github.com/WiseLibs/better-sqlite3).
*   **Réseau/SMS** : [smpp](https://www.npmjs.com/package/smpp).

---

## 💻 Installation et Lancement

### Prérequis
*   [Node.js](https://nodejs.org/) (Version 18 ou supérieure recommandée)
*   Un gestionnaire de paquets (`npm`)

### Étape 1 : Cloner le dépôt et installer les dépendances
```bash
git clone https://github.com/sambalawbe/SunuDaaraPro.git
cd SunuDaaraPro
npm install
```

### Étape 2 : Configuration d'environnement
Créez un fichier `.env` à la racine en vous basant sur `.env.example` et configurez vos variables :

```env
# Clé API pour l'intelligence artificielle (Gemini AI Studio)
GEMINI_API_KEY="VOTRE_CLE_API"
APP_URL="http://localhost:3000"

# Variables de connexion SMPP pour l'envoi de SMS (Facultatif - Bascule en mode simulation si vide)
SMPP_HOST="votre-serveur-smpp.com"
SMPP_PORT=2775
SMPP_SYSTEM_ID="votre_system_id"
SMPP_PASSWORD="votre_password"
SMPP_SENDER_ID="DaaraSunu"
```

### Étape 3 : Démarrer l'application
Le projet utilise un serveur Express intégrant les middlewares de développement Vite. Il suffit de lancer :
```bash
npm run dev
```
La plateforme sera disponible à l'adresse : **`http://localhost:3000`**

*Note : Lors du tout premier démarrage, le serveur va automatiquement créer le fichier `sama_daara.db` et le peupler (seeding automatique) avec des données de démonstration.*

---

## 🔑 Identifiants de Démo

Vous pouvez vous connecter avec les profils suivants :

| Email | Mot de passe | Rôle | Accès aux modules |
| :--- | :--- | :--- | :--- |
| **`admin@sunudaara.sn`** | `admin` | `SUPER_ADMIN` | **Tous les modules** (Complet) |
| **`o.diop@sunudaara.sn`** | `admin` | `INTENDANT` | Élèves, Logistique, Hébergement |
| **`f.fall@sunudaara.sn`** | `admin` | `MEDECIN` | Santé (Fiches & Consultations) |
| **`i.diallo@sunudaara.sn`** | `admin` | `ENSEIGNANT` | Élèves, Communications |

---

## 🗄️ Structure de la Base de Données

Les données sont structurées selon le fichier [schema.sql](schema.sql). Les tables principales sont :
*   `utilisateurs` : Gestion des comptes internes.
*   `eleves` : Fiches scolaires et détails pédagogiques.
*   `enseignants` : Équipe pédagogique.
*   `dortoirs` : Dortoirs physiques.
*   `articles` & `mouvements_stock` : Logistique.
*   `fiches_medicales` & `consultations_medicales` : Module de santé.
*   `dons` & `depenses` : Flux de trésorerie de la caisse.
*   `logs_communication` : Traçabilité des messages émis.
*   `logs_activite` : Piste d'audit des actions critiques des utilisateurs.

---

## 🧪 Commandes Disponibles

*   `npm run dev` : Lance le serveur Express + Vite en mode développement.
*   `npm run build` : Compile le frontend dans `/dist` et packager le backend via `esbuild`.
*   `npm run start` : Lance le bundle compilé en production.
*   `npm run lint` : Effectue un contrôle complet des types TypeScript (`tsc --noEmit`).
*   `npm run clean` : Supprime les fichiers compilés.
