import * as React from 'react';
import { 
  Eleve, 
  Enseignant, 
  Article, 
  StockMovement, 
  FicheMedicale, 
  ConsultationMedicale, 
  MessageTemplate, 
  CommunicationLog,
  Don,
  Depense,
  Utilisateur,
  LogActivite,
  UserRole
} from '../types';
import { 
  MOCK_ELEVES, 
  MOCK_TEACHERS, 
  MOCK_ARTICLES, 
  MOCK_MOVEMENTS, 
  MOCK_MEDICAL_RECORDS, 
  MOCK_CONSULTATIONS, 
  MOCK_TEMPLATES, 
  MOCK_COMMUNICATION_LOGS,
  MOCK_DONS,
  MOCK_DEPENSES,
  MOCK_USERS,
  MOCK_ACTIVITY_LOGS
} from '../lib/constants';

interface AppState {
  eleves: Eleve[];
  enseignants: Enseignant[];
  articles: Article[];
  mouvements: StockMovement[];
  fichesMedicales: FicheMedicale[];
  consultations: ConsultationMedicale[];
  templates: MessageTemplate[];
  logs: CommunicationLog[];
  dons: Don[];
  depenses: Depense[];
  utilisateurs: Utilisateur[];
  auditLogs: LogActivite[];
  currentUser: Utilisateur | null;
  isAuthenticated: boolean;
}

interface AppContextType extends AppState {
  updateEleve: (eleve: Eleve) => void;
  addEleve: (eleve: Eleve) => void;
  addConsultation: (consultation: ConsultationMedicale) => void;
  updateFicheMedicale: (fiche: FicheMedicale) => void;
  updateArticle: (article: Article) => void;
  addMouvement: (mouvement: StockMovement) => void;
  addDon: (don: Don) => void;
  addDepense: (depense: Depense) => void;
  addUtilisateur: (user: Omit<Utilisateur, 'id' | 'date_creation'>) => void;
  toggleUserStatus: (id: number) => void;
  canAccess: (tabId: string) => boolean;
  login: (email: string, mdp: string) => boolean;
  logout: () => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>({
    eleves: MOCK_ELEVES,
    enseignants: MOCK_TEACHERS,
    articles: MOCK_ARTICLES,
    mouvements: MOCK_MOVEMENTS,
    fichesMedicales: MOCK_MEDICAL_RECORDS,
    consultations: MOCK_CONSULTATIONS,
    templates: MOCK_TEMPLATES,
    logs: MOCK_COMMUNICATION_LOGS,
    dons: MOCK_DONS,
    depenses: MOCK_DEPENSES,
    utilisateurs: MOCK_USERS,
    auditLogs: MOCK_ACTIVITY_LOGS,
    currentUser: null,
    isAuthenticated: false,
  });

