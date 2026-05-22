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
  FileText,
  FolderPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Article, StockMovement } from '@/src/types';
import { useApp } from '../context/AppContext';

export function Inventory() {
  const { 
    articles, 
    mouvements, 
    addMouvement, 
    categoriesLogistique, 
    addArticle, 
    addCategoryLogistique,
    searchQuery,
    setSearchQuery,
    t
  } = useApp();

  const [activeView, setActiveView] = React.useState<'stock' | 'history'>('stock');
  const [isArticleModalOpen, setIsArticleModalOpen] = React.useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = React.useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState('Toutes');

  // Category modal states
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [categoryError, setCategoryError] = React.useState('');

  // Article modal states
  const [newArticleRef, setNewArticleRef] = React.useState('');
  const [newArticleNom, setNewArticleNom] = React.useState('');
  const [newArticleCat, setNewArticleCat] = React.useState('');
  const [newArticleQuantite, setNewArticleQuantite] = React.useState(0);
  const [newArticleUnite, setNewArticleUnite] = React.useState('Unités');
  const [newArticleSeuil, setNewArticleSeuil] = React.useState(5);
  const [articleError, setArticleError] = React.useState('');

  // Movement modal states
  const [mvtType, setMvtType] = React.useState<'Entrée' | 'Sortie'>('Entrée');
  const [mvtArticleId, setMvtArticleId] = React.useState<number>(0);
  const [mvtQuantite, setMvtQuantite] = React.useState<number>(0);
  const [mvtMotif, setMvtMotif] = React.useState('');
  const [mvtError, setMvtError] = React.useState('');

  // Set default category when categories change or modal opens
  React.useEffect(() => {
    if (categoriesLogistique.length > 0 && !newArticleCat) {
      setNewArticleCat(categoriesLogistique[0]);
    }
  }, [categoriesLogistique, newArticleCat]);

  // Set default article for movement when articles change or modal opens
  React.useEffect(() => {
    if (isMovementModalOpen && articles.length > 0 && !mvtArticleId) {
      setMvtArticleId(articles[0].id);
    }
  }, [isMovementModalOpen, articles, mvtArticleId]);

  const articlesCritiquesCount = articles.filter(a => a.quantite <= a.seuil_alerte).length;
  const totalArticles = articles.length;

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'Toutes' || a.categorie === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (article: Article) => {
    if (article.quantite === 0) return { label: t('out_of_stock'), color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    if (article.quantite <= article.seuil_alerte) return { label: t('low_stock'), color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle };
    return { label: t('in_stock'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 };
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError(t('please_enter_category_name'));
      return;
    }
    const success = await addCategoryLogistique(newCategoryName.trim());
    if (success) {
      setNewCategoryName('');
      setCategoryError('');
      setIsCategoryModalOpen(false);
    } else {
      setCategoryError(t('category_already_exists_or_error'));
    }
  };

  const handleCreateArticle = async () => {
    if (!newArticleRef.trim() || !newArticleNom.trim() || !newArticleCat) {
      setArticleError(t('please_fill_all_required_fields'));
      return;
    }
    const success = await addArticle({
      reference: newArticleRef.trim(),
      nom: newArticleNom.trim(),
      categorie: newArticleCat,
      quantite: Number(newArticleQuantite),
      unite: newArticleUnite,
      seuil_alerte: Number(newArticleSeuil)
    });
    if (success) {
      setIsArticleModalOpen(false);
      setNewArticleRef('');
      setNewArticleNom('');
      setNewArticleQuantite(0);
      setNewArticleUnite('Unités');
      setNewArticleSeuil(5);
      setArticleError('');
    } else {
      setArticleError(t('article_creation_error'));
    }
  };

  const handleCreateMouvement = async () => {
    const targetArticleId = mvtArticleId || (articles[0]?.id);
    if (!targetArticleId) {
      setMvtError(t('no_article_available'));
      return;
    }
    if (mvtQuantite <= 0) {
      setMvtError(t('quantity_must_be_greater_than_0'));
      return;
    }
    if (!mvtMotif.trim()) {
      setMvtError(t('please_specify_reason'));
      return;
    }
    await addMouvement({
      id: 0, // Le backend affectera un ID
      article_id: Number(targetArticleId),
      type_mouvement: mvtType,
      quantite: Number(mvtQuantite),
      motif: mvtMotif.trim(),
      date_mouvement: new Date().toISOString()
    });
    setIsMovementModalOpen(false);
    setMvtQuantite(0);
    setMvtMotif('');
    setMvtError('');
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
          <h1 className="text-2xl font-bold text-gray-800">{t('logistics_inventory')}</h1>
          <p className="text-gray-500 text-sm">{t('logistics_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4 text-green-600" />
            <span>{t('new_category')}</span>
          </button>
          <button 
            onClick={() => setIsArticleModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-green-600" />
            <span>{t('new_article')}</span>
          </button>
          <button 
            onClick={() => setIsMovementModalOpen(true)}
            className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-700/20 flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t('stock_movement')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={Package} 
          label={t('total_articles')} 
          value={totalArticles} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          icon={AlertTriangle} 
          label={t('stock_alerts')} 
          value={articlesCritiquesCount} 
          color="bg-red-50 text-red-600" 
        />
        <StatCard 
          icon={ArrowUpRight} 
          label={t('entries_month')} 
          value={mouvements.filter(m => m.type_mouvement === 'Entrée').length} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          icon={ArrowDownLeft} 
          label={t('exits_month')} 
          value={mouvements.filter(m => m.type_mouvement === 'Sortie').length} 
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
          {t('current_stock')}
        </button>
        <button 
          onClick={() => setActiveView('history')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeView === 'history' ? "bg-green-700 text-white shadow-md shadow-green-700/20" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <History className="w-4 h-4" />
          {t('history')}
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
                  placeholder={t('ref_or_name_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20 text-black"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none text-black font-medium"
                >
                  <option value="Toutes">{t('all_categories')}</option>
                  {categoriesLogistique.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                    <th className="px-6 py-4">{t('article')}</th>
                    <th className="px-6 py-4">{t('category')}</th>
                    <th className="px-6 py-4">{t('quantity_in_stock')}</th>
                    <th className="px-6 py-4">{t('alert_threshold')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                    <th className="px-6 py-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
                          <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-lg">
                            {article.categorie}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {article.quantite} {article.unite}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {article.seuil_alerte} {article.unite}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 w-fit",
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
                  {filteredArticles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                        {t('no_article_found')}
                      </td>
                    </tr>
                  )}
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
                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">{t('date')}</th>
                    <th className="px-6 py-4">{t('type')}</th>
                    <th className="px-6 py-4">{t('article')}</th>
                    <th className="px-6 py-4">{t('quantity')}</th>
                    <th className="px-6 py-4">{t('movement_reason')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mouvements.map((mv) => (
                    <tr key={mv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-500">
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
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">
                        {mv.article_nom}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "font-bold",
                          mv.type_mouvement === 'Entrée' ? "text-green-600" : "text-red-600"
                        )}>
                          {mv.type_mouvement === 'Entrée' ? '+' : '-'}{mv.quantite}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {mv.motif}
                      </td>
                    </tr>
                  ))}
                  {mouvements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                        {t('no_movement_recorded')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Nouvelle Catégorie */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <h2 className="text-xl font-bold text-gray-800">{t('new_category')}</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-4 text-black">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">{t('category_name')}</label>
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium" 
                    placeholder={t('category_placeholder')} 
                  />
                </div>
                {categoryError && (
                  <p className="text-xs text-red-600 font-medium">{categoryError}</p>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={() => setIsCategoryModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-white rounded-xl">{t('cancel')}</button>
                <button 
                  onClick={handleCreateCategory}
                  className="px-8 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 shadow-lg shadow-green-700/20"
                >
                  {t('add_category')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Nouvel Article */}
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
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <h2 className="text-xl font-bold text-gray-800">{t('new_article')}</h2>
                <button onClick={() => setIsArticleModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6 text-black">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('reference_unique')}</label>
                    <input 
                      type="text" 
                      value={newArticleRef}
                      onChange={(e) => setNewArticleRef(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium" 
                      placeholder="Ex: REF-001" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('category')}</label>
                    <div className="flex gap-2">
                      <select 
                        value={newArticleCat}
                        onChange={(e) => setNewArticleCat(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium"
                      >
                        {categoriesLogistique.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => setIsCategoryModalOpen(true)}
                        type="button"
                        className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors shrink-0"
                        title={t('new_category')}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">{t('article_name')}</label>
                  <input 
                    type="text" 
                    value={newArticleNom}
                    onChange={(e) => setNewArticleNom(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium" 
                    placeholder={t('article_name_placeholder')} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('initial_quantity')}</label>
                    <div className="flex">
                      <input 
                        type="number" 
                        value={newArticleQuantite}
                        onChange={(e) => setNewArticleQuantite(Number(e.target.value))}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-l-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium" 
                      />
                      <select 
                        value={newArticleUnite}
                        onChange={(e) => setNewArticleUnite(e.target.value)}
                        className="bg-gray-100 border border-gray-200 border-l-0 rounded-r-xl px-4 py-3 outline-none text-sm font-bold text-gray-700"
                      >
                        <option value="Unités">{t('unit_units')}</option>
                        <option value="Kg">{t('unit_kg')}</option>
                        <option value="Litres">{t('unit_litres')}</option>
                        <option value="Sacs">{t('unit_sacs')}</option>
                        <option value="Bidons">{t('unit_bidons')}</option>
                      </select>
                    </div>
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('alert_threshold')}</label>
                    <input 
                      type="number" 
                      value={newArticleSeuil}
                      onChange={(e) => setNewArticleSeuil(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium" 
                    />
                  </div>
                </div>
                {articleError && (
                  <p className="text-xs text-red-600 font-medium">{articleError}</p>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={() => setIsArticleModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-white rounded-xl">{t('cancel')}</button>
                <button 
                  onClick={handleCreateArticle}
                  className="px-8 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 shadow-lg shadow-green-700/20"
                >
                  {t('add_article')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Mouvement de Stock */}
      <AnimatePresence>
        {isMovementModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMovementModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-green-700 text-white">
                <h2 className="text-xl font-bold">{t('stock_movement')}</h2>
                <button onClick={() => setIsMovementModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6 text-black">
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setMvtType('Entrée')}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                      mvtType === 'Entrée' 
                        ? "border-green-600 bg-green-50 text-green-700 shadow-sm" 
                        : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <PlusCircle className="w-6 h-6" />
                    <span className="text-sm font-bold">{t('movement_in')}</span>
                  </button>
                   <button 
                    type="button"
                    onClick={() => setMvtType('Sortie')}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                      mvtType === 'Sortie' 
                        ? "border-orange-600 bg-orange-50 text-orange-700 shadow-sm" 
                        : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <MinusCircle className="w-6 h-6" />
                    <span className="text-sm font-bold">{t('movement_out')}</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('choose_article')}</label>
                    <select 
                      value={mvtArticleId}
                      onChange={(e) => setMvtArticleId(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium"
                    >
                      {articles.map(a => <option key={a.id} value={a.id}>{a.nom} ({a.reference})</option>)}
                      {articles.length === 0 && <option>{t('no_article_available')}</option>}
                    </select>
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">{t('quantity')}</label>
                      <input 
                        type="number" 
                        value={mvtQuantite}
                        onChange={(e) => setMvtQuantite(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">{t('date')}</label>
                      <input 
                        type="date" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black font-medium" 
                        defaultValue={new Date().toISOString().split('T')[0]} 
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('movement_reason')}</label>
                    <textarea 
                      rows={2} 
                      value={mvtMotif}
                      onChange={(e) => setMvtMotif(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 resize-none text-black font-medium" 
                      placeholder={t('movement_reason_placeholder')} 
                    />
                  </div>
                </div>
                {mvtError && (
                  <p className="text-xs text-red-600 font-medium">{mvtError}</p>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button onClick={() => setIsMovementModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-white rounded-xl">{t('cancel')}</button>
                <button 
                  onClick={handleCreateMouvement}
                  className="px-8 py-2 bg-green-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-700/20 tracking-wide"
                >
                  {t('confirm_movement')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
