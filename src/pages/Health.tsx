import * as React from 'react';
import { 
  Plus, 
  Search, 
  Activity, 
  AlertTriangle, 
  Clock, 
  History, 
  User, 
  ShieldAlert, 
  Thermometer, 
  Pill, 
  Stethoscope,
  X,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { ConsultationMedicale, FicheMedicale, Eleve } from '@/src/types';
import { useApp } from '../context/AppContext';

export function Health() {
  const { eleves, consultations, fichesMedicales, addConsultation, updateFicheMedicale } = useApp();
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isEditingRecord, setIsEditingRecord] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // State for editing form
  const [editForm, setEditForm] = React.useState<FicheMedicale | null>(null);
  
  // Stats
  const totalConsultationsToday = consultations.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    return c.date_consultation.startsWith(today);
  }).length;
  
  const studentsInInfirmary = consultations.filter(c => c.statut_eleve === 'Repos').length;
  const criticalAllergiesCount = fichesMedicales.filter(r => r.allergies && r.allergies !== 'Aucune').length;

  const filteredConsultations = consultations.filter(c => 
    `${c.eleve_prenom} ${c.eleve_nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.diagnostic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = eleves.find(e => e.id === selectedStudentId);
  const selectedMedicalRecord = fichesMedicales.find(r => r.eleve_id === selectedStudentId);
  const selectedStudentConsultations = consultations.filter(c => c.eleve_id === selectedStudentId);

  const handleAddConsultation = () => {
    if (!selectedStudentId) return;
    const student = eleves.find(e => e.id === selectedStudentId);
    if (!student) return;

    addConsultation({
      id: 0,
      eleve_id: student.id,
      eleve_nom: student.nom,
      eleve_prenom: student.prenom,
      date_consultation: new Date().toISOString(),
      symptomes: "Nouveaux symptômes",
      diagnostic: "Diagnostic temporaire",
      traitement: "Traitement exemple",
      statut_eleve: 'Repos',
      emetteur: 'Infirmier de garde'
    });
    setIsModalOpen(false);
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { color: string; icon: any }> = {
      'En classe': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
      'Repos': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
      'Évacué': { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle }
    };
    const { color, icon: Icon } = config[status] || config['En classe'];
    return (
      <span className={cn("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit", color)}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const handleOpenDrawer = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsDrawerOpen(true);
    setIsEditingRecord(false);
  };

  const handleStartEdit = () => {
    if (selectedMedicalRecord) {
      setEditForm({ ...selectedMedicalRecord });
      setIsEditingRecord(true);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      updateFicheMedicale(editForm);
      setIsEditingRecord(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Santé & Infirmerie</h1>
          <p className="text-gray-500 text-sm">Gestion du suivi médical et des consultations du Daara.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Consultation</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Stethoscope} 
          label="Consultations (Aujourd'hui)" 
          value={totalConsultationsToday} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          icon={Thermometer} 
          label="Élèves au repos" 
          value={studentsInInfirmary} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          icon={ShieldAlert} 
          label="Profils à risque (Allergies)" 
          value={criticalAllergiesCount} 
          color="bg-red-50 text-red-600" 
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Journal des Consultations
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher élève ou diagnostic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none w-64"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors border border-gray-200">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto text-black">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Élève</th>
                <th className="px-6 py-4">Date & Heure</th>
                <th className="px-6 py-4">Diagnostic</th>
                <th className="px-6 py-4">Traitement</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 italic">
              {filteredConsultations.map((consultation) => (
                <tr 
                  key={consultation.id} 
                  className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                  onClick={() => handleOpenDrawer(consultation.eleve_id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shadow-sm">
                        {consultation.eleve_prenom?.[0]}{consultation.eleve_nom?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{consultation.eleve_prenom} {consultation.eleve_nom}</p>
                        <p className="text-[10px] text-gray-400">ID: {consultation.eleve_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{new Date(consultation.date_consultation).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400">{new Date(consultation.date_consultation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-700">{consultation.diagnostic}</span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-gray-500 truncate">{consultation.traitement}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={consultation.statut_eleve} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Consultation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setSelectedStudentId(null);
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-600 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Nouvelle Consultation</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 text-black">
                {/* Student Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sélectionner l'Élève</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                    value={selectedStudentId || ''}
                  >
                    <option value="">Chercher un élève...</option>
                    {eleves.map(e => (
                      <option key={e.id} value={e.id}>{e.prenom} {e.nom} ({e.matricule})</option>
                    ))}
                  </select>
                </div>

                {/* Allergy Alert Panel */}
                <AnimatePresence>
                  {selectedStudentId && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {fichesMedicales.find(r => r.eleve_id === selectedStudentId)?.allergies !== 'Aucune' ? (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-4">
                          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                          <div>
                            <p className="text-sm font-bold text-red-700">Alerte Allergies !</p>
                            <p className="text-xs text-red-600 mt-1">
                              Cet élève présente les allergies suivantes : <span className="font-extrabold underline">{fichesMedicales.find(r => r.eleve_id === selectedStudentId)?.allergies}</span>.
                              Antécédents : {fichesMedicales.find(r => r.eleve_id === selectedStudentId)?.antecedents}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-4">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                          <div>
                            <p className="text-sm font-bold text-emerald-700">Aucune Allergie connue</p>
                            <p className="text-xs text-emerald-600 mt-1">Rien à signaler dans le dossier médical de base.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Symptômes déclarés</label>
                    <textarea 
                      rows={3}
                      placeholder="Ex: Fièvre, toux, maux de ventre..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnostic initial</label>
                    <textarea 
                      rows={3}
                      placeholder="Ex: Suspection de paludisme..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none italic"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Traitement prescrit & Médicaments</label>
                  <input 
                    type="text" 
                    placeholder="Dosage, fréquence, durée..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 italic"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Statut post-consultation</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 italic">
                      <option>En classe</option>
                      <option>Repos au dortoir</option>
                      <option>Évacué à l'hôpital</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Émetteur (Infirmier/Admin)</label>
                    <input 
                      type="text" 
                      placeholder="Votre nom"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 italic"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-white transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddConsultation}
                  className="bg-emerald-600 text-white px-8 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Enregistrer la visite
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Medical History Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-[120] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-gray-800">Dossier Médical</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide text-black">
                {isEditingRecord && editForm ? (
                  <form onSubmit={handleSaveEdit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Groupe Sanguin</label>
                        <select 
                          value={editForm.groupe_sanguin}
                          onChange={(e) => setEditForm({ ...editForm, groupe_sanguin: e.target.value as any })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Poids (kg)</label>
                        <input 
                          type="number"
                          value={editForm.poids || ''}
                          onChange={(e) => setEditForm({ ...editForm, poids: Number(e.target.value) })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Allergies</label>
                      <textarea 
                        value={editForm.allergies}
                        onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none min-h-[80px]"
                        placeholder="Ex: Pénicilline, Arachides..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Antécédents Médicaux</label>
                      <textarea 
                        value={editForm.antecedents || ''}
                        onChange={(e) => setEditForm({ ...editForm, antecedents: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none min-h-[80px]"
                        placeholder="Ex: Asthme, Chirurgie..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Contact Urgence (Nom)</label>
                        <input 
                          type="text"
                          value={editForm.contact_urgence_nom}
                          onChange={(e) => setEditForm({ ...editForm, contact_urgence_nom: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Contact Urgence (Tél)</label>
                        <input 
                          type="text"
                          value={editForm.contact_urgence_tel}
                          onChange={(e) => setEditForm({ ...editForm, contact_urgence_tel: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsEditingRecord(false)}
                        className="flex-1 py-3 text-gray-500 font-bold"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-emerald-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-emerald-600/20"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Student Info */}
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {selectedStudent.prenom[0]}{selectedStudent.nom[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedStudent.prenom} {selectedStudent.nom}</h3>
                        <p className="text-xs text-gray-500 font-medium">Matricule: {selectedStudent.matricule}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-[10px] font-bold text-emerald-700">
                            {selectedMedicalRecord?.groupe_sanguin || 'N/A'}
                          </span>
                          {selectedMedicalRecord?.poids && (
                            <span className="px-2 py-0.5 rounded-full bg-white border border-blue-200 text-[10px] font-bold text-blue-700">
                              {selectedMedicalRecord.poids} kg
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vitals Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Allergies</p>
                        <p className={cn(
                          "text-sm font-bold",
                          selectedMedicalRecord?.allergies !== 'Aucune' ? "text-red-600" : "text-emerald-600"
                        )}>
                          {selectedMedicalRecord?.allergies || 'Non renseigné'}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Contact Urgence</p>
                        <p className="text-sm font-bold text-gray-800">{selectedMedicalRecord?.contact_urgence_nom || 'Non renseigné'}</p>
                        <p className="text-[10px] text-gray-500">{selectedMedicalRecord?.contact_urgence_tel || ''}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <History className="w-5 h-5 text-gray-400" />
                        <h4 className="font-bold text-gray-800">Historique des Consultations</h4>
                      </div>
                      <div className="space-y-4">
                        {selectedStudentConsultations.length > 0 ? (
                          selectedStudentConsultations.map((c) => (
                            <div key={c.id} className="relative pl-6 border-l-2 border-emerald-100 py-1 space-y-2">
                              <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500" />
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">{new Date(c.date_consultation).toLocaleDateString()}</span>
                                <StatusBadge status={c.statut_eleve} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800 italic">{c.diagnostic}</p>
                                <p className="text-xs text-gray-500 mt-1 italic leading-relaxed">
                                  Symptômes: {c.symptomes}
                                </p>
                                <div className="flex items-start gap-2 mt-2 bg-gray-50 p-2 rounded-lg italic">
                                  <Pill className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5 italic" />
                                  <p className="text-[11px] text-gray-600 italic">Traitement: {c.traitement}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400 italic">Aucune consultation enregistrée.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!isEditingRecord && (
                <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                  <button 
                    onClick={handleStartEdit}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20"
                  >
                    Modifier la fiche de base
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
