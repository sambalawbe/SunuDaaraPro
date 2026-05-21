import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";
import { seedDatabase } from "./serverSeed";
import { sendSMS } from "./smsService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialisation SQLite
  const dbPath = path.join(process.cwd(), 'sama_daara.db');
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  // Charger le schéma SQL s'il n'existe pas
  const schemaPath = path.join(process.cwd(), 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }

  // --- MIGRATIONS LOGISTIQUE ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories_logistique (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE
    );
  `);

  const catCount = db.prepare("SELECT COUNT(*) as count FROM categories_logistique").get() as any;
  if (catCount && catCount.count === 0) {
    console.log("🌱 Seeding logistics categories...");
    const insertCat = db.prepare("INSERT INTO categories_logistique (nom) VALUES (?)");
    const defaultCats = ['Alimentation', 'Matériel Pédagogique', 'Literie', 'Entretien', 'Autre'];
    for (const cat of defaultCats) {
      try {
        insertCat.run(cat);
      } catch (err) {
        // Ignore duplicates
      }
    }
  }

  const articlesSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='articles'").get() as any;
  if (articlesSchema && articlesSchema.sql.includes("CHECK(categorie IN")) {
    console.log("🔄 Migrating 'articles' table to remove CHECK constraint...");
    db.pragma('foreign_keys = OFF');
    try {
      db.transaction(() => {
        db.exec(`
          CREATE TABLE articles_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference TEXT NOT NULL UNIQUE,
            nom TEXT NOT NULL,
            categorie TEXT NOT NULL,
            quantite INTEGER DEFAULT 0,
            unite TEXT NOT NULL,
            seuil_alerte INTEGER DEFAULT 0
          );
        `);
        db.exec("INSERT INTO articles_new (id, reference, nom, categorie, quantite, unite, seuil_alerte) SELECT id, reference, nom, categorie, quantite, unite, seuil_alerte FROM articles;");
        db.exec("DROP TABLE articles;");
        db.exec("ALTER TABLE articles_new RENAME TO articles;");
      })();
      console.log("✅ 'articles' table migrated successfully!");
    } finally {
      db.pragma('foreign_keys = ON');
    }
  }

  // --- MIGRATION UTILISATEURS ---
  const utilisateursSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='utilisateurs'").get() as any;
  if (utilisateursSchema && utilisateursSchema.sql.includes("CHECK(role IN")) {
    console.log("🔄 Migrating 'utilisateurs' table to remove CHECK constraint on role...");
    db.pragma('foreign_keys = OFF');
    try {
      db.transaction(() => {
        db.exec(`
          CREATE TABLE utilisateurs_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mot_de_passe TEXT NOT NULL,
            role TEXT NOT NULL,
            statut TEXT CHECK(statut IN ('Actif', 'Suspendu')) DEFAULT 'Actif',
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);
        db.exec("INSERT INTO utilisateurs_new (id, nom, prenom, email, mot_de_passe, role, statut, date_creation) SELECT id, nom, prenom, email, mot_de_passe, role, statut, date_creation FROM utilisateurs;");
        db.exec("DROP TABLE utilisateurs;");
        db.exec("ALTER TABLE utilisateurs_new RENAME TO utilisateurs;");
      })();
      console.log("✅ 'utilisateurs' table migrated successfully!");
    } finally {
      db.pragma('foreign_keys = ON');
    }
  }

  // --- MIGRATION ROLES ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      libelle TEXT NOT NULL,
      permissions TEXT NOT NULL,
      description TEXT
    );
  `);

  const rolesCount = db.prepare("SELECT COUNT(*) as count FROM roles").get() as any;
  if (rolesCount && rolesCount.count === 0) {
    console.log("🌱 Seeding default roles...");
    const insertRole = db.prepare("INSERT INTO roles (code, libelle, permissions, description) VALUES (?, ?, ?, ?)");
    insertRole.run('SUPER_ADMIN', 'Super Admin', JSON.stringify(['dashboard', 'eleves', 'enseignants', 'finances', 'logistique', 'logement', 'sante', 'communications', 'parametres']), 'Accès complet au système');
    insertRole.run('INTENDANT', 'Intendant', JSON.stringify(['dashboard', 'eleves', 'logistique', 'logement']), 'Gestion des élèves, de la logistique et de l\'hébergement');
    insertRole.run('MEDECIN', 'Médecin / Infirmier', JSON.stringify(['dashboard', 'sante']), 'Gestion du volet médical et des consultations');
    insertRole.run('ENSEIGNANT', 'Enseignant', JSON.stringify(['dashboard', 'eleves', 'communications']), 'Suivi des élèves assignés et communication');
  }

  // --- MIGRATIONS PAIEMENTS ET CONFIGURATION ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuration (
      cle TEXT PRIMARY KEY,
      valeur TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS paiements_eleves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eleve_id INTEGER NOT NULL,
      type_paiement TEXT CHECK(type_paiement IN ('Inscription', 'Mensualité')) NOT NULL,
      mois TEXT, -- Format 'YYYY-MM'
      montant INTEGER NOT NULL,
      date_paiement TEXT DEFAULT CURRENT_TIMESTAMP,
      recu_numero TEXT UNIQUE NOT NULL,
      FOREIGN KEY (eleve_id) REFERENCES eleves(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS paies_personnel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE SET NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      role_personnel TEXT CHECK(role_personnel IN ('Enseignant', 'Surveillant', 'Administrateur', 'Vigile', 'Cuisinière', 'Laveuse')) NOT NULL,
      mois TEXT NOT NULL,
      montant INTEGER NOT NULL,
      date_paiement TEXT DEFAULT CURRENT_TIMESTAMP,
      recu_numero TEXT UNIQUE NOT NULL
    );
  `);


  try {
    db.exec("ALTER TABLE eleves ADD COLUMN type_eleve TEXT CHECK(type_eleve IN ('Payant', 'Gratuit')) DEFAULT 'Gratuit'");
    console.log("✅ Added column 'type_eleve' to 'eleves' table.");
  } catch (error: any) {
    if (!error.message.includes("duplicate column name")) {
      console.error("Error migrating 'eleves' table:", error.message);
    }
  }

  // Initialiser les données de démonstration (seeding)
  seedDatabase(db);

  app.use(express.json());

  // === ROUTES API ===

  // 1. Authentification / Login
  app.post("/api/login", (req, res) => {
    const { email, mot_de_passe } = req.body;
    try {
      const user = db.prepare("SELECT * FROM utilisateurs WHERE email = ? AND mot_de_passe = ? AND statut = 'Actif'").get(email, mot_de_passe) as any;
      if (user) {
        // Ne pas renvoyer le mot de passe
        const { mot_de_passe: _, ...userWithoutPass } = user;
        res.json(userWithoutPass);
      } else {
        res.status(401).json({ error: "Identifiants incorrects ou compte suspendu" });
      }
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // 2. Statistiques globales du Tableau de bord
  app.get("/api/stats", (req, res) => {
    try {
      const totalEleves = db.prepare('SELECT COUNT(*) as count FROM eleves').get() as any;
      const totalHafiz = db.prepare('SELECT COUNT(*) as count FROM eleves WHERE niveau_hizb >= 60').get() as any;
      const totalEnseignants = db.prepare("SELECT COUNT(*) as count FROM enseignants WHERE statut = 'Actif'").get() as any;
      
      const donsSum = db.prepare('SELECT SUM(montant) as sum FROM dons').get() as any;
      const depensesSum = db.prepare('SELECT SUM(montant) as sum FROM depenses').get() as any;
      const paiementsSum = db.prepare('SELECT SUM(montant) as sum FROM paiements_eleves').get() as any;
      const paiesSum = db.prepare('SELECT SUM(montant) as sum FROM paies_personnel').get() as any;
      const soldeCaisse = (donsSum.sum || 0) + (paiementsSum.sum || 0) - (depensesSum.sum || 0) - (paiesSum.sum || 0);

      // Statistiques du mois en cours
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const donsMois = db.prepare("SELECT SUM(montant) as sum FROM dons WHERE date_don LIKE ?").get(`${currentMonth}%`) as any;
      const depensesMois = db.prepare("SELECT SUM(montant) as sum FROM depenses WHERE date_depense LIKE ?").get(`${currentMonth}%`) as any;
      const paiementsMois = db.prepare("SELECT SUM(montant) as sum FROM paiements_eleves WHERE date_paiement LIKE ?").get(`${currentMonth}%`) as any;
      const paiesMois = db.prepare("SELECT SUM(montant) as sum FROM paies_personnel WHERE date_paiement LIKE ?").get(`${currentMonth}%`) as any;

      res.json({
        totalEleves: totalEleves.count,
        totalHafiz: totalHafiz.count,
        totalEnseignants: totalEnseignants.count,
        soldeCaisse,
        donsMois: (donsMois.sum || 0) + (paiementsMois.sum || 0),
        depensesMois: (depensesMois.sum || 0) + (paiesMois.sum || 0)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors du calcul des statistiques" });
    }
  });

  // 3. Élèves (CRUD)
  app.get("/api/eleves", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT eleves.*, 
               (enseignants.prenom || ' ' || enseignants.nom) as enseignant_nom,
               dortoirs.nom as dortoir_nom
        FROM eleves 
        LEFT JOIN enseignants ON eleves.enseignant_id = enseignants.id
        LEFT JOIN dortoirs ON eleves.dortoir_id = dortoirs.id
        ORDER BY eleves.id DESC
      `).all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Impossible de charger les élèves" });
    }
  });

  app.post("/api/eleves", (req, res) => {
    const { matricule, nom, prenom, photo_url, contact_parent, tuteur_nom, niveau_actuel, niveau_hizb, dernier_verset, points_tarbyya, statut_pension, statut_prise_en_charge, dortoir_id, lit_numero, enseignant_id, type_eleve } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO eleves (matricule, nom, prenom, photo_url, contact_parent, tuteur_nom, niveau_actuel, niveau_hizb, dernier_verset, points_tarbyya, statut_pension, statut_prise_en_charge, dortoir_id, lit_numero, enseignant_id, type_eleve)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        matricule || `DAARA-${Date.now().toString().slice(-4)}`,
        nom, prenom, photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prenom}`,
        contact_parent, tuteur_nom, niveau_actuel || 'Débutant',
        niveau_hizb || 0, dernier_verset || '', points_tarbyya || 0,
        statut_pension || 'Interne', statut_prise_en_charge || 'En recherche',
        dortoir_id || null, lit_numero || null, enseignant_id || null,
        type_eleve || 'Gratuit'
      );
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/eleves/:id", (req, res) => {
    const { id } = req.params;
    const { nom, prenom, photo_url, contact_parent, tuteur_nom, niveau_actuel, niveau_hizb, dernier_verset, points_tarbyya, statut_pension, statut_prise_en_charge, dortoir_id, lit_numero, enseignant_id, statut, type_eleve } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE eleves SET 
          nom = ?, prenom = ?, photo_url = ?, contact_parent = ?, tuteur_nom = ?,
          niveau_actuel = ?, niveau_hizb = ?, dernier_verset = ?, points_tarbyya = ?,
          statut_pension = ?, statut_prise_en_charge = ?, dortoir_id = ?, lit_numero = ?,
          enseignant_id = ?, statut = ?, type_eleve = ?
        WHERE id = ?
      `);
      stmt.run(
        nom, prenom, photo_url, contact_parent, tuteur_nom,
        niveau_actuel, niveau_hizb, dernier_verset, points_tarbyya,
        statut_pension, statut_prise_en_charge, dortoir_id || null, lit_numero || null,
        enseignant_id || null, statut || 'Actif', type_eleve || 'Gratuit', id
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/eleves/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM eleves WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 4. Enseignants (CRUD)
  app.get("/api/enseignants", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT enseignants.*, COUNT(eleves.id) as nb_eleves 
        FROM enseignants 
        LEFT JOIN eleves ON eleves.enseignant_id = enseignants.id
        GROUP BY enseignants.id
        ORDER BY enseignants.nom ASC
      `).all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Impossible de charger les enseignants" });
    }
  });

  app.post("/api/enseignants", (req, res) => {
    const { matricule, nom, prenom, telephone, adresse, photo_url, specialite, competences, salaire_mensuel, date_embauche, statut, statut_paiement_mois } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO enseignants (matricule, nom, prenom, telephone, adresse, photo_url, specialite, competences, salaire_mensuel, date_embauche, statut, statut_paiement_mois)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        matricule || `OUSTAZ-${Date.now().toString().slice(-4)}`,
        nom, prenom, telephone, adresse || '',
        photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prenom}`,
        specialite, competences || '', salaire_mensuel || 0,
        date_embauche || new Date().toISOString().substring(0, 10),
        statut || 'Actif', statut_paiement_mois || 'En attente'
      );
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/enseignants/:id", (req, res) => {
    const { id } = req.params;
    const { nom, prenom, telephone, adresse, photo_url, specialite, competences, salaire_mensuel, date_embauche, statut, statut_paiement_mois } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE enseignants SET 
          nom = ?, prenom = ?, telephone = ?, adresse = ?, photo_url = ?,
          specialite = ?, competences = ?, salaire_mensuel = ?, date_embauche = ?,
          statut = ?, statut_paiement_mois = ?
        WHERE id = ?
      `);
      stmt.run(
        nom, prenom, telephone, adresse, photo_url,
        specialite, competences, salaire_mensuel, date_embauche,
        statut, statut_paiement_mois, id
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/enseignants/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM enseignants WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 5. Dons
  app.get("/api/dons", (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM dons ORDER BY date_don DESC').all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Impossible de charger les dons" });
    }
  });

  app.post("/api/dons", (req, res) => {
    const { donateur_nom, montant, type_paiement, assignation, recu_numero } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO dons (donateur_nom, montant, type_paiement, assignation, recu_numero, date_don)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(donateur_nom, montant, type_paiement, assignation || 'Général', recu_numero || `REC-${Date.now().toString().slice(-4)}`, new Date().toISOString());
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 6. Dépenses
  app.get("/api/depenses", (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM depenses ORDER BY date_depense DESC').all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Impossible de charger les dépenses" });
    }
  });

  app.post("/api/depenses", (req, res) => {
    const { libelle, categorie, montant, justificatif_url } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO depenses (libelle, categorie, montant, date_depense, justificatif_url)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(libelle, categorie, montant, new Date().toISOString(), justificatif_url || null);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- CONFIGURATION ROUTES ---
  app.get("/api/config", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM configuration").all() as any[];
      const config: Record<string, string> = {};
      rows.forEach(row => {
        config[row.cle] = row.valeur;
      });
      res.json({
        frais_inscription: Number(config.frais_inscription || 10000),
        mensualite: Number(config.mensualite || 5000)
      });
    } catch (error: any) {
      res.status(500).json({ error: "Impossible de charger la configuration : " + error.message });
    }
  });

  app.put("/api/config", (req, res) => {
    const { frais_inscription, mensualite } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO configuration (cle, valeur) VALUES (?, ?) ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur");
      db.transaction(() => {
        stmt.run("frais_inscription", String(frais_inscription));
        stmt.run("mensualite", String(mensualite));
      })();
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: "Impossible de modifier la configuration : " + error.message });
    }
  });

  // --- PAIEMENTS ELEVES ROUTES ---
  app.get("/api/paiements", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT paiements_eleves.*, 
               eleves.nom as eleve_nom, 
               eleves.prenom as eleve_prenom, 
               eleves.matricule as eleve_matricule
        FROM paiements_eleves
        JOIN eleves ON paiements_eleves.eleve_id = eleves.id
        ORDER BY paiements_eleves.date_paiement DESC
      `).all();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: "Erreur lors du chargement des paiements : " + error.message });
    }
  });

  app.get("/api/eleves/:id/paiements", (req, res) => {
    const { id } = req.params;
    try {
      const rows = db.prepare(`
        SELECT * FROM paiements_eleves 
        WHERE eleve_id = ?
        ORDER BY date_paiement DESC
      `).all(id);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: "Erreur lors du chargement des paiements de l'élève : " + error.message });
    }
  });

  app.post("/api/eleves/:id/paiements", (req, res) => {
    const { id } = req.params;
    const { type_paiement, mois, montant } = req.body;
    
    // Générer un reçu unique
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const recu_numero = `REC-PAI-${dateStr}-${rand}`;
    
    try {
      // Check if student exists and is paying
      const eleve = db.prepare("SELECT type_eleve FROM eleves WHERE id = ?").get(id) as any;
      if (!eleve) {
        return res.status(404).json({ error: "Élève non trouvé." });
      }
      if (eleve.type_eleve !== 'Payant') {
        return res.status(400).json({ error: "Cet élève est enregistré comme Gratuit. Modifiez son profil pour enregistrer un paiement." });
      }

      // S'il s'agit d'une mensualité, vérifier si elle a déjà été payée pour ce mois
      if (type_paiement === 'Mensualité') {
        if (!mois) {
          return res.status(400).json({ error: "Le mois est requis pour une mensualité." });
        }
        const existing = db.prepare("SELECT id FROM paiements_eleves WHERE eleve_id = ? AND type_paiement = 'Mensualité' AND mois = ?").get(id, mois);
        if (existing) {
          return res.status(400).json({ error: `La mensualité de ${mois} a déjà été payée pour cet élève.` });
        }
      } else if (type_paiement === 'Inscription') {
        const existing = db.prepare("SELECT id FROM paiements_eleves WHERE eleve_id = ? AND type_paiement = 'Inscription'").get(id);
        if (existing) {
          return res.status(400).json({ error: "Les frais d'inscription ont déjà été payés pour cet élève." });
        }
      }

      const stmt = db.prepare(`
        INSERT INTO paiements_eleves (eleve_id, type_paiement, mois, montant, date_paiement, recu_numero)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(id, type_paiement, mois || null, montant, now.toISOString(), recu_numero);
      res.status(201).json({ id: info.lastInsertRowid, recu_numero });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/paiements/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM paiements_eleves WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- Gestion des Paies du Personnel ---
  app.get("/api/paies", (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM paies_personnel ORDER BY date_paiement DESC').all();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/paies", (req, res) => {
    const { enseignant_id, nom, prenom, role_personnel, mois, montant } = req.body;
    try {
      const recu_numero = `PAY-${Date.now().toString().slice(-4)}`;
      const stmt = db.prepare(`
        INSERT INTO paies_personnel (enseignant_id, nom, prenom, role_personnel, mois, montant, date_paiement, recu_numero)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        enseignant_id || null,
        nom,
        prenom,
        role_personnel,
        mois,
        montant,
        new Date().toISOString(),
        recu_numero
      );

      // Si c'est un enseignant, on met à jour son statut_paiement_mois
      if (role_personnel === 'Enseignant' && enseignant_id) {
        db.prepare("UPDATE enseignants SET statut_paiement_mois = 'Payé' WHERE id = ?").run(enseignant_id);
      }

      res.status(201).json({ id: info.lastInsertRowid, recu_numero });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/paies/:id", (req, res) => {
    const { id } = req.params;
    try {
      const paie = db.prepare("SELECT role_personnel, enseignant_id FROM paies_personnel WHERE id = ?").get(id) as any;
      if (paie && paie.role_personnel === 'Enseignant' && paie.enseignant_id) {
        db.prepare("UPDATE enseignants SET statut_paiement_mois = 'En attente' WHERE id = ?").run(paie.enseignant_id);
      }
      db.prepare('DELETE FROM paies_personnel WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });


  // 7. Articles & Mouvements de stock
  app.get("/api/categories-logistique", (req, res) => {
    try {
      const rows = db.prepare('SELECT nom FROM categories_logistique ORDER BY nom ASC').all() as any[];
      res.json(rows.map(r => r.nom));
    } catch (error) {
      res.status(500).json({ error: "Impossible de charger les catégories" });
    }
  });

  app.post("/api/categories-logistique", (req, res) => {
    const { nom } = req.body;
    if (!nom || typeof nom !== 'string' || nom.trim() === '') {
      return res.status(400).json({ error: "Nom de catégorie invalide" });
    }
    try {
      const stmt = db.prepare("INSERT INTO categories_logistique (nom) VALUES (?)");
      stmt.run(nom.trim());
      res.status(201).json({ success: true, nom: nom.trim() });
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Cette catégorie existe déjà" });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/articles", (req, res) => {
    const { reference, nom, categorie, quantite, unite, seuil_alerte } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO articles (reference, nom, categorie, quantite, unite, seuil_alerte)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(reference, nom, categorie, quantite || 0, unite, seuil_alerte || 0);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "La référence de l'article existe déjà" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/articles", (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM articles ORDER BY nom ASC').all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Impossible de charger les articles" });
    }
  });

  app.put("/api/articles/:id", (req, res) => {
    const { id } = req.params;
    const { nom, reference, categorie, quantite, unite, seuil_alerte } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE articles SET nom = ?, reference = ?, categorie = ?, quantite = ?, unite = ?, seuil_alerte = ?
        WHERE id = ?
      `);
      stmt.run(nom, reference, categorie, quantite, unite, seuil_alerte, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/mouvements", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT mouvements_stock.*, articles.nom as article_nom 
        FROM mouvements_stock 
        JOIN articles ON mouvements_stock.article_id = articles.id
        ORDER BY mouvements_stock.date_mouvement DESC
      `).all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Impossible de charger l'historique des mouvements" });
    }
  });

  app.post("/api/mouvements", (req, res) => {
    const { article_id, type_mouvement, quantite, motif } = req.body;
    try {
      // Démarrer une transaction pour mettre à jour l'inventaire en même temps
      const transaction = db.transaction(() => {
        const insertStmt = db.prepare(`
          INSERT INTO mouvements_stock (article_id, type_mouvement, quantite, motif, date_mouvement)
          VALUES (?, ?, ?, ?, ?)
        `);
        const info = insertStmt.run(article_id, type_mouvement, quantite, motif, new Date().toISOString());

        const updateStmt = db.prepare(`
          UPDATE articles 
          SET quantite = CASE 
            WHEN ? = 'Entrée' THEN quantite + ?
            ELSE MAX(0, quantite - ?)
          END
          WHERE id = ?
        `);
        updateStmt.run(type_mouvement, quantite, quantite, article_id);
        
        return info.lastInsertRowid;
      });

      const movementId = transaction();
      res.status(201).json({ id: movementId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 8. Santé : Fiches & Consultations médicales
  app.get("/api/fiches-medicales", (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM fiches_medicales').all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Erreur fiches médicales" });
    }
  });

  app.put("/api/fiches-medicales/:eleve_id", (req, res) => {
    const { eleve_id } = req.params;
    const { groupe_sanguin, poids, allergies, antecedents, contact_urgence_nom, contact_urgence_tel } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO fiches_medicales (eleve_id, groupe_sanguin, poids, allergies, antecedents, contact_urgence_nom, contact_urgence_tel)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(eleve_id) DO UPDATE SET
          groupe_sanguin = excluded.groupe_sanguin,
          poids = excluded.poids,
          allergies = excluded.allergies,
          antecedents = excluded.antecedents,
          contact_urgence_nom = excluded.contact_urgence_nom,
          contact_urgence_tel = excluded.contact_urgence_tel
      `);
      stmt.run(eleve_id, groupe_sanguin, poids || null, allergies, antecedents, contact_urgence_nom, contact_urgence_tel);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/consultations", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT consultations_medicales.*, 
               eleves.nom as eleve_nom, 
               eleves.prenom as eleve_prenom 
        FROM consultations_medicales 
        JOIN eleves ON consultations_medicales.eleve_id = eleves.id
        ORDER BY consultations_medicales.date_consultation DESC
      `).all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Erreur consultations" });
    }
  });

  app.post("/api/consultations", (req, res) => {
    const { eleve_id, symptomes, diagnostic, traitement, statut_eleve } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO consultations_medicales (eleve_id, date_consultation, symptomes, diagnostic, traitement, statut_eleve)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(eleve_id, new Date().toISOString(), symptomes, diagnostic, traitement, statut_eleve);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 9. Communications (Modèles & SMS SMPP)
  app.get("/api/templates", (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM message_templates ORDER BY id ASC').all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Erreur modèles" });
    }
  });

  app.post("/api/templates", (req, res) => {
    const { titre, canal, contenu } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO message_templates (titre, canal, contenu) VALUES (?, ?, ?)');
      const info = stmt.run(titre, canal, contenu);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/logs-communication", (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM logs_communication ORDER BY date_envoi DESC').all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Erreur journal" });
    }
  });

  app.post("/api/sms/send-bulk", async (req, res) => {
    const { targets } = req.body; // Array de { parent_nom, telephone, message }
    if (!targets || !Array.isArray(targets)) {
      return res.status(400).json({ error: "Format incorrect: targets requis." });
    }

    try {
      let successCount = 0;
      const insertLog = db.prepare(`
        INSERT INTO logs_communication (parent_nom, telephone, message, statut, date_envoi)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const target of targets) {
        const finalStatus = await sendSMS(target.telephone, target.message);
        insertLog.run(target.parent_nom, target.telephone, target.message, finalStatus, new Date().toISOString());
        if (finalStatus === 'Distribué') successCount++;
      }

      res.json({ success: true, total: targets.length, successCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 10. Utilisateurs (CRUD)
  app.get("/api/utilisateurs", (req, res) => {
    try {
      const rows = db.prepare('SELECT id, nom, prenom, email, role, statut, date_creation FROM utilisateurs ORDER BY date_creation DESC').all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Erreur utilisateurs" });
    }
  });

  app.post("/api/utilisateurs", (req, res) => {
    const { nom, prenom, email, role, statut, mot_de_passe } = req.body;
    try {
      const roleExists = db.prepare("SELECT 1 FROM roles WHERE code = ?").get(role);
      if (!roleExists) {
        return res.status(400).json({ error: "Rôle invalide ou inexistant." });
      }
      const stmt = db.prepare(`
        INSERT INTO utilisateurs (nom, prenom, email, role, statut, mot_de_passe, date_creation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(nom, prenom, email, role, statut || 'Actif', mot_de_passe || 'Temporary123', new Date().toISOString());
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/utilisateurs/:id/toggle", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare(`
        UPDATE utilisateurs 
        SET statut = CASE WHEN statut = 'Actif' THEN 'Suspendu' ELSE 'Actif' END 
        WHERE id = ?
      `).run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/utilisateurs/:id/role", (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Le rôle est requis." });
    }
    try {
      const roleExists = db.prepare("SELECT 1 FROM roles WHERE code = ?").get(role);
      if (!roleExists) {
        return res.status(400).json({ error: "Rôle invalide ou inexistant." });
      }
      db.prepare('UPDATE utilisateurs SET role = ? WHERE id = ?').run(role, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/utilisateurs/:id/password", (req, res) => {
    const { id } = req.params;
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    try {
      const user = db.prepare("SELECT * FROM utilisateurs WHERE id = ?").get(id) as any;
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      }
      if (user.mot_de_passe !== ancien_mot_de_passe) {
        return res.status(400).json({ error: "Le mot de passe actuel est incorrect." });
      }
      db.prepare("UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?").run(nouveau_mot_de_passe, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- ROLES CRUD ---
  app.get("/api/roles", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM roles ORDER BY id ASC").all() as any[];
      const parsed = rows.map(r => ({
        ...r,
        permissions: JSON.parse(r.permissions)
      }));
      res.json(parsed);
    } catch (error: any) {
      res.status(500).json({ error: "Erreur lors de la récupération des rôles: " + error.message });
    }
  });

  app.post("/api/roles", (req, res) => {
    const { code, libelle, permissions, description } = req.body;
    if (!code || !libelle || !Array.isArray(permissions)) {
      return res.status(400).json({ error: "Champs requis invalides ou manquants." });
    }
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');
    try {
      const stmt = db.prepare(`
        INSERT INTO roles (code, libelle, permissions, description)
        VALUES (?, ?, ?, ?)
      `);
      const info = stmt.run(cleanCode, libelle.trim(), JSON.stringify(permissions), description || '');
      res.status(201).json({ id: info.lastInsertRowid, code: cleanCode });
    } catch (error: any) {
      res.status(400).json({ error: "Erreur lors de la création du rôle (le code doit être unique) : " + error.message });
    }
  });

  app.put("/api/roles/:id", (req, res) => {
    const { id } = req.params;
    const { libelle, permissions, description } = req.body;
    if (!libelle || !Array.isArray(permissions)) {
      return res.status(400).json({ error: "Libellé et permissions requis." });
    }
    try {
      const role = db.prepare("SELECT code FROM roles WHERE id = ?").get(id) as any;
      if (!role) {
        return res.status(404).json({ error: "Rôle non trouvé." });
      }
      if (role.code === 'SUPER_ADMIN') {
        return res.status(400).json({ error: "Impossible de modifier le rôle SUPER_ADMIN." });
      }
      db.prepare(`
        UPDATE roles
        SET libelle = ?, permissions = ?, description = ?
        WHERE id = ?
      `).run(libelle.trim(), JSON.stringify(permissions), description || '', id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/roles/:id", (req, res) => {
    const { id } = req.params;
    try {
      const role = db.prepare("SELECT code FROM roles WHERE id = ?").get(id) as any;
      if (!role) {
        return res.status(404).json({ error: "Rôle non trouvé." });
      }
      if (role.code === 'SUPER_ADMIN') {
        return res.status(400).json({ error: "Impossible de supprimer le rôle SUPER_ADMIN." });
      }
      const userCount = db.prepare("SELECT COUNT(*) as count FROM utilisateurs WHERE role = ?").get(role.code) as any;
      if (userCount && userCount.count > 0) {
        return res.status(400).json({ error: `Impossible de supprimer ce rôle car ${userCount.count} utilisateur(s) y sont encore associés.` });
      }
      db.prepare("DELETE FROM roles WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 11. Logs d'audit (Lecture seule)
  app.get("/api/audit-logs", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT logs_activite.*, 
               (utilisateurs.prenom || ' ' || utilisateurs.nom) as utilisateur_nom 
        FROM logs_activite 
        JOIN utilisateurs ON logs_activite.utilisateur_id = utilisateurs.id
        ORDER BY logs_activite.date_heure DESC
      `).all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Erreur logs" });
    }
  });

  app.post("/api/audit-logs", (req, res) => {
    const { utilisateur_id, action, adresse_ip } = req.body;
    try {
      db.prepare('INSERT INTO logs_activite (utilisateur_id, action, adresse_ip) VALUES (?, ?, ?)')
        .run(utilisateur_id, action, adresse_ip || '127.0.0.1');
      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 12. Dortoirs & Lits (Pour l'hébergement)
  app.get("/api/dortoirs", (req, res) => {
    try {
      const list = db.prepare('SELECT * FROM dortoirs').all() as any[];
      const mappedDortoirs = list.map(d => {
        const occupants = db.prepare(`
          SELECT id, matricule, nom, prenom, photo_url, lit_numero 
          FROM eleves 
          WHERE dortoir_id = ? AND statut = 'Actif'
        `).all(d.id);
        return {
          ...d,
          occupants
        };
      });
      res.json(mappedDortoirs);
    } catch (error) {
      res.status(500).json({ error: "Erreur dortoirs" });
    }
  });

  app.post("/api/dortoirs", (req, res) => {
    const { nom, capacite_lits } = req.body;
    if (!nom || !capacite_lits) {
      return res.status(400).json({ error: "Le nom et la capacité sont requis." });
    }
    const capacity = Number(capacite_lits);
    if (isNaN(capacity) || capacity <= 0) {
      return res.status(400).json({ error: "La capacité doit être un nombre supérieur à 0." });
    }
    try {
      const stmt = db.prepare('INSERT INTO dortoirs (nom, capacite_lits) VALUES (?, ?)');
      const info = stmt.run(nom, capacity);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Un dortoir portant ce nom existe déjà." });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  app.put("/api/dortoirs/:id", (req, res) => {
    const { id } = req.params;
    const { nom, capacite_lits } = req.body;
    if (!nom || !capacite_lits) {
      return res.status(400).json({ error: "Le nom et la capacité sont requis." });
    }
    const capacity = Number(capacite_lits);
    if (isNaN(capacity) || capacity <= 0) {
      return res.status(400).json({ error: "La capacité doit être un nombre supérieur à 0." });
    }
    try {
      // Check if there are active occupants with bed number > capacity
      const occupants = db.prepare(`
        SELECT COUNT(*) as count 
        FROM eleves 
        WHERE dortoir_id = ? AND lit_numero > ? AND statut = 'Actif'
      `).get(id, capacity) as any;
      if (occupants && occupants.count > 0) {
        return res.status(400).json({ 
          error: `Impossible de réduire la capacité à ${capacity} car certains lits occupés dépassent cette limite.` 
        });
      }

      const stmt = db.prepare('UPDATE dortoirs SET nom = ?, capacite_lits = ? WHERE id = ?');
      stmt.run(nom, capacity, id);
      res.json({ success: true });
    } catch (error: any) {
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Un dortoir portant ce nom existe déjà." });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  app.delete("/api/dortoirs/:id", (req, res) => {
    const { id } = req.params;
    try {
      // Check if dortoir contains any active students
      const occupants = db.prepare(`
        SELECT COUNT(*) as count 
        FROM eleves 
        WHERE dortoir_id = ? AND statut = 'Actif'
      `).get(id) as any;
      if (occupants && occupants.count > 0) {
        return res.status(400).json({ 
          error: "Impossible de supprimer ce dortoir car il contient encore des élèves." 
        });
      }

      db.prepare('DELETE FROM dortoirs WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });


  // 13. Téléchargement Sauvegarde DB
  app.get("/api/backup", (req, res) => {
    try {
      if (fs.existsSync(dbPath)) {
        res.download(dbPath, `backup_sama_daara_${new Date().toISOString().substring(0, 10)}.db`);
      } else {
        res.status(404).json({ error: "Fichier de base de données introuvable." });
      }
    } catch (error) {
      res.status(500).json({ error: "Erreur lors du téléchargement de la sauvegarde." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
