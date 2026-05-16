import * as React from 'react';
import { 
  Package, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  MoreVertical,
  X,
  PlusCircle,
  MinusCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Article, StockMovement } from '@/src/types';
import { MOCK_ARTICLES, MOCK_MOVEMENTS } from '@/src/lib/constants';

export function Inventory() {
  const [activeView, setActiveView] = React.useState<'stock' | 'history'>('stock');
  const [isArticleModalOpen, setIsArticleModalOpen] = React.useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const articlesCritiquesCount = MOCK_ARTICLES.filter(a => a.quantite <= a.seuil_alerte).length;
  const totalArticles = MOCK_ARTICLES.length;

  const filteredArticles = MOCK_ARTICLES.filter(a => 
    a.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (article: Article) => {
    if (article.quantite === 0) return { label: 'Rupture', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    if (article.quantite <= article.seuil_alerte) return { label: 'Stock Bas', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle };
    return { label: 'En Stock', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logistique & Inventaire</h1>
          <p className="text-gray-500 text-sm">Gestion des stocks et des mouvements de matériel.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsArticleModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Article</span>
          </button>
          <button 
            onClick={() => setIsMovementModalOpen(true)}
            className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-700/20 flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Mouvement</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={Package} 
          label="Total Articles" 
          value={totalArticles} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Alertes Stock" 
          value={articlesCritiquesCount} 
          color="bg-red-50 text-red-600" 
        />
        <StatCard 
          icon={ArrowUpRight} 
          label="Entrées (Mois)" 
          value="24" 
          color="bg-blue-50 text-blue-600" 
          trend="+12%"
        />
        <StatCard 
          icon={ArrowDownLeft} 
          label="Sorties (Mois)" 
          value="18" 
          color="bg-orange-50 text-orange-600" 
        />
      </div>

      {/* Tabs Control */}
      <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm inline-flex">
        <button 
          onClick={() => setActiveView('stock')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeView === 'stock' ? "bg-green-700 text-white shadow-md shadow-green-700/20" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Package className="w-4 h-4" />
          Stock Actuel
        </button>
        <button 
          onClick={() => setActiveView('history')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeView === 'history' ? "bg-green-700 text-white shadow-md shadow-green-700/20" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <History className="w-4 h-4" />
          Historique
        </button>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeView === 'stock' ? (
          <motion.div 
            key="stock-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Référence ou nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div className="flex gap-2">
                <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none">
                  <option>Toutes les catégories</option>
                  <option>Alimentation</option>
                  <option>Pédagogique</option>
                </select>
                <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto text-black">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Article</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4">Quantité en Stock</th>
                    <th className="px-6 py-4">Seuil Alerte</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 italic">
                  {filteredArticles.map((article) => {
                    const status = getStockStatus(article);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{article.nom}</p>
                              <p className="text-[10px] text-gray-400 font-mono tracking-tighter">REF: {article.reference}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-lg italic">
                            {article.categorie}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {article.quantite} {article.unite}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 italic">
                          {article.seuil_alerte} {article.unite}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 w-fit italic",
                            status.color
                          )}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 text-gray-400 hover:text-green-600">
                              <FileText className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 text-gray-400 hover:text-green-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-black"
          >
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest italic">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Article</th>
                    <th className="px-6 py-4">Quantité</th>
                    <th className="px-6 py-4">Motif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 italic">
                  {MOCK_MOVEMENTS.map((mv) => (
                    <tr key={mv.id} className="hover:bg-gray-50 transition-colors italic">
                      <td className="px-6 py-4 text-xs text-gray-500 italic">
                        {new Date(mv.date_mouvement).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          mv.type_mouvement === 'Entrée' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {mv.type_mouvement}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800 italic">
                        {mv.article_nom}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "font-bold italic",
                          mv.type_mouvement === 'Entrée' ? "text-green-600" : "text-red-600"
                        )}>
                          {mv.type_mouvement === 'Entrée' ? '+' : '-'}{mv.quantite}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 italic">
                        {mv.motif}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals placeholders for logic */}
      <AnimatePresence>
        {isArticleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsArticleModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col italic"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white italic">
                <h2 className="text-xl font-bold text-gray-800 italic">Nouvel Article</h2>
                <button onClick={() => setIsArticleModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full italic">
                  <X className="w-6 h-6 italic" />
                </button>
              </div>
              <div className="p-8 space-y-6 text-black italic">
                <div className="grid grid-cols-2 gap-6 italic">
                   <div className="space-y-2 italic">
                    <label className="text-xs font-bold text-gray-400 uppercase italic">Référence</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 italic" placeholder="REF-001" />
                  </div>
                  <div className="space-y-2 italic">
                    <label className="text-xs font-bold text-gray-400 uppercase italic">Catégorie</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 italic">
                      <option>Alimentation</option>
                      <option>Matériel Pédagogique</option>
                      <option>Literie</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2 italic">
                  <label className="text-xs font-bold text-gray-400 uppercase italic">Nom de l'Article</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 italic" placeholder="Ex: Sac de Riz" />
                </div>
                <div className="grid grid-cols-2 gap-6 italic">
                   <div className="space-y-2 italic">
                    <label className="text-xs font-bold text-gray-400 uppercase italic">Quantité Initiale</label>
                    <div className="flex italic">
                      <input type="number" className="flex-1 bg-gray-50 border border-gray-200 rounded-l-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 italic" defaultValue="0" />
                      <select className="bg-gray-100 border border-gray-200 border-l-0 rounded-r-xl px-4 py-3 outline-none text-sm font-bold italic">
                        <option>Unités</option>
                        <option>Kg</option>
                        <option>Litres</option>
                      </select>
                    </div>
                  </div>
                   <div className="space-y-2 italic">
                    <label className="text-xs font-bold text-gray-400 uppercase italic">Seuil d'Alerte</label>
                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 italic" defaultValue="5" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 italic">
                <button onClick={() => setIsArticleModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-white rounded-xl italic">Annuler</button>
                <button className="px-8 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 shadow-lg shadow-green-700/20 italic">Créer Article</button>
              </div>
            </motion.div>
          </div>
        )}

        {isMovementModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 italic">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMovementModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm italic"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col italic"
            >
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-green-700 text-white italic">
                <h2 className="text-xl font-bold italic">Mouvement de Stock</h2>
                <button onClick={() => setIsMovementModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full italic">
                  <X className="w-6 h-6 italic" />
                </button>
              </div>
              <div className="p-8 space-y-6 text-black italic">
                <div className="flex gap-4 italic">
                  <button className="flex-1 p-4 rounded-2xl border-2 border-green-100 bg-green-50 text-green-700 flex flex-col items-center gap-2 transition-all hover:bg-green-100 italic">
                    <PlusCircle className="w-6 h-6 italic" />
                    <span className="text-sm font-bold italic">ENTRÉ</span>
                  </button>
                   <button className="flex-1 p-4 rounded-2xl border-2 border-orange-100 bg-orange-50 text-orange-700 flex flex-col items-center gap-2 transition-all hover:bg-orange-100 italic">
                    <MinusCircle className="w-6 h-6 italic" />
                    <span className="text-sm font-bold italic">SORTIE</span>
                  </button>
                </div>
                <div className="space-y-4 italic">
                  <div className="space-y-2 italic">
                    <label className="text-xs font-bold text-gray-400 uppercase italic">Choisir l'Article</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 italic">
                      {MOCK_ARTICLES.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                    </select>
                  </div>
                   <div className="grid grid-cols-2 gap-4 italic">
                    <div className="space-y-2 italic">
                      <label className="text-xs font-bold text-gray-400 uppercase italic">Quantité</label>
                      <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 italic" />
                    </div>
                    <div className="space-y-2 italic">
                      <label className="text-xs font-bold text-gray-400 uppercase italic">Date</label>
                      <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 italic" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div className="space-y-2 italic">
                    <label className="text-xs font-bold text-gray-400 uppercase italic">Motif du mouvement</label>
                    <textarea rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 resize-none italic" placeholder="Ex: Consommation cuisine..." />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 italic">
                <button onClick={() => setIsMovementModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-white rounded-xl italic">Annuler</button>
                <button className="px-8 py-2 bg-green-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-700/20 italic tracking-wide">Confirmer le Mouvement</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
