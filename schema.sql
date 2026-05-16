-- Schema SQL pour Sama Daara Pro
-- Conçu pour SQLite (Offline First)

-- Table des Dortoirs
CREATE TABLE IF NOT EXISTS dortoirs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    capacite INTEGER NOT NULL,
    description TEXT
);

-- Table des Enseignants
CREATE TABLE IF NOT EXISTS enseignants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT,
    adresse TEXT,
    photo_url TEXT,
    specialite TEXT, -- ex: Fiqh, Tajwid, Hadith
    competences TEXT, -- Qualifications supplémentaires
    salaire_mensuel REAL DEFAULT 0,
    statut TEXT CHECK(statut IN ('Actif', 'Inactif')) DEFAULT 'Actif',
    statut_paiement_mois TEXT CHECK(statut_paiement_mois IN ('Payé', 'En attente')) DEFAULT 'En attente',
    date_embauche DATE DEFAULT CURRENT_DATE
);

-- Table des Élèves
CREATE TABLE IF NOT EXISTS eleves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    photo_url TEXT,
    date_naissance DATE,
    lieu_naissance TEXT,
    contact_parent TEXT NOT NULL, -- téléphone
    tuteur_nom TEXT,
    tuteur_adresse TEXT,
    niveau_actuel TEXT CHECK(niveau_actuel IN ('Débutant', 'Intermédiaire', 'Hafiz')) DEFAULT 'Débutant',
    niveau_hizb INTEGER DEFAULT 0 CHECK(niveau_hizb BETWEEN 0 AND 60), -- Nombre de Hizb mémorisés
    dernier_verset TEXT,
    points_tarbyya INTEGER DEFAULT 100, -- Système de points de comportement
    statut_pension TEXT CHECK(statut_pension IN ('Interne', 'Externe')) DEFAULT 'Externe',
    dortoir_id INTEGER,
    lit_numero INTEGER,
    enseignant_id INTEGER,
    statut_financier TEXT CHECK(statut_financier IN ('À jour', 'En retard')) DEFAULT 'À jour',
    date_inscription DATE DEFAULT CURRENT_DATE,
    statut TEXT CHECK(statut IN ('Actif', 'Inactif', 'Diplômé')) DEFAULT 'Actif',
    FOREIGN KEY (dortoir_id) REFERENCES dortoirs(id),
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id)
);

-- Table des Paiements
CREATE TABLE IF NOT EXISTS paiements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eleve_id INTEGER,
    enseignant_id INTEGER, -- Pour les salaires
    montant REAL NOT NULL,
    date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT CHECK(type IN ('Scolarité', 'Inscription', 'Salaire', 'Autre')) NOT NULL,
    mois_concerne TEXT, -- ex: "Octobre 2023"
    statut TEXT CHECK(statut IN ('Payé', 'En attente', 'Annulé')) DEFAULT 'Payé',
    FOREIGN KEY (eleve_id) REFERENCES eleves(id),
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id)
);

-- Table de l'Inventaire (Articles)
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    categorie TEXT CHECK(categorie IN ('Alimentation', 'Matériel Pédagogique', 'Literie', 'Entretien', 'Autre')) NOT NULL,
    quantite REAL DEFAULT 0 CHECK(quantite >= 0),
    unite TEXT NOT NULL, -- Kg, Litres, Unités, Cartons
    seuil_alerte REAL DEFAULT 5
);

-- Table des Mouvements de Stock
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    type_mouvement TEXT CHECK(type_mouvement IN ('Entrée', 'Sortie')) NOT NULL,
    quantite REAL NOT NULL,
    date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP,
    motif TEXT,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Table des Modèles de Messages
CREATE TABLE IF NOT EXISTS modeles_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    canal TEXT CHECK(canal IN ('SMS', 'WhatsApp', 'Email')) DEFAULT 'SMS',
    contenu TEXT NOT NULL
);

-- Table de l'Historique des Envois
CREATE TABLE IF NOT EXISTS historique_envois (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_nom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    message TEXT NOT NULL,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut TEXT CHECK(statut IN ('Envoyé', 'Distribué', 'Échoué')) DEFAULT 'Envoyé'
);

-- Table des Notes de Comportement (Historique Tarbyya)
CREATE TABLE IF NOT EXISTS notes_comportement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eleve_id INTEGER NOT NULL,
    points_impact INTEGER NOT NULL, -- ex: -5 ou +10
    raison TEXT NOT NULL,
    date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eleve_id) REFERENCES eleves(id)
);

-- Tables Médicales
CREATE TABLE IF NOT EXISTS fiches_medicales (
    eleve_id INTEGER PRIMARY KEY,
    groupe_sanguin TEXT,
    allergies TEXT,
    antecedents TEXT,
    contact_urgence_nom TEXT,
    contact_urgence_tel TEXT,
    FOREIGN KEY (eleve_id) REFERENCES eleves(id)
);

CREATE TABLE IF NOT EXISTS consultations_medicales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eleve_id INTEGER NOT NULL,
    date_consultation DATETIME DEFAULT CURRENT_TIMESTAMP,
    symptomes TEXT,
    diagnostic TEXT,
    traitement TEXT,
    statut_eleve TEXT CHECK(statut_eleve IN ('En classe', 'Repos', 'Évacué')) DEFAULT 'En classe',
    FOREIGN KEY (eleve_id) REFERENCES eleves(id)
);
