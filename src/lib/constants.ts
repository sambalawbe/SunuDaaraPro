import { Enseignant, Eleve, FicheMedicale, ConsultationMedicale, Article, StockMovement, MessageTemplate, CommunicationLog } from '@/src/types';

export const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: 1,
    titre: 'Remerciement Donateurs',
    canal: 'SMS',
    contenu: 'Cher [Nom_Donateur], nous avons bien reçu votre don de [Montant] CFA. Qu\'Allah vous récompense de la meilleure des manières. Cordialement, Daara Sunu.'
  },
  {
    id: 2,
    titre: 'Lettre aux Parrains',
    canal: 'WhatsApp',
    contenu: 'Assalamou Aleykoum [Nom_Parrain], nous sommes heureux de vous partager les progrès de [Nom_Eleve] ce mois-ci. Il a mémorisé [Hizb] Hizb. Merci pour votre soutien précieux.'
  },
  {
    id: 3,
    titre: 'Alerte Santé',
    canal: 'SMS',
    contenu: 'Alerte Info: [Nom_Eleve] présente des symptômes de [Diagnostic]. Merci de nous contacter d\'urgence au secrétariat.'
  }
];

export const MOCK_COMMUNICATION_LOGS: CommunicationLog[] = [
  {
    id: 1,
    parent_nom: 'Moussa Sy',
    telephone: '+221 77 123 45 67',
    message: 'Cher Moussa Sy, nous avons bien reçu votre don de 50 000 CFA. Qu\'Allah vous récompense...',
    date_envoi: '2024-05-15T09:00:00Z',
    statut: 'Distribué'
  },
  {
    id: 2,
    parent_nom: 'Fatou Fall',
    telephone: '+221 78 987 65 43',
    message: 'Assalamou Aleykoum Fatou Fall, vous êtes conviés à la réunion des parents d\'élèves...',
    date_envoi: '2024-05-14T11:30:00Z',
    statut: 'Envoyé'
  },
  {
    id: 3,
    parent_nom: 'Omar Sow',
    telephone: '+221 70 555 44 33',
    message: 'Rappel: Fin de trimestre pour Khady. Bulletin disponible.',
    date_envoi: '2024-05-10T16:00:00Z',
    statut: 'Échoué'
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    reference: 'ALIM-001',
    nom: 'Sac de riz 50kg',
    categorie: 'Alimentation',
    quantite: 100,
    unite: 'Sacs',
    seuil_alerte: 10
  },
  {
    id: 2,
    reference: 'ALIM-002',
    nom: 'Bidon huile 20L',
    categorie: 'Alimentation',
    quantite: 2,
    unite: 'Bidons',
    seuil_alerte: 5
  },
  {
    id: 3,
    reference: 'MAT-001',
    nom: 'Natte de prière',
    categorie: 'Literie',
    quantite: 0,
    unite: 'Unités',
    seuil_alerte: 15
  },
  {
    id: 4,
    reference: 'PED-001',
    nom: 'Mouchaf (Coran)',
    categorie: 'Matériel Pédagogique',
    quantite: 45,
    unite: 'Unités',
    seuil_alerte: 10
  }
];

export const MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 1,
    article_id: 1,
    article_nom: 'Sac de riz 50kg',
    type_mouvement: 'Entrée',
    quantite: 50,
    date_mouvement: '2024-05-10T08:30:00Z',
    motif: 'Réapprovisionnement mensuel'
  },
  {
    id: 2,
    article_id: 2,
    article_nom: 'Bidon huile 20L',
    type_mouvement: 'Sortie',
    quantite: 1,
    date_mouvement: '2024-05-12T14:00:00Z',
    motif: 'Consommation cuisine'
  },
  {
    id: 3,
    article_id: 4,
    article_nom: 'Mouchaf (Coran)',
    type_mouvement: 'Entrée',
    quantite: 20,
    date_mouvement: '2024-05-14T10:00:00Z',
    motif: 'Don d\'un bienfaiteur'
  }
];

export const MOCK_TEACHERS: Enseignant[] = [
  {
    id: 1,
    matricule: 'OUSTAZ-001',
    nom: 'DIALLO',
    prenom: 'Oumar',
    telephone: '+221 77 555 11 22',
    adresse: 'Médina, Dakar',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oumar',
    specialite: 'Hafiz & Tajwid',
    competences: 'Spécialiste en lecture Warsh, 10 ans d\'expérience',
    salaire_mensuel: 150000,
    date_embauche: '2020-05-10',
    statut: 'Actif',
    statut_paiement_mois: 'Payé',
    nb_eleves: 45
  },
  {
    id: 2,
    matricule: 'OUSTAZ-002',
    nom: 'SANE',
    prenom: 'Moussa',
    telephone: '+221 76 444 33 22',
    adresse: 'Pikine, Dakar',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa',
    specialite: 'Fiqh & Hadith',
    competences: 'Diplômé de l\'Université Al-Azhar',
    salaire_mensuel: 125000,
    date_embauche: '2022-09-01',
    statut: 'Actif',
    statut_paiement_mois: 'En attente',
    nb_eleves: 38
  },
  {
    id: 3,
    matricule: 'OUSTAZ-003',
    nom: 'BA',
    prenom: 'Awa',
    telephone: '+221 70 222 99 88',
    adresse: 'Guédiawaye, Dakar',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Awa',
    specialite: 'Éducation Islamique (Tarbyya)',
    competences: 'Psychopédagogue, spécialiste petite enfance',
    salaire_mensuel: 130000,
    date_embauche: '2023-01-15',
    statut: 'Actif',
    statut_paiement_mois: 'Payé',
    nb_eleves: 25
  }
];

