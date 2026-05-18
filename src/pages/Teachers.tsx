import * as React from 'react';
import { 
  UserRound, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Users, 
  CreditCard, 
  MoreVertical,
  Mail,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Enseignant } from '@/src/types';
import { useApp } from '../context/AppContext';

export function Teachers() {
  const { enseignants } = useApp();
  const [selectedTeacher, setSelectedTeacher] = React.useState<Enseignant | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'add' | 'edit'>('add');

  const openAddModal = () => {
    setSelectedTeacher(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, teacher: Enseignant) => {
    e.stopPropagation();
    setSelectedTeacher(teacher);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openDrawer = (teacher: Enseignant) => {
    setSelectedTeacher(teacher);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Enseignants</h1>
          <p className="text-gray-500 text-sm">Suivez le corps professoral et leurs assignations.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-700/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvel Enseignant</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, spécialité..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none flex-1 md:flex-none">
            <option>Toutes les spécialités</option>
            <option>Hafiz & Tajwid</option>
            <option>Fiqh & Hadith</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none flex-1 md:flex-none">
            <option>Statut: Tous</option>
            <option>Actif</option>
            <option>Inactif</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enseignants.map((teacher) => (
          <motion.div
            key={teacher.id}
            whileHover={{ y: -4 }}
            onClick={() => openDrawer(teacher)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img 
                    src={teacher.photo_url} 
                    alt={teacher.nom} 
                    className="w-16 h-16 rounded-2xl border-2 border-green-50 shadow-sm"
                  />
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                    teacher.statut === 'Actif' ? "bg-green-500" : "bg-gray-400"
                  )} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEditModal(e, teacher)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-green-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-gray-800 text-lg">{teacher.prenom} {teacher.nom}</h3>
                <p className="text-green-600 text-sm font-medium">{teacher.specialite}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <UserRound className="w-3 h-3" />
                  <span>{teacher.matricule}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Assignation</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{teacher.nb_eleves} élèves</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Salaire</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className={cn(
                      teacher.statut_paiement_mois === 'Payé' ? "text-green-600" : "text-orange-500"
                    )}>
                      {teacher.statut_paiement_mois}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 flex items-center justify-between group-hover:bg-green-50 transition-colors">
              <span className="text-xs text-gray-500">Recruté le {new Date(teacher.date_embauche).toLocaleDateString()}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Teacher Detail Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedTeacher && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-[60] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-xl text-gray-800">Détails Enseignant</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide text-black">
                {/* Profile Header */}
                <div className="flex items-center gap-6">
                  <img 
                    src={selectedTeacher.photo_url} 
                    className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg"
                    alt={selectedTeacher.nom}
                  />
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{selectedTeacher.prenom} {selectedTeacher.nom}</h3>
                    <p className="text-green-600 font-semibold">{selectedTeacher.specialite}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        selectedTeacher.statut === 'Actif' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {selectedTeacher.statut}
                      </span>
                      <span className="text-xs text-gray-400">{selectedTeacher.matricule}</span>
                    </div>
                  </div>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Téléphone</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTeacher.telephone}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Adresse</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTeacher.adresse}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Salaire mensuel</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTeacher.salaire_mensuel.toLocaleString()} CFA</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Date d'embauche</p>
                    <p className="text-sm font-semibold text-gray-800">{new Date(selectedTeacher.date_embauche).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Compétences & Qualifications</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedTeacher.competences || "Aucune qualification supplémentaire renseignée."}
                  </p>
                </div>

                {/* Sub-list of students */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800">Élèves assignés ({selectedTeacher.nb_eleves})</h4>
                    <button className="text-xs text-green-600 font-bold hover:underline">Voir la liste complète</button>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                          E{i}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Élève Exemple {i}</p>
                          <p className="text-[10px] text-gray-400">Matricule: DAARA-EX-{i}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Modifier le profil
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-gray-800">
                  {modalMode === 'add' ? 'Ajouter un Enseignant' : 'Modifier Enseignant'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 text-black">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Nom</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedTeacher?.nom} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Prénom</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedTeacher?.prenom} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Téléphone</label>
                    <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedTeacher?.telephone} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Spécialité</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedTeacher?.specialite} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Adresse</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedTeacher?.adresse} />
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Salaire Mensuel (CFA)</label>
                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedTeacher?.salaire_mensuel} />
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Date d'embauche</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedTeacher?.date_embauche} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Compétences & Qualifications</label>
                    <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 resize-none" defaultValue={selectedTeacher?.competences} />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                >
                  Annuler
                </button>
                <button className="bg-green-700 text-white px-8 py-2 rounded-xl text-sm font-medium hover:bg-green-800 transition-all shadow-lg shadow-green-700/20">
                  {modalMode === 'add' ? 'Créer le profil' : 'Mettre à jour'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
