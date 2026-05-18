-- Table des utilisateurs pour le Back Office
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    role TEXT CHECK(role IN ('SUPER_ADMIN', 'INTENDANT', 'MEDECIN', 'ENSEIGNANT')) NOT NULL,
    statut TEXT CHECK(statut IN ('Actif', 'Suspendu')) DEFAULT 'Actif',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'activité pour l'audit
CREATE TABLE IF NOT EXISTS logs_activite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utilisateur_id INTEGER,
    action_effectuee TEXT NOT NULL,
    date_heure DATETIME DEFAULT CURRENT_TIMESTAMP,
    adresse_ip TEXT,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);
