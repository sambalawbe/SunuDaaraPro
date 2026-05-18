import * as React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  MapPin,
  Phone,
  User,
  BookOpen,
  X,
  CreditCard,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Eleve, Enseignant } from '@/src/types';
import { useApp } from '../context/AppContext';

const ProgressBar = ({ value, max = 60, label }: { value: number; max?: number; label?: string }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
          {label || `${value} / ${max} Hizb`}
        </span>
        <span className="text-[10px] font-bold text-green-600">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            percentage < 30 ? "bg-orange-400" : percentage < 70 ? "bg-green-500" : "bg-purple-600"
          )}
        />
      </div>
    </div>
  );
};

export function Students() {
  const { eleves, enseignants, updateEleve, addEleve } = useApp();
  const [selectedEleve, setSelectedEleve] = React.useState<Eleve | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'add' | 'edit' | 'view'>('view');
  const [activeFormTab, setActiveFormTab] = React.useState<'perso' | 'coran' | 'tuteur'>('perso');

  const openModal = (eleve: Eleve | null, mode: 'add' | 'edit' | 'view') => {
    setSelectedEleve(eleve);
    setModalMode(mode);
    setIsModalOpen(true);
    setActiveFormTab('perso');
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Élèves</h1>
          <p className="text-gray-500 text-sm">Gérez les inscriptions et le suivi de vos apprenants.</p>
        </div>
        <button 
          onClick={() => openModal(null, 'add')}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-700/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvel Élève</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, matricule..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 min-w-max">
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20">
            <option>Tous les niveaux</option>
            <option>Débutant</option>
            <option>Intermédiaire</option>
            <option>Hafiz</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20">
            <option>Pension: Toutes</option>
            <option>Interne</option>
            <option>Externe</option>
          </select>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Élève</th>
                <th className="px-6 py-4">Matricule</th>
                <th className="px-6 py-4">Progression (Hizb)</th>
                <th className="px-6 py-4">Enseignant</th>
                <th className="px-6 py-4">Prise en Charge</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {eleves.map((eleve) => (
                <motion.tr 
                  key={eleve.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/50 transition-colors group text-black"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={eleve.photo_url} 
                        alt={eleve.nom} 
                        className="w-10 h-10 rounded-full border border-gray-200"
                      />
                      <div>
                        <p className="font-bold text-gray-800">{eleve.nom} {eleve.prenom}</p>
                        <p className="text-xs text-gray-500">{eleve.statut_pension}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {eleve.matricule}
                  </td>
                  <td className="px-6 py-4 w-60">
                    <ProgressBar value={eleve.niveau_hizb} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {eleve.enseignant_nom}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      eleve.statut_prise_en_charge === 'Parrainé' 
                        ? "bg-green-100 text-green-700" 
                        : "bg-orange-100 text-orange-700"
                    )}>
                      {eleve.statut_prise_en_charge}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openModal(eleve, 'view')} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal(eleve, 'edit')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Affichage de 1 à 3 sur 265 élèves</p>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Unified for Add/Edit/View */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-gray-800">
                  {modalMode === 'add' ? 'Inscription Nouvel Élève' : 
                   modalMode === 'edit' ? 'Modifier l\'élève' : 'Fiche Profil Élève'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 text-black">
                {modalMode === 'view' && selectedEleve ? (
                  /* Detail View Profile */
                  <div className="space-y-8">
                    {/* Cover / Profile Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="relative">
                        <img 
                          src={selectedEleve.photo_url} 
                          className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl"
                          alt={selectedEleve.nom}
                        />
                        <div className={cn(
                          "absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold border-2 border-white",
                          selectedEleve.statut === 'Actif' ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                        )}>
                          {selectedEleve.statut}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-3xl font-extrabold text-gray-900">{selectedEleve.prenom} {selectedEleve.nom}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedEleve.matricule}</span>
                          <span className="flex items-center gap-1"><Home className="w-4 h-4" /> {selectedEleve.statut_pension}</span>
                          <span className={cn(
                            "flex items-center gap-1 font-bold",
                            selectedEleve.statut_prise_en_charge === 'Parrainé' ? "text-green-600" : "text-orange-600"
                          )}>
                            <CreditCard className="w-4 h-4" /> {selectedEleve.statut_prise_en_charge}
                          </span>
                        </div>
                        <ProgressBar value={selectedEleve.niveau_hizb} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Section Suivi */}
                      <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 font-bold text-gray-700">
                          <BookOpen className="w-5 h-5 text-green-600" />
                          <h4>Suivi Coranique</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Niveau Actuel</span>
                            <span className="font-semibold text-gray-800">{selectedEleve.niveau_actuel}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Enseignant</span>
                            <span className="font-semibold text-gray-800">{selectedEleve.enseignant_nom}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Dernier succès</span>
                            <span className="font-medium text-gray-800">{selectedEleve.dernier_verset}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section Tuteur */}
                      <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 font-bold text-gray-700">
                          <Phone className="w-5 h-5 text-green-600" />
                          <h4>Tuteur & Contacts</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Nom du Tuteur</p>
                                <p className="text-sm font-bold text-gray-800">{selectedEleve.tuteur_nom}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400">
                              <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Téléphone</p>
                                <p className="text-sm font-bold text-gray-800">{selectedEleve.contact_parent}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form View for Add/Edit */
                  <div className="space-y-6">
                    {/* Tabs for Form */}
                    <div className="flex border-b border-gray-100">
                      {[
                        { id: 'perso', label: 'Infos Personnelles' },
                        { id: 'coran', label: 'Suivi Coranique' },
                        { id: 'tuteur', label: 'Tuteur & Logistique' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveFormTab(tab.id as any)}
                          className={cn(
                            "px-6 py-3 text-sm font-medium transition-all relative",
                            activeFormTab === tab.id ? "text-green-700" : "text-gray-400 hover:text-gray-600"
                          )}
                        >
                          {tab.label}
                          {activeFormTab === tab.id && (
                            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {activeFormTab === 'perso' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Nom</label>
                            <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedEleve?.nom} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Prénom</label>
                            <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedEleve?.prenom} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Date de Naissance</label>
                            <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Lieu de Naissance</label>
                            <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" />
                          </div>
                        </>
                      )}

                      {activeFormTab === 'coran' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Niveau Actuel</label>
                            <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20">
                              <option>Débutant</option>
                              <option>Intermédiaire</option>
                              <option>Hafiz</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Nombre de Hizb (0-60)</label>
                            <input type="number" min="0" max="60" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedEleve?.niveau_hizb} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Enseignant Responsable</label>
                            <select 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20"
                              defaultValue={selectedEleve?.enseignant_id}
                            >
                              <option value="">Sélectionner un Oustaz</option>
                              {enseignants.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                  Oustaz {teacher.prenom} {teacher.nom}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      {activeFormTab === 'tuteur' && (
                        <>
                           <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Nom du Tuteur</label>
                            <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedEleve?.tuteur_nom} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Téléphone du Tuteur</label>
                            <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20" defaultValue={selectedEleve?.contact_parent} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Pension</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="pension" className="accent-green-700" defaultChecked />
                                <span className="text-sm">Interne</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="pension" className="accent-green-700" />
                                <span className="text-sm">Externe</span>
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                {modalMode !== 'view' && (
                  <button className="bg-green-700 text-white px-8 py-2 rounded-xl text-sm font-medium hover:bg-green-800 transition-all shadow-lg shadow-green-700/20">
                    {modalMode === 'add' ? 'Enregistrer' : 'Mettre à jour'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
