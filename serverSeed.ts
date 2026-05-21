import Database from "better-sqlite3";

export function seedDatabase(db: Database.Database) {
  // 1. Dortoirs
  const dortoirsCount = db.prepare('SELECT COUNT(*) as count FROM dortoirs').get() as any;
  if (dortoirsCount.count === 0) {
    console.log('🌱 Seeding dortoirs...');
    const insertDortoir = db.prepare('INSERT INTO dortoirs (nom, capacite_lits) VALUES (?, ?)');
    insertDortoir.run('Dortoir Al-Azhar', 10);
    insertDortoir.run('Dortoir Medina', 8);
    insertDortoir.run('Dortoir Touba', 12);
  }

  // 2. Utilisateurs
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM utilisateurs').get() as any;
  if (usersCount.count === 0) {
    console.log('🌱 Seeding utilisateurs...');
    const insertUser = db.prepare(`
      INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, statut, date_creation) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run('Sow', 'Moussa', 'admin@sunudaara.sn', 'admin', 'SUPER_ADMIN', 'Actif', '2024-01-01T08:00:00Z');
    insertUser.run('Diop', 'Oumar', 'o.diop@sunudaara.sn', 'admin', 'INTENDANT', 'Actif', '2024-02-15T10:00:00Z');
    insertUser.run('Fall', 'Fatou', 'f.fall@sunudaara.sn', 'admin', 'MEDECIN', 'Actif', '2024-03-10T09:00:00Z');
    insertUser.run('Diallo', 'Ibrahima', 'i.diallo@sunudaara.sn', 'admin', 'ENSEIGNANT', 'Actif', '2024-03-20T11:00:00Z');
  }

  // 3. Enseignants
  const teachersCount = db.prepare('SELECT COUNT(*) as count FROM enseignants').get() as any;
  if (teachersCount.count === 0) {
    console.log('🌱 Seeding enseignants...');
    const insertTeacher = db.prepare(`
      INSERT INTO enseignants (matricule, nom, prenom, telephone, adresse, photo_url, specialite, competences, salaire_mensuel, date_embauche, statut, statut_paiement_mois)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTeacher.run('OUSTAZ-001', 'DIALLO', 'Oumar', '+221 77 555 11 22', 'Médina, Dakar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oumar', 'Hafiz & Tajwid', 'Spécialiste en lecture Warsh, 10 ans d\'expérience', 150000, '2020-05-10', 'Actif', 'Payé');
    insertTeacher.run('OUSTAZ-002', 'SANE', 'Moussa', '+221 76 444 33 22', 'Pikine, Dakar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa', 'Fiqh & Hadith', 'Diplômé de l\'Université Al-Azhar', 125000, '2022-09-01', 'Actif', 'En attente');
    insertTeacher.run('OUSTAZ-003', 'BA', 'Awa', '+221 70 222 99 88', 'Guédiawaye, Dakar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa', 'Éducation Islamique (Tarbyya)', 'Psychopédagogue, spécialiste petite enfance', 130000, '2023-01-15', 'Actif', 'Payé');
  }

  // 4. Élèves
  const elevesCount = db.prepare('SELECT COUNT(*) as count FROM eleves').get() as any;
  if (elevesCount.count === 0) {
    console.log('🌱 Seeding eleves...');
    const insertEleve = db.prepare(`
      INSERT INTO eleves (matricule, nom, prenom, photo_url, contact_parent, tuteur_nom, niveau_actuel, niveau_hizb, dernier_verset, points_tarbyya, statut_pension, statut_prise_en_charge, statut, dortoir_id, lit_numero, enseignant_id, date_inscription)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // Dortoir Al-Azhar (ID 1) Lit 1, Enseignant Oumar Diallo (ID 1)
    insertEleve.run('DAARA-2024-001', 'DIOUF', 'Moustapha', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moustapha', '+221 77 123 45 67', 'Abdou Diouf', 'Intermédiaire', 30, 'Sourate Al-Baqarah, Verset 255', 110, 'Interne', 'Parrainé', 'Actif', 1, 1, 1, '2024-01-15');
    // Dortoir Medina (ID 2) Lit 3, Enseignant Moussa Sane (ID 2)
    insertEleve.run('DAARA-2024-002', 'FALL', 'Ibrahima', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahima', '+221 78 987 65 43', 'Fatou Fall', 'Débutant', 5, 'Sourate An-Nas', 95, 'Externe', 'En recherche', 'Actif', 2, 3, 2, '2024-02-10');
  }

  // 5. Articles
  const articlesCount = db.prepare('SELECT COUNT(*) as count FROM articles').get() as any;
  if (articlesCount.count === 0) {
    console.log('🌱 Seeding articles...');
    const insertArticle = db.prepare(`
      INSERT INTO articles (reference, nom, categorie, quantite, unite, seuil_alerte)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertArticle.run('ALIM-001', 'Sac de riz 50kg', 'Alimentation', 100, 'Sacs', 10);
    insertArticle.run('ALIM-002', 'Bidon huile 20L', 'Alimentation', 2, 'Bidons', 5);
    insertArticle.run('MAT-001', 'Natte de prière', 'Literie', 0, 'Unités', 15);
    insertArticle.run('PED-001', 'Mouchaf (Coran)', 'Matériel Pédagogique', 45, 'Unités', 10);
  }

  // 6. Mouvements Stock
  const movementsCount = db.prepare('SELECT COUNT(*) as count FROM mouvements_stock').get() as any;
  if (movementsCount.count === 0) {
    console.log('🌱 Seeding mouvements_stock...');
    const insertMovement = db.prepare(`
      INSERT INTO mouvements_stock (article_id, type_mouvement, quantite, motif, date_mouvement)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertMovement.run(1, 'Entrée', 50, 'Réapprovisionnement mensuel', '2024-05-10T08:30:00Z');
    insertMovement.run(2, 'Sortie', 1, 'Consommation cuisine', '2024-05-12T14:00:00Z');
    insertMovement.run(4, 'Entrée', 20, 'Don d\'un bienfaiteur', '2024-05-14T10:00:00Z');
  }

  // 7. Modèles de Message
  const templatesCount = db.prepare('SELECT COUNT(*) as count FROM message_templates').get() as any;
  if (templatesCount.count === 0) {
    console.log('🌱 Seeding message_templates...');
    const insertTemplate = db.prepare(`
      INSERT INTO message_templates (titre, canal, contenu)
      VALUES (?, ?, ?)
    `);
    insertTemplate.run('Remerciement Donateurs', 'SMS', 'Cher [Nom_Donateur], nous avons bien reçu votre don de [Montant] CFA. Qu\'Allah vous récompense de la meilleure des manières. Cordialement, Daara Sunu.');
    insertTemplate.run('Lettre aux Parrains', 'WhatsApp', 'Assalamou Aleykoum [Nom_Parrain], nous sommes heureux de vous partager les progrès de [Nom_Eleve] ce mois-ci. Il a mémorisé [Hizb] Hizb. Merci pour votre soutien précieux.');
    insertTemplate.run('Alerte Santé', 'SMS', 'Alerte Info: [Nom_Eleve] présente des symptômes de [Diagnostic]. Merci de nous contacter d\'urgence au secrétariat.');
  }

  // 8. Logs Communication
  const commLogsCount = db.prepare('SELECT COUNT(*) as count FROM logs_communication').get() as any;
  if (commLogsCount.count === 0) {
    console.log('🌱 Seeding logs_communication...');
    const insertCommLog = db.prepare(`
      INSERT INTO logs_communication (parent_nom, telephone, message, statut, date_envoi)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertCommLog.run('Moussa Sy', '+221 77 123 45 67', 'Cher Moussa Sy, nous avons bien reçu votre don de 50 000 CFA. Qu\'Allah vous récompense...', 'Distribué', '2024-05-15T09:00:00Z');
    insertCommLog.run('Fatou Fall', '+221 78 987 65 43', 'Assalamou Aleykoum Fatou Fall, vous êtes conviés à la réunion des parents d\'élèves...', 'Envoyé', '2024-05-14T11:30:00Z');
    insertCommLog.run('Omar Sow', '+221 70 555 44 33', 'Rappel: Fin de trimestre pour Khady. Bulletin disponible.', 'Échoué', '2024-05-10T16:00:00Z');
  }

  // 9. Fiches Médicales
  const fichesCount = db.prepare('SELECT COUNT(*) as count FROM fiches_medicales').get() as any;
  if (fichesCount.count === 0) {
    console.log('🌱 Seeding fiches_medicales...');
    const insertFiche = db.prepare(`
      INSERT INTO fiches_medicales (eleve_id, groupe_sanguin, poids, allergies, antecedents, contact_urgence_nom, contact_urgence_tel)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertFiche.run(1, 'A+', 42.5, 'Pénicilline, Arachides', 'Asthme léger, fracture bras gauche (2022)', 'Mme Diouf (Mère)', '+221 77 123 45 68');
    insertFiche.run(2, 'O+', 38.0, 'Aucune', 'Aucun antécédent majeur', 'M. Fall (Père)', '+221 78 987 65 44');
  }

  // 10. Consultations Médicales
  const consultationsCount = db.prepare('SELECT COUNT(*) as count FROM consultations_medicales').get() as any;
  if (consultationsCount.count === 0) {
    console.log('🌱 Seeding consultations_medicales...');
    const insertConsultation = db.prepare(`
      INSERT INTO consultations_medicales (eleve_id, date_consultation, symptomes, diagnostic, traitement, statut_eleve)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertConsultation.run(1, '2024-05-15T10:30:00Z', 'Fièvre élevée, maux de tête, frissons', 'Paludisme suspecté', 'Artéméther-luméfantrine, Paracétamol 500mg', 'Repos');
    insertConsultation.run(2, '2024-05-16T09:00:00Z', 'Toux sèche, nez qui coule', 'Grippe légère', 'Sirop antitussif, Vitamine C', 'En classe');
    insertConsultation.run(1, '2024-05-14T15:00:00Z', 'Douleur abdominale après le déjeuner', 'Indigestion passagère', 'Charbon végétal', 'En classe');
  }

  // 11. Dons
  const donsCount = db.prepare('SELECT COUNT(*) as count FROM dons').get() as any;
  if (donsCount.count === 0) {
    console.log('🌱 Seeding dons...');
    const insertDon = db.prepare(`
      INSERT INTO dons (donateur_nom, montant, date_don, type_paiement, assignation, recu_numero)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertDon.run('Fondation Al-Khair', 500000, '2024-05-01T10:00:00Z', 'Transfert', 'Général', 'REC-2024-001');
    insertDon.run('Moussa Sy', 50000, '2024-05-10T14:30:00Z', 'Espèces', 'Alimentation', 'REC-2024-002');
  }

  // 12. Dépenses
  const depensesCount = db.prepare('SELECT COUNT(*) as count FROM depenses').get() as any;
  if (depensesCount.count === 0) {
    console.log('🌱 Seeding depenses...');
    const insertDepense = db.prepare(`
      INSERT INTO depenses (libelle, categorie, montant, date_depense, justificatif_url)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertDepense.run('Ravitaillement Riz et Huile', 'Alimentation', 150000, '2024-05-05T09:00:00Z', null);
    insertDepense.run('Salaires des Oustaz - Mai', 'Salaires', 405000, '2024-05-15T16:00:00Z', null);
  }

  // 13. Logs d'Activité
  const activityLogsCount = db.prepare('SELECT COUNT(*) as count FROM logs_activite').get() as any;
  if (activityLogsCount.count === 0) {
    console.log('🌱 Seeding logs_activite...');
    const insertActivity = db.prepare(`
      INSERT INTO logs_activite (utilisateur_id, action, date_heure, adresse_ip)
      VALUES (?, ?, ?, ?)
    `);
    insertActivity.run(1, 'A enregistré un don de 500 000 CFA', '2024-05-18T09:30:00Z', '192.168.1.10');
    insertActivity.run(2, 'A mis à jour le stock de riz (+50 sacs)', '2024-05-18T08:15:00Z', '192.168.1.15');
    insertActivity.run(1, 'A créé un nouveau compte utilisateur (Fatou Fall)', '2024-05-17T14:20:00Z', '192.168.1.10');
  }
}
