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
  const { enseignants, eleves, addEnseignant, updateEnseignant, deleteEnseignant, t, language, searchQuery, setSearchQuery } = useApp();
  const [selectedTeacher, setSelectedTeacher] = React.useState<Enseignant | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'add' | 'edit'>('add');

  const [specialiteFilter, setSpecialiteFilter] = React.useState('Tous');
  const [statutFilter, setStatutFilter] = React.useState('Tous');

  // Extract unique specialties from teachers list
  const specialties = React.useMemo(() => {
    const specs = new Set<string>();
    (enseignants || []).forEach(t => {
      if (t.specialite) specs.add(t.specialite);
    });
    return Array.from(specs);
  }, [enseignants]);

  const filteredTeachers = React.useMemo(() => {
    return (enseignants || []).filter(teacher => {
      const nomComplet = `${teacher.prenom} ${teacher.nom}`.toLowerCase();
      const matchesSearch = nomComplet.includes(searchQuery.toLowerCase()) ||
                            (teacher.matricule || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (teacher.specialite || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialite = specialiteFilter === 'Tous' || teacher.specialite === specialiteFilter;
      
      const matchesStatut = statutFilter === 'Tous' || teacher.statut === statutFilter;
      
      return matchesSearch && matchesSpecialite && matchesStatut;
    });
  }, [enseignants, searchQuery, specialiteFilter, statutFilter]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nom: formData.get('nom') as string,
      prenom: formData.get('prenom') as string,
      telephone: formData.get('telephone') as string,
      specialite: formData.get('specialite') as string,
      adresse: (formData.get('adresse') as string) || '',
      salaire_mensuel: Number(formData.get('salaire_mensuel') || 0),
      date_embauche: (formData.get('date_embauche') as string) || new Date().toISOString().substring(0, 10),
      competences: (formData.get('competences') as string) || '',
      statut: (selectedTeacher?.statut || 'Actif') as 'Actif' | 'Inactif',
      statut_paiement_mois: (selectedTeacher?.statut_paiement_mois || 'En attente') as 'Payé' | 'En attente',
      photo_url: selectedTeacher?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.get('prenom')}`
    };

    if (modalMode === 'add') {
      const success = await addEnseignant(data);
      if (success) {
        setIsModalOpen(false);
      } else {
        alert(t('error_create_teacher'));
      }
    } else if (modalMode === 'edit' && selectedTeacher) {
      const success = await updateEnseignant({
        ...selectedTeacher,
        ...data
      });
      if (success) {
        setIsModalOpen(false);
      } else {
        alert(t('error_update_teacher'));
      }
    }
  };

  const handleDeleteTeacher = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm(t('confirm_delete_teacher'))) {
      const success = await deleteEnseignant(id);
      if (!success) {
        alert(t('error_delete_teacher'));
      }
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('manage_teachers')}</h1>
          <p className="text-gray-500 text-sm">{t('teachers_subtitle')}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-700/20"
        >
          <Plus className="w-5 h-5" />
          <span>{t('new_teacher')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('search_teachers_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 outline-none text-black"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={specialiteFilter}
            onChange={(e) => setSpecialiteFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none flex-1 md:flex-none text-black font-medium"
          >
            <option value="Tous">{t('all_specialties')}</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <select 
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none flex-1 md:flex-none text-black font-medium"
          >
            <option value="Tous">{t('status_all')}</option>
            <option value="Actif">{t('active')}</option>
            <option value="Inactif">{t('inactive')}</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
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
                  <button onClick={(e) => handleDeleteTeacher(e, teacher.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600">
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
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{t('assignment')}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{teacher.nb_eleves} {t('students').toLowerCase()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{t('salary')}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className={cn(
                      teacher.statut_paiement_mois === 'Payé' ? "text-green-600" : "text-orange-500"
                    )}>
                      {teacher.statut_paiement_mois === 'Payé' ? t('paye') : t('en_attente')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 flex items-center justify-between group-hover:bg-green-50 transition-colors">
              <span className="text-xs text-gray-500">{t('hired_on')} {new Date(teacher.date_embauche).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'wo' ? 'wo-SN' : 'fr-FR')}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        ))}
      </div>
      {filteredTeachers.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-sm w-full col-span-full">
          {t('no_teachers_found')}
        </div>
      )}

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
                <h2 className="font-bold text-xl text-gray-800">{t('teacher_details')}</h2>
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
                        {selectedTeacher.statut === 'Actif' ? t('active') : t('inactive')}
                      </span>
                      <span className="text-xs text-gray-400">{selectedTeacher.matricule}</span>
                    </div>
                  </div>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">{t('phone')}</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTeacher.telephone}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">{t('address')}</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTeacher.adresse}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">{t('monthly_salary')}</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTeacher.salaire_mensuel.toLocaleString()} CFA</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">{t('hire_date')}</p>
                    <p className="text-sm font-semibold text-gray-800">{new Date(selectedTeacher.date_embauche).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'wo' ? 'wo-SN' : 'fr-FR')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">{t('skills_qualifications')}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedTeacher.competences || t('no_qualifications')}
                  </p>
                </div>

                {/* Sub-list of students */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800">
                      {t('assigned_students')} ({eleves.filter(student => student.enseignant_id === selectedTeacher.id).length})
                    </h4>
                    <button type="button" className="text-xs text-green-600 font-bold hover:underline">{t('view_full_list')}</button>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const assignedStudents = eleves.filter(student => student.enseignant_id === selectedTeacher.id);
                      if (assignedStudents.length === 0) {
                        return (
                          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-500 font-medium">{t('no_assigned_students')}</p>
                          </div>
                        );
                      }
                      return assignedStudents.map((student) => (
                        <div key={student.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-colors cursor-pointer">
                          <img 
                            src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.prenom}`} 
                            alt={student.nom} 
                            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-800">{student.prenom} {student.nom}</p>
                            <p className="text-[10px] text-gray-400">{t('matricule')}: {student.matricule}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                <button 
                  onClick={(e) => {
                    setIsDrawerOpen(false);
                    openEditModal(e, selectedTeacher);
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('edit_profile')}
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
                  {modalMode === 'add' ? t('add_teacher') : t('edit_teacher')}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 text-black grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('nom')}</label>
                    <input name="nom" required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black" defaultValue={selectedTeacher?.nom} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('prenom')}</label>
                    <input name="prenom" required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black" defaultValue={selectedTeacher?.prenom} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('phone')}</label>
                    <input name="telephone" required type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black" defaultValue={selectedTeacher?.telephone} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('specialite')}</label>
                    <input name="specialite" required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black" defaultValue={selectedTeacher?.specialite} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('address')}</label>
                    <input name="adresse" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black" defaultValue={selectedTeacher?.adresse} />
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('monthly_salary')} (CFA)</label>
                    <input name="salaire_mensuel" required type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black" defaultValue={selectedTeacher?.salaire_mensuel} />
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('hire_date')}</label>
                    <input name="date_embauche" required type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-black" defaultValue={selectedTeacher ? new Date(selectedTeacher.date_embauche).toISOString().substring(0, 10) : ''} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('skills_qualifications')}</label>
                    <textarea name="competences" rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 resize-none text-black" defaultValue={selectedTeacher?.competences} />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button type="submit" className="bg-green-700 text-white px-8 py-2 rounded-xl text-sm font-medium hover:bg-green-800 transition-all shadow-lg shadow-green-700/20">
                    {modalMode === 'add' ? t('create_profile') : t('update')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