export const MOCK_ELEVES: Eleve[] = [
  {
    id: 1,
    matricule: 'DAARA-2024-001',
    nom: 'DIOUF',
    prenom: 'Moustapha',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moustapha',
    contact_parent: '+221 77 123 45 67',
    tuteur_nom: 'Abdou Diouf',
    niveau_actuel: 'Intermédiaire',
    niveau_hizb: 30,
    dernier_verset: 'Sourate Al-Baqarah, Verset 255',
    points_tarbyya: 110,
    statut_pension: 'Interne',
    statut_prise_en_charge: 'Parrainé',
    statut: 'Actif',
    enseignant_id: 1,
    enseignant_nom: 'Oastaz Oumar DIALLO',
    date_inscription: '2024-01-15'
  },
  {
    id: 2,
    matricule: 'DAARA-2024-002',
    nom: 'FALL',
    prenom: 'Ibrahima',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahima',
    contact_parent: '+221 78 987 65 43',
    tuteur_nom: 'Fatou Fall',
    niveau_actuel: 'Débutant',
    niveau_hizb: 5,
    dernier_verset: 'Sourate An-Nas',
    points_tarbyya: 95,
    statut_pension: 'Externe',
    statut_prise_en_charge: 'En recherche',
    statut: 'Actif',
    enseignant_id: 2,
    enseignant_nom: 'Oustaz Moussa SANE',
    date_inscription: '2024-02-10'
  }
];

import { Don, Depense } from './../types';

export const MOCK_DONS: Don[] = [
  {
    id: 1,
    donateur_nom: 'Fondation Al-Khair',
    montant: 500000,
    date_don: '2024-05-01T10:00:00Z',
    type_paiement: 'Transfert',
    assignation: 'Général',
    recu_numero: 'REC-2024-001'
  },
  {
    id: 2,
    donateur_nom: 'Moussa Sy',
    montant: 50000,
    date_don: '2024-05-10T14:30:00Z',
    type_paiement: 'Espèces',
    assignation: 'Alimentation',
    recu_numero: 'REC-2024-002'
  }
];

export const MOCK_DEPENSES: Depense[] = [
  {
    id: 1,
    libelle: 'Ravitaillement Riz et Huile',
    categorie: 'Alimentation',
    montant: 150000,
    date_depense: '2024-05-05T09:00:00Z',
  },
  {
    id: 2,
    libelle: 'Salaires des Oustaz - Mai',
    categorie: 'Salaires',
    montant: 405000,
    date_depense: '2024-05-15T16:00:00Z',
  }
];

export const MOCK_MEDICAL_RECORDS: FicheMedicale[] = [
  {
    eleve_id: 1,
    groupe_sanguin: 'A+',
    allergies: 'Pénicilline, Arachides',
    antecedents: 'Asthme léger, fracture bras gauche (2022)',
    contact_urgence_nom: 'Mme Diouf (Mère)',
    contact_urgence_tel: '+221 77 123 45 68'
  },
  {
    eleve_id: 2,
    groupe_sanguin: 'O+',
    allergies: 'Aucune',
    antecedents: 'Aucun antécédent majeur',
    contact_urgence_nom: 'M. Fall (Père)',
    contact_urgence_tel: '+221 78 987 65 44'
  }
];

export const MOCK_CONSULTATIONS: ConsultationMedicale[] = [
  {
    id: 1,
    eleve_id: 1,
    eleve_nom: 'DIOUF',
    eleve_prenom: 'Moustapha',
    date_consultation: '2024-05-15T10:30:00Z',
    symptomes: 'Fièvre élevée, maux de tête, frissons',
    diagnostic: 'Paludisme suspecté',
    traitement: 'Artéméther-luméfantrine, Paracétamol 500mg',
    statut_eleve: 'Repos'
  },
  {
    id: 2,
    eleve_id: 2,
    eleve_nom: 'FALL',
    eleve_prenom: 'Ibrahima',
    date_consultation: '2024-05-16T09:00:00Z',
    symptomes: 'Toux sèche, nez qui coule',
    diagnostic: 'Grippe légère',
    traitement: 'Sirop antitussif, Vitamine C',
    statut_eleve: 'En classe'
  },
  {
    id: 3,
    eleve_id: 1,
    eleve_nom: 'DIOUF',
    eleve_prenom: 'Moustapha',
    date_consultation: '2024-05-14T15:00:00Z',
    symptomes: 'Douleur abdominale après le déjeuner',
    diagnostic: 'Indigestion passatère',
    traitement: 'Charbon végétal',
    statut_eleve: 'En classe'
  }
];
