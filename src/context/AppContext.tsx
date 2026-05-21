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
  UserRole,
  Role
} from '../types';
import { translations, Language } from '../lib/translations';

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
  categoriesLogistique: string[];
  roles: Role[];
}

interface AppContextType extends AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  updateEleve: (eleve: Eleve) => Promise<boolean>;
  addEleve: (eleve: Omit<Eleve, 'id' | 'date_inscription'>) => Promise<boolean>;
  deleteEleve: (id: number) => Promise<boolean>;
  addConsultation: (consultation: ConsultationMedicale) => Promise<void>;
  updateFicheMedicale: (fiche: FicheMedicale) => Promise<void>;
  updateArticle: (article: Article) => Promise<void>;
  addArticle: (article: Omit<Article, 'id'>) => Promise<boolean>;
  addCategoryLogistique: (nom: string) => Promise<boolean>;
  addMouvement: (mouvement: StockMovement) => Promise<void>;
  addDon: (don: Don) => Promise<void>;
  addDepense: (depense: Depense) => Promise<void>;
  addUtilisateur: (user: Omit<Utilisateur, 'id' | 'date_creation'>) => Promise<void>;
  toggleUserStatus: (id: number) => Promise<void>;
  updateUserRole: (id: number, role: UserRole) => Promise<boolean>;
  canAccess: (tabId: string) => boolean;
  login: (email: string, mdp: string) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
  addEnseignant: (enseignant: Omit<Enseignant, 'id' | 'nb_eleves' | 'matricule'>) => Promise<boolean>;
  updateEnseignant: (enseignant: Enseignant) => Promise<boolean>;
  deleteEnseignant: (id: number) => Promise<boolean>;
  addRole: (role: Omit<Role, 'id'>) => Promise<boolean>;
  updateRole: (role: Role) => Promise<boolean>;
  deleteRole: (id: number) => Promise<boolean>;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => {
    const saved = localStorage.getItem('sunudaara_lang');
    return (saved as Language) || 'fr';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('sunudaara_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations.fr;
    return (dict as any)[key] || key;
  };

  const [state, setState] = React.useState<AppState>({
    eleves: [],
    enseignants: [],
    articles: [],
    mouvements: [],
    fichesMedicales: [],
    consultations: [],
    templates: [],
    logs: [],
    dons: [],
    depenses: [],
    utilisateurs: [],
    auditLogs: [],
    currentUser: null,
    isAuthenticated: false,
    categoriesLogistique: [],
    roles: [],
  });

  // Charger toutes les données depuis le backend
  const refreshData = async () => {
    try {
      const [
        elevesRes, enseignantsRes, articlesRes, mouvementsRes,
        fichesRes, consultationsRes, templatesRes, logsRes,
        donsRes, depensesRes, utilisateursRes, auditLogsRes,
        categoriesRes, rolesRes
      ] = await Promise.all([
        fetch('/api/eleves').then(r => r.json()),
        fetch('/api/enseignants').then(r => r.json()),
        fetch('/api/articles').then(r => r.json()),
        fetch('/api/mouvements').then(r => r.json()),
        fetch('/api/fiches-medicales').then(r => r.json()),
        fetch('/api/consultations').then(r => r.json()),
        fetch('/api/templates').then(r => r.json()),
        fetch('/api/logs-communication').then(r => r.json()),
        fetch('/api/dons').then(r => r.json()),
        fetch('/api/depenses').then(r => r.json()),
        fetch('/api/utilisateurs').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/categories-logistique').then(r => r.json()),
        fetch('/api/roles').then(r => r.json())
      ]);

      setState(prev => ({
        ...prev,
        eleves: elevesRes,
        enseignants: enseignantsRes,
        articles: articlesRes,
        mouvements: mouvementsRes,
        fichesMedicales: fichesRes,
        consultations: consultationsRes,
        templates: templatesRes,
        logs: logsRes,
        dons: donsRes,
        depenses: depensesRes,
        utilisateurs: utilisateursRes,
        auditLogs: auditLogsRes,
        categoriesLogistique: Array.isArray(categoriesRes) ? categoriesRes : [],
        roles: Array.isArray(rolesRes) ? rolesRes : []
      }));
    } catch (err) {
      console.error('Erreur lors du chargement des données API :', err);
    }
  };

  // Charger les données dès l'authentification
  React.useEffect(() => {
    refreshData();
  }, [state.isAuthenticated]);

  const login = async (email: string, mdp: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: mdp })
      });
      if (res.ok) {
        const user = await res.json();
        setState(prev => ({ ...prev, currentUser: user, isAuthenticated: true }));
        
        // Journaliser la connexion
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: user.id,
            action: "S'est connecté à la plateforme",
            adresse_ip: "127.0.0.1"
          })
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null, isAuthenticated: false }));
  };

  const canAccess = (tabId: string): boolean => {
    if (!state.currentUser) return false;
    const userRole = state.currentUser.role;
    if (userRole === 'SUPER_ADMIN') return true;
    if (tabId === 'dashboard') return true;
    
    const matchedRole = state.roles.find(r => r.code === userRole);
    if (!matchedRole) {
      switch (tabId) {
        case 'eleves': return userRole === 'ENSEIGNANT' || userRole === 'INTENDANT';
        case 'logistique': return userRole === 'INTENDANT';
        case 'logement': return userRole === 'INTENDANT';
        case 'sante': return userRole === 'MEDECIN';
        case 'communications': return userRole === 'ENSEIGNANT';
        default: return false;
      }
    }
    
    return matchedRole.permissions.includes(tabId);
  };

  const addUtilisateur = async (user: Omit<Utilisateur, 'id' | 'date_creation'>) => {
    try {
      const res = await fetch('/api/utilisateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        const createdUser = await res.json();
        // Log Audit
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: state.currentUser?.id || 0,
            action: `A créé l'utilisateur ${user.prenom} ${user.nom}`,
            adresse_ip: '127.0.0.1'
          })
        });
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleUserStatus = async (id: number) => {
    try {
      const res = await fetch(`/api/utilisateurs/${id}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserRole = async (id: number, role: UserRole) => {
    try {
      const res = await fetch(`/api/utilisateurs/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        // Log Audit
        const targetUser = state.utilisateurs.find(u => u.id === id);
        const targetName = targetUser ? `${targetUser.prenom} ${targetUser.nom}` : `ID: ${id}`;
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: state.currentUser?.id || 0,
            action: `A changé le rôle de l'utilisateur ${targetName} en ${role}`,
            adresse_ip: '127.0.0.1'
          })
        });
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addDon = async (don: Don) => {
    try {
      const res = await fetch('/api/dons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(don)
      });
      if (res.ok) {
        // Log Audit
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: state.currentUser?.id || 0,
            action: `A enregistré un don de ${don.montant.toLocaleString()} CFA de ${don.donateur_nom}`
          })
        });
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addDepense = async (depense: Depense) => {
    try {
      const res = await fetch('/api/depenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depense)
      });
      if (res.ok) {
        // Log Audit
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: state.currentUser?.id || 0,
            action: `A enregistré une dépense de ${depense.montant.toLocaleString()} CFA : "${depense.libelle}"`
          })
        });
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addEleve = async (eleve: Omit<Eleve, 'id' | 'date_inscription'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/eleves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eleve)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateEleve = async (updatedEleve: Eleve): Promise<boolean> => {
    try {
      const res = await fetch(`/api/eleves/${updatedEleve.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEleve)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteEleve = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/eleves/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addConsultation = async (consultation: ConsultationMedicale) => {
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultation)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateFicheMedicale = async (updatedFiche: FicheMedicale) => {
    try {
      const res = await fetch(`/api/fiches-medicales/${updatedFiche.eleve_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFiche)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateArticle = async (updatedArticle: Article) => {
    try {
      const res = await fetch(`/api/articles/${updatedArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addArticle = async (article: Omit<Article, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addCategoryLogistique = async (nom: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/categories-logistique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addMouvement = async (mouvement: StockMovement) => {
    try {
      const res = await fetch('/api/mouvements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mouvement)
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addEnseignant = async (enseignant: Omit<Enseignant, 'id' | 'nb_eleves' | 'matricule'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/enseignants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enseignant)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateEnseignant = async (enseignant: Enseignant): Promise<boolean> => {
    try {
      const res = await fetch(`/api/enseignants/${enseignant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enseignant)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteEnseignant = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/enseignants/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addRole = async (role: Omit<Role, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role)
      });
      if (res.ok) {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: state.currentUser?.id || 0,
            action: `A créé le rôle personnalisé ${role.libelle} (${role.code})`,
            adresse_ip: '127.0.0.1'
          })
        });
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateRole = async (role: Role): Promise<boolean> => {
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role)
      });
      if (res.ok) {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: state.currentUser?.id || 0,
            action: `A modifié le rôle personnalisé ${role.libelle} (${role.code})`,
            adresse_ip: '127.0.0.1'
          })
        });
        await refreshData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteRole = async (id: number): Promise<boolean> => {
    try {
      const role = state.roles.find(r => r.id === id);
      const res = await fetch(`/api/roles/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utilisateur_id: state.currentUser?.id || 0,
            action: `A supprimé le rôle personnalisé ${role?.libelle || id}`,
            adresse_ip: '127.0.0.1'
          })
        });
        await refreshData();
        return true;
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erreur lors de la suppression du rôle.");
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ 
      ...state, 
      language,
      setLanguage,
      t,
      addEleve, 
      updateEleve, 
      deleteEleve, 
      addConsultation, 
      updateFicheMedicale,
      updateArticle, 
      addArticle,
      addCategoryLogistique,
      addMouvement,
      addDon,
      addDepense,
      addUtilisateur,
      toggleUserStatus,
      updateUserRole,
      canAccess,
      login,
      logout,
      refreshData,
      addEnseignant,
      updateEnseignant,
      deleteEnseignant,
      addRole,
      updateRole,
      deleteRole
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
