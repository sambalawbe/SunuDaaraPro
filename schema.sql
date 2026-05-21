-- Table des rôles personnalisés
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    libelle TEXT NOT NULL,
    permissions TEXT NOT NULL,
    description TEXT
);

-- Table des utilisateurs (personnel)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    role TEXT NOT NULL REFERENCES roles(code),
    statut TEXT CHECK(statut IN ('Actif', 'Suspendu')) DEFAULT 'Actif',
    date_creation TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'activité pour l'audit
CREATE TABLE IF NOT EXISTS logs_activite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utilisateur_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    date_heure TEXT DEFAULT CURRENT_TIMESTAMP,
    adresse_ip TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);

-- Table des enseignants (Oustaz)
CREATE TABLE IF NOT EXISTS enseignants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    adresse TEXT,
    photo_url TEXT,
    specialite TEXT NOT NULL,
    competences TEXT,
    salaire_mensuel INTEGER NOT NULL,
    date_embauche TEXT NOT NULL,
    statut TEXT CHECK(statut IN ('Actif', 'Inactif')) DEFAULT 'Actif',
    statut_paiement_mois TEXT CHECK(statut_paiement_mois IN ('Payé', 'En attente')) DEFAULT 'En attente'
);

-- Table des dortoirs pour l'hébergement
CREATE TABLE IF NOT EXISTS dortoirs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE,
    capacite_lits INTEGER NOT NULL
);

-- Table des élèves (talibés)
CREATE TABLE IF NOT EXISTS eleves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    photo_url TEXT,
    date_naissance TEXT,
    lieu_naissance TEXT,
    contact_parent TEXT NOT NULL,
    tuteur_nom TEXT,
    tuteur_adresse TEXT,
    niveau_actuel TEXT CHECK(niveau_actuel IN ('Débutant', 'Intermédiaire', 'Hafiz')) NOT NULL,
    niveau_hizb INTEGER DEFAULT 0,
    dernier_verset TEXT,
    points_tarbyya INTEGER DEFAULT 0,
    statut_pension TEXT CHECK(statut_pension IN ('Interne', 'Externe')) NOT NULL,
    statut_prise_en_charge TEXT CHECK(statut_prise_en_charge IN ('Parrainé', 'En recherche')) NOT NULL,
    statut TEXT CHECK(statut IN ('Actif', 'Inactif', 'Diplômé')) DEFAULT 'Actif',
    dortoir_id INTEGER,
    lit_numero INTEGER,
    enseignant_id INTEGER,
    date_inscription TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dortoir_id) REFERENCES dortoirs(id),
    FOREIGN KEY (enseignant_id) REFERENCES enseignants(id)
);

-- Table des catégories de logistique
CREATE TABLE IF NOT EXISTS categories_logistique (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE
);

-- Table des articles (logistique / inventaire)
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    categorie TEXT NOT NULL,
    quantite INTEGER DEFAULT 0,
    unite TEXT NOT NULL,
    seuil_alerte INTEGER DEFAULT 0
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    type_mouvement TEXT CHECK(type_mouvement IN ('Entrée', 'Sortie')) NOT NULL,
    quantite INTEGER NOT NULL,
    date_mouvement TEXT DEFAULT CURRENT_TIMESTAMP,
    motif TEXT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Table des fiches médicales
CREATE TABLE IF NOT EXISTS fiches_medicales (
    eleve_id INTEGER PRIMARY KEY,
    groupe_sanguin TEXT,
    poids REAL,
    allergies TEXT,
    antecedents TEXT,
    contact_urgence_nom TEXT,
    contact_urgence_tel TEXT,
    FOREIGN KEY (eleve_id) REFERENCES eleves(id)
);

-- Table des consultations médicales
CREATE TABLE IF NOT EXISTS consultations_medicales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eleve_id INTEGER NOT NULL,
    date_consultation TEXT DEFAULT CURRENT_TIMESTAMP,
    symptomes TEXT NOT NULL,
    diagnostic TEXT NOT NULL,
    traitement TEXT NOT NULL,
    statut_eleve TEXT CHECK(statut_eleve IN ('En classe', 'Repos', 'Évacué')) NOT NULL,
    FOREIGN KEY (eleve_id) REFERENCES eleves(id)
);

-- Table des modèles de messages
CREATE TABLE IF NOT EXISTS message_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    canal TEXT CHECK(canal IN ('SMS', 'WhatsApp', 'Email')) NOT NULL,
    contenu TEXT NOT NULL
);

-- Table des logs de communication
CREATE TABLE IF NOT EXISTS logs_communication (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_nom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    message TEXT NOT NULL,
    date_envoi TEXT DEFAULT CURRENT_TIMESTAMP,
    statut TEXT CHECK(statut IN ('Envoyé', 'Distribué', 'Échoué')) DEFAULT 'Envoyé'
);

-- Table des dons
CREATE TABLE IF NOT EXISTS dons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donateur_nom TEXT NOT NULL,
    montant INTEGER NOT NULL,
    date_don TEXT DEFAULT CURRENT_TIMESTAMP,
    type_paiement TEXT CHECK(type_paiement IN ('Espèces', 'Transfert', 'Nature')) NOT NULL,
    assignation TEXT,
    recu_numero TEXT
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS depenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    libelle TEXT NOT NULL,
    categorie TEXT CHECK(categorie IN ('Alimentation', 'Salaires', 'Santé', 'Logistique', 'Loyer', 'Autre')) NOT NULL,
    montant INTEGER NOT NULL,
    date_depense TEXT DEFAULT CURRENT_TIMESTAMP,
    justificatif_url TEXT
);
