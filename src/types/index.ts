export interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  photo_url?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  contact_parent: string;
  tuteur_nom?: string;
  tuteur_adresse?: string;
  niveau_actuel: 'Débutant' | 'Intermédiaire' | 'Hafiz';
  niveau_hizb: number;
  dernier_verset?: string;
  points_tarbyya: number;
  statut_pension: 'Interne' | 'Externe';
  statut_prise_en_charge: 'Parrainé' | 'En recherche';
  statut: 'Actif' | 'Inactif' | 'Diplômé';
  dortoir_id?: number;
  lit_numero?: number;
  enseignant_id?: number;
  date_inscription: string;
  // Join fields
  enseignant_nom?: string;
  dortoir_nom?: string;
}

export interface Enseignant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  photo_url?: string;
  specialite: string;
  competences?: string;
  salaire_mensuel: number;
  date_embauche: string;
  statut: 'Actif' | 'Inactif';
  statut_paiement_mois: 'Payé' | 'En attente';
  nb_eleves?: number;
}

export interface Article {
  id: number;
  reference: string;
  nom: string;
  categorie: 'Alimentation' | 'Matériel Pédagogique' | 'Literie' | 'Entretien' | 'Autre';
  quantite: number;
  unite: string;
  seuil_alerte: number;
}

export interface StockMovement {
  id: number;
  article_id: number;
  type_mouvement: 'Entrée' | 'Sortie';
  quantite: number;
  date_mouvement: string;
  motif: string;
  // Join fields
  article_nom?: string;
}

export interface MessageTemplate {
  id: number;
  titre: string;
  canal: 'SMS' | 'WhatsApp' | 'Email';
  contenu: string;
}

export interface CommunicationLog {
  id: number;
  parent_nom: string;
  telephone: string;
  message: string;
  date_envoi: string;
  statut: 'Envoyé' | 'Distribué' | 'Échoué';
}

export interface FicheMedicale {
  eleve_id: number;
  groupe_sanguin?: string;
  allergies?: string;
  antecedents?: string;
  contact_urgence_nom?: string;
  contact_urgence_tel?: string;
}

export interface ConsultationMedicale {
  id: number;
  eleve_id: number;
  date_consultation: string;
  symptomes: string;
  diagnostic: string;
  traitement: string;
  statut_eleve: 'En classe' | 'Repos' | 'Évacué';
  // Join fields
  eleve_nom?: string;
  eleve_prenom?: string;
}

export interface Don {
  id: number;
  donateur_nom: string;
  montant: number;
  date_don: string;
  type_paiement: 'Espèces' | 'Transfert' | 'Nature';
  assignation?: string;
  recu_numero?: string;
}

export interface Depense {
  id: number;
  libelle: string;
  categorie: 'Alimentation' | 'Salaires' | 'Santé' | 'Logistique' | 'Loyer' | 'Autre';
  montant: number;
  date_depense: string;
  justificatif_url?: string;
}

export interface Stats {
  totalEleves: number;
  totalEnseignants: number;
  totalHafiz: number;
  soldeCaisse: number;
  donsMois: number;
  depensesMois: number;
}

export interface ChartData {
  name: string;
  value: number;
}