  const login = (email: string, mdp: string): boolean => {
    const user = state.utilisateurs.find(u => u.email === email && u.statut === 'Actif');
    if (user && mdp === 'admin') {
      setState(prev => ({ ...prev, currentUser: user, isAuthenticated: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null, isAuthenticated: false }));
  };

  const canAccess = (tabId: string): boolean => {
    if (!state.currentUser) return false;
    const role = state.currentUser.role;
    if (role === 'SUPER_ADMIN') return true;
    
    switch (tabId) {
      case 'dashboard': return true;
      case 'eleves': return role === 'ENSEIGNANT' || role === 'INTENDANT' || role === 'SUPER_ADMIN';
      case 'enseignants': return role === 'SUPER_ADMIN';
      case 'finances': return role === 'SUPER_ADMIN';
      case 'logistique': return role === 'INTENDANT' || role === 'SUPER_ADMIN';
      case 'logement': return role === 'INTENDANT' || role === 'SUPER_ADMIN';
      case 'sante': return role === 'MEDECIN' || role === 'SUPER_ADMIN';
      case 'communications': return role === 'SUPER_ADMIN' || role === 'ENSEIGNANT';
      case 'parametres': return role === 'SUPER_ADMIN';
      default: return false;
    }
  };

  const addUtilisateur = (user: Omit<Utilisateur, 'id' | 'date_creation'>) => {
    const newUser: Utilisateur = {
      ...user,
      id: state.utilisateurs.length + 1,
      date_creation: new Date().toISOString()
    };
    setState(prev => ({ 
      ...prev, 
      utilisateurs: [newUser, ...prev.utilisateurs],
      auditLogs: [{
        id: prev.auditLogs.length + 1,
        utilisateur_id: state.currentUser?.id || 0,
        utilisateur_nom: `${state.currentUser?.prenom} ${state.currentUser?.nom}`,
        action: `A créé l'utilisateur ${user.prenom} ${user.nom}`,
        date_heure: new Date().toISOString(),
        adresse_ip: '192.168.1.10'
      }, ...prev.auditLogs]
    }));
  };

  const toggleUserStatus = (id: number) => {
    setState(prev => ({
      ...prev,
      utilisateurs: prev.utilisateurs.map(u => 
        u.id === id ? { ...u, statut: u.statut === 'Actif' ? 'Suspendu' : 'Actif' } : u
      )
    }));
  };

  const addDon = (don: Don) => {
    setState(prev => ({ 
      ...prev, 
      dons: [{ ...don, id: prev.dons.length + 1 }, ...prev.dons],
      auditLogs: [{
        id: prev.auditLogs.length + 1,
        utilisateur_id: state.currentUser?.id || 0,
        utilisateur_nom: `${state.currentUser?.prenom} ${state.currentUser?.nom}`,
        action: `A enregistré un don de ${don.montant.toLocaleString()} CFA de ${don.donateur_nom}`,
        date_heure: new Date().toISOString()
      }, ...prev.auditLogs]
    }));
  };

  const addDepense = (depense: Depense) => {
    setState(prev => ({ ...prev, depenses: [{ ...depense, id: prev.depenses.length + 1 }, ...prev.depenses] }));
  };

  const addEleve = (eleve: Eleve) => {
    setState(prev => ({ ...prev, eleves: [...prev.eleves, { ...eleve, id: prev.eleves.length + 1 }] }));
  };

  const updateEleve = (updatedEleve: Eleve) => {
    setState(prev => ({
      ...prev,
      eleves: prev.eleves.map(e => e.id === updatedEleve.id ? updatedEleve : e)
    }));
  };

  const addConsultation = (consultation: ConsultationMedicale) => {
    setState(prev => ({
      ...prev,
      consultations: [{ ...consultation, id: prev.consultations.length + 1 }, ...prev.consultations]
    }));
  };

  const updateFicheMedicale = (updatedFiche: FicheMedicale) => {
    setState(prev => ({
      ...prev,
      fichesMedicales: prev.fichesMedicales.map(f => f.eleve_id === updatedFiche.eleve_id ? updatedFiche : f)
    }));
  };

  const updateArticle = (updatedArticle: Article) => {
    setState(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id === updatedArticle.id ? updatedArticle : a)
    }));
  };

  const addMouvement = (mouvement: StockMovement) => {
    setState(prev => {
      const article = prev.articles.find(a => a.id === mouvement.article_id);
      if (!article) return prev;

      const newQty = mouvement.type_mouvement === 'Entrée' 
        ? article.quantite + mouvement.quantite 
        : article.quantite - mouvement.quantite;

      const updatedArticles = prev.articles.map(a => 
        a.id === mouvement.article_id ? { ...a, quantite: Math.max(0, newQty) } : a
      );

      return {
        ...prev,
        articles: updatedArticles,
        mouvements: [{ ...mouvement, id: prev.mouvements.length + 1 }, ...prev.mouvements]
      };
    });
  };

  return (
    <AppContext.Provider value={{ 
      ...state, 
      addEleve, 
      updateEleve, 
      addConsultation, 
      updateFicheMedicale,
      updateArticle, 
      addMouvement,
      addDon,
      addDepense,
      addUtilisateur,
      toggleUserStatus,
      canAccess,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
