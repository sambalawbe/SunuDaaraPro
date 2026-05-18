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
  Depense
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
  MOCK_DEPENSES
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
}

interface AppContextType extends AppState {
  updateEleve: (eleve: Eleve) => void;
  addEleve: (eleve: Eleve) => void;
  addConsultation: (consultation: ConsultationMedicale) => void;
  updateArticle: (article: Article) => void;
  addMouvement: (mouvement: StockMovement) => void;
  addDon: (don: Don) => void;
  addDepense: (depense: Depense) => void;
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
  });

  const addDon = (don: Don) => {
    setState(prev => ({ ...prev, dons: [{ ...don, id: prev.dons.length + 1 }, ...prev.dons] }));
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
      updateArticle, 
      addMouvement,
      addDon,
      addDepense
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
