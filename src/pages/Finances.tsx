import * as React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  PieChart as PieIcon,
  DollarSign,
  Gift,
  ShoppingCart,
  Heart,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp } from '../context/AppContext';
import { Don, Depense } from '../types';

export function Finances() {
  const { dons, depenses, addDon, addDepense } = useApp();
  const [activeTab, setActiveTab] = React.useState<'dons' | 'depenses'>('dons');
  const [isDonModalOpen, setIsDonModalOpen] = React.useState(false);
  const [isDepenseModalOpen, setIsDepenseModalOpen] = React.useState(false);

  // Stats calculate
  const totalDons = dons.reduce((sum, d) => sum + d.montant, 0);
  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const soldeActuel = totalDons - totalDepenses;

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value.toLocaleString()} CFA</h3>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Finances & Trésorerie</h1>
          <p className="text-gray-500 text-sm">Suivi solidaire des dons et dépenses de l'internat.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDepenseModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span>Dépense Sortante</span>
          </button>
          <button 
            onClick={() => setIsDonModalOpen(true)}
            className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-700/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer un Don</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Solde de Caisse" 
          value={soldeActuel} 
          icon={Wallet} 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Cumul des Dons" 
          value={totalDons} 
          icon={Gift} 
          color="bg-green-50 text-green-600"
        />
        <StatCard 
          title="Total des Dépenses" 
          value={totalDepenses} 
          icon={TrendingDown} 
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-black">
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('dons')}
            className={cn(
              "px-8 py-4 text-sm font-bold transition-all relative",
              activeTab === 'dons' ? "text-green-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Dons Reçus
            {activeTab === 'dons' && <motion.div layoutId="fin-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-700" />}
          </button>
          <button 
            onClick={() => setActiveTab('depenses')}
            className={cn(
              "px-8 py-4 text-sm font-bold transition-all relative",
              activeTab === 'depenses' ? "text-green-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Dépenses & Logistique
            {activeTab === 'depenses' && <motion.div layoutId="fin-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-700" />}
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/10 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              {activeTab === 'dons' ? (
                <tr>
                  <th className="px-6 py-4">Donateur</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Assignation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Libellé</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTab === 'dons' ? (
                dons.map((don) => (
                  <tr key={don.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <Heart className="w-4 h-4" />
                         </div>
                         <span className="font-bold text-gray-800">{don.donateur_nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">{don.montant.toLocaleString()} CFA</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(don.date_don).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase">{don.type_paiement}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 italic">{don.assignation || 'Général'}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-gray-400 hover:text-blue-600"><FileText className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              ) : (
                depenses.map((depense) => (
                  <tr key={depense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{depense.libelle}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold uppercase">{depense.categorie}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">-{depense.montant.toLocaleString()} CFA</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(depense.date_depense).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-gray-400 hover:text-blue-600"><FileText className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Don */}
      <AnimatePresence>
        {isDonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDonModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-black">Enregistrer un Don</h2>
              <form className="space-y-4 text-black" onSubmit={(e) => {
                e.preventDefault();
                // Simulation
                setIsDonModalOpen(false);
              }}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Nom du Donateur</label>
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Montant (CFA)</label>
                    <input type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none">
                      <option>Espèces</option>
                      <option>Transfert</option>
                      <option>Nature</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Assignation (Optionnel)</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" placeholder="Ex: Alimentation, Médicaments..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsDonModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold">Annuler</button>
                  <button type="submit" className="flex-1 bg-green-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-green-700/20">Valider</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Depense */}
      <AnimatePresence>
        {isDepenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDepenseModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-black">Enregistrer une Dépense</h2>
                <form className="space-y-4 text-black" onSubmit={(e) => {
                  e.preventDefault();
                  setIsDepenseModalOpen(false);
                }}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Libellé / Objet</label>
                    <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Montant (CFA)</label>
                      <input type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Catégorie</label>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none">
                        <option>Alimentation</option>
                        <option>Salaires</option>
                        <option>Santé</option>
                        <option>Logistique</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                   <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsDepenseModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold">Annuler</button>
                  <button type="submit" className="flex-1 bg-red-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-red-600/20">Valider</button>
                </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
