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
  FileText,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp } from '../context/AppContext';
import { Don, Depense, PaiementEleve, Paie } from '../types';

export function Finances() {
  const { 
    dons, 
    depenses, 
    paiements, 
    paies, 
    enseignants,
    addDon, 
    addDepense, 
    addPaie, 
    deletePaie, 
    deletePaiement, 
    t 
  } = useApp();
  const [activeTab, setActiveTab] = React.useState<'dons' | 'depenses' | 'scolarite' | 'paies'>('dons');
  const [isDonModalOpen, setIsDonModalOpen] = React.useState(false);
  const [isDepenseModalOpen, setIsDepenseModalOpen] = React.useState(false);
  const [isPaieModalOpen, setIsPaieModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPaiement, setSelectedPaiement] = React.useState<PaiementEleve | null>(null);
  const [selectedPaie, setSelectedPaie] = React.useState<Paie | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<number | null>(null);
  const [deleteConfirmPaieId, setDeleteConfirmPaieId] = React.useState<number | null>(null);

  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>('');
  const [paieForm, setPaieForm] = React.useState({
    enseignant_id: '',
    nom: '',
    prenom: '',
    role_personnel: 'Enseignant',
    mois: new Date().toISOString().slice(0, 7),
    montant: ''
  });

  const [donForm, setDonForm] = React.useState({
    donateur_nom: '',
    montant: '',
    type_paiement: 'Espèces' as 'Espèces' | 'Transfert' | 'Nature',
    assignation: ''
  });

  const [depenseForm, setDepenseForm] = React.useState({
    libelle: '',
    montant: '',
    categorie: 'Alimentation' as 'Alimentation' | 'Salaires' | 'Santé' | 'Logistique' | 'Loyer' | 'Autre',
    justificatif_url: ''
  });

  const handleDonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donForm.donateur_nom || !donForm.montant) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const payload: Don = {
      id: 0,
      donateur_nom: donForm.donateur_nom,
      montant: Number(donForm.montant),
      type_paiement: donForm.type_paiement,
      assignation: donForm.assignation || undefined,
      date_don: new Date().toISOString(),
      recu_numero: `REC-${Date.now().toString().slice(-4)}`
    };
    await addDon(payload);
    setIsDonModalOpen(false);
    setDonForm({
      donateur_nom: '',
      montant: '',
      type_paiement: 'Espèces',
      assignation: ''
    });
  };

  const handleDepenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depenseForm.libelle || !depenseForm.montant) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const payload: Depense = {
      id: 0,
      libelle: depenseForm.libelle,
      montant: Number(depenseForm.montant),
      categorie: depenseForm.categorie,
      date_depense: new Date().toISOString(),
      justificatif_url: depenseForm.justificatif_url || undefined
    };
    await addDepense(payload);
    setIsDepenseModalOpen(false);
    setDepenseForm({
      libelle: '',
      montant: '',
      categorie: 'Alimentation',
      justificatif_url: ''
    });
  };

  // Handlers for payroll form
  const handleRoleChange = (role: string) => {
    if (role === 'Enseignant') {
      const activeTeachers = enseignants.filter(e => e.statut === 'Actif');
      const firstTeacher = activeTeachers[0];
      setPaieForm(prev => ({
        ...prev,
        role_personnel: role,
        enseignant_id: firstTeacher ? String(firstTeacher.id) : '',
        nom: firstTeacher ? firstTeacher.nom : '',
        prenom: firstTeacher ? firstTeacher.prenom : '',
        montant: firstTeacher ? String(firstTeacher.salaire_mensuel) : ''
      }));
      setSelectedTeacherId(firstTeacher ? String(firstTeacher.id) : '');
    } else {
      setPaieForm(prev => ({
        ...prev,
        role_personnel: role,
        enseignant_id: '',
        nom: '',
        prenom: '',
        montant: ''
      }));
      setSelectedTeacherId('');
    }
  };

  const handleTeacherChange = (teacherIdStr: string) => {
    const teacher = enseignants.find(e => String(e.id) === teacherIdStr);
    if (teacher) {
      setPaieForm(prev => ({
        ...prev,
        enseignant_id: String(teacher.id),
        nom: teacher.nom,
        prenom: teacher.prenom,
        montant: String(teacher.salaire_mensuel)
      }));
      setSelectedTeacherId(String(teacher.id));
    }
  };

  const handlePaieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paieForm.nom || !paieForm.prenom || !paieForm.montant) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const payload = {
      enseignant_id: paieForm.enseignant_id ? Number(paieForm.enseignant_id) : undefined,
      nom: paieForm.nom,
      prenom: paieForm.prenom,
      role_personnel: paieForm.role_personnel as any,
      mois: paieForm.mois,
      montant: Number(paieForm.montant)
    };
    const success = await addPaie(payload);
    if (success) {
      setIsPaieModalOpen(false);
      // Reset form
      setPaieForm({
        enseignant_id: '',
        nom: '',
        prenom: '',
        role_personnel: 'Enseignant',
        mois: new Date().toISOString().slice(0, 7),
        montant: ''
      });
      setSelectedTeacherId('');
    } else {
      alert("Erreur lors de l'enregistrement de la paie.");
    }
  };

  const getRoleTranslationKey = (role: string) => {
    switch (role) {
      case 'Enseignant': return 'role_enseignant';
      case 'Surveillant': return 'role_surveillant';
      case 'Administrateur': return 'role_administrateur';
      case 'Vigile': return 'role_vigile';
      case 'Cuisinière': return 'role_cuisiniere';
      case 'Laveuse': return 'role_laveuse';
      default: return '';
    }
  };

  // Stats calculate
  const totalDons = dons.reduce((sum, d) => sum + d.montant, 0);
  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const totalPaiements = (paiements || []).reduce((sum, p) => sum + p.montant, 0);
  const totalPaies = (paies || []).reduce((sum, p) => sum + p.montant, 0);
  const soldeActuel = totalDons + totalPaiements - totalDepenses - totalPaies;

  // Search filtering
  const filteredDons = dons.filter(d => 
    d.donateur_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.assignation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.type_paiement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepenses = depenses.filter(d => 
    d.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPaiements = (paiements || []).filter(p => 
    (p.eleve_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.eleve_prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.eleve_matricule || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.recu_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type_paiement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPaies = (paies || []).filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role_personnel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.recu_numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {activeTab === 'paies' ? (
            <button 
              onClick={() => {
                handleRoleChange('Enseignant');
                setIsPaieModalOpen(true);
              }}
              className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-700/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('record_salary') || "Enregistrer une Paie"}</span>
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard 
          title={t('stats_treasury') || "Solde de Caisse"} 
          value={soldeActuel} 
          icon={Wallet} 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title={t('cumul_dons') || "Cumul des Dons"} 
          value={totalDons} 
          icon={Gift} 
          color="bg-green-50 text-green-600"
        />
        <StatCard 
          title={t('fees_and_pensions') || "Frais & Pensions"} 
          value={totalPaiements} 
          icon={FileText} 
          color="bg-purple-50 text-purple-600"
        />
        <StatCard 
          title={t('total_depenses') || "Total des Dépenses"} 
          value={totalDepenses + totalPaies} 
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
            {t('dons_recus') || "Dons Reçus"}
            {activeTab === 'dons' && <motion.div layoutId="fin-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-700" />}
          </button>
          <button 
            onClick={() => setActiveTab('depenses')}
            className={cn(
              "px-8 py-4 text-sm font-bold transition-all relative",
              activeTab === 'depenses' ? "text-green-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {t('depenses_logistique') || "Dépenses & Logistique"}
            {activeTab === 'depenses' && <motion.div layoutId="fin-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-700" />}
          </button>
          <button 
            onClick={() => setActiveTab('scolarite')}
            className={cn(
              "px-8 py-4 text-sm font-bold transition-all relative",
              activeTab === 'scolarite' ? "text-green-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {t('fees_and_pensions') || "Frais & Pensions"}
            {activeTab === 'scolarite' && <motion.div layoutId="fin-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-700" />}
          </button>
          <button 
            onClick={() => setActiveTab('paies')}
            className={cn(
              "px-8 py-4 text-sm font-bold transition-all relative",
              activeTab === 'paies' ? "text-green-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {t('staff_payroll') || "Paies du Personnel"}
            {activeTab === 'paies' && <motion.div layoutId="fin-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-700" />}
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_placeholder') || "Rechercher..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="px-6 py-4">{t('donateur') || "Donateur"}</th>
                  <th className="px-6 py-4">{t('montant') || "Montant"}</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">{t('mode_paiement') || "Mode"}</th>
                  <th className="px-6 py-4">{t('assignation') || "Assignation"}</th>
                  <th className="px-6 py-4 text-right">{t('actions') || "Actions"}</th>
                </tr>
              ) : activeTab === 'depenses' ? (
                <tr>
                  <th className="px-6 py-4">{t('libelle') || "Libellé"}</th>
                  <th className="px-6 py-4">{t('categorie') || "Catégorie"}</th>
                  <th className="px-6 py-4">{t('montant') || "Montant"}</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">{t('actions') || "Actions"}</th>
                </tr>
              ) : activeTab === 'scolarite' ? (
                <tr>
                  <th className="px-6 py-4">{t('eleve') || "Élève"}</th>
                  <th className="px-6 py-4">{t('type_paiement') || "Type de paiement"}</th>
                  <th className="px-6 py-4">{t('recu_numero') || "N° de Reçu"}</th>
                  <th className="px-6 py-4">{t('montant') || "Montant"}</th>
                  <th className="px-6 py-4">{t('payment_date') || "Date de paiement"}</th>
                  <th className="px-6 py-4 text-right">{t('actions') || "Actions"}</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">{t('employee_name') || "Employé"}</th>
                  <th className="px-6 py-4">{t('role_personnel') || "Rôle"}</th>
                  <th className="px-6 py-4">{t('payroll_month') || "Mois de paie"}</th>
                  <th className="px-6 py-4">{t('recu_numero') || "N° de Reçu"}</th>
                  <th className="px-6 py-4">{t('salary_amount') || "Montant"}</th>
                  <th className="px-6 py-4">{t('payment_date') || "Date"}</th>
                  <th className="px-6 py-4 text-right">{t('actions') || "Actions"}</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeTab === 'dons' ? (
                filteredDons.map((don) => (
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
              ) : activeTab === 'depenses' ? (
                filteredDepenses.map((depense) => (
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
              ) : activeTab === 'scolarite' ? (
                filteredPaiements.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                            {(p.eleve_prenom?.[0] || '') + (p.eleve_nom?.[0] || '')}
                         </div>
                         <div>
                           <span className="font-bold text-gray-800">{p.eleve_prenom} {p.eleve_nom}</span>
                           <span className="block text-[10px] text-gray-400 font-mono">{p.eleve_matricule}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                        p.type_paiement === 'Inscription' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {p.type_paiement === 'Inscription' ? t('registration_fee') : `${t('monthly_fee')} (${p.mois})`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{p.recu_numero}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{p.montant.toLocaleString()} CFA</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.date_paiement).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                       <button 
                         onClick={() => setSelectedPaiement(p)}
                         className="text-gray-400 hover:text-blue-600 p-1"
                         title={t('view_details') || "Voir Reçu"}
                       >
                         <FileText className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => setDeleteConfirmId(p.id)}
                         className="text-gray-400 hover:text-red-600 p-1"
                         title={t('delete') || "Supprimer"}
                       >
                         <Trash className="w-4 h-4 text-red-500" />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                filteredPaies.map((paie) => (
                  <tr key={paie.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                            {(paie.prenom?.[0] || '') + (paie.nom?.[0] || '')}
                         </div>
                         <div>
                           <span className="font-bold text-gray-800">{paie.prenom} {paie.nom}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase">
                        {t(getRoleTranslationKey(paie.role_personnel)) || paie.role_personnel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{paie.mois}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{paie.recu_numero}</td>
                    <td className="px-6 py-4 font-bold text-red-600">-{paie.montant.toLocaleString()} CFA</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(paie.date_paiement).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                       <button 
                         onClick={() => setSelectedPaie(paie)}
                         className="text-gray-400 hover:text-blue-600 p-1"
                         title={t('view_details') || "Voir Bulletin"}
                       >
                         <FileText className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => setDeleteConfirmPaieId(paie.id)}
                         className="text-gray-400 hover:text-red-600 p-1"
                         title={t('delete') || "Supprimer"}
                       >
                         <Trash className="w-4 h-4 text-red-500" />
                       </button>
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
              <form className="space-y-4 text-black" onSubmit={handleDonSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Nom du Donateur</label>
                  <input 
                    type="text" 
                    required 
                    value={donForm.donateur_nom} 
                    onChange={(e) => setDonForm(prev => ({ ...prev, donateur_nom: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Montant (CFA)</label>
                    <input 
                      type="number" 
                      required 
                      value={donForm.montant} 
                      onChange={(e) => setDonForm(prev => ({ ...prev, montant: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                    <select 
                      value={donForm.type_paiement} 
                      onChange={(e) => setDonForm(prev => ({ ...prev, type_paiement: e.target.value as any }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                    >
                      <option value="Espèces">Espèces</option>
                      <option value="Transfert">Transfert</option>
                      <option value="Nature">Nature</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Assignation (Optionnel)</label>
                  <input 
                    type="text" 
                    value={donForm.assignation} 
                    onChange={(e) => setDonForm(prev => ({ ...prev, assignation: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" 
                    placeholder="Ex: Alimentation, Médicaments..." 
                  />
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
                <form className="space-y-4 text-black" onSubmit={handleDepenseSubmit}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Libellé / Objet</label>
                    <input 
                      type="text" 
                      required 
                      value={depenseForm.libelle} 
                      onChange={(e) => setDepenseForm(prev => ({ ...prev, libelle: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Montant (CFA)</label>
                      <input 
                        type="number" 
                        required 
                        value={depenseForm.montant} 
                        onChange={(e) => setDepenseForm(prev => ({ ...prev, montant: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Catégorie</label>
                      <select 
                        value={depenseForm.categorie} 
                        onChange={(e) => setDepenseForm(prev => ({ ...prev, categorie: e.target.value as any }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                      >
                        <option value="Alimentation">Alimentation</option>
                        <option value="Salaires">Salaires</option>
                        <option value="Santé">Santé</option>
                        <option value="Logistique">Logistique</option>
                        <option value="Loyer">Loyer</option>
                        <option value="Autre">Autre</option>
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

      {/* Receipt Viewer Modal */}
      <AnimatePresence>
        {selectedPaiement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPaiement(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-black">
              {/* Receipt Content */}
              <div id="receipt-print-area" className="space-y-6">
                <div className="text-center pb-4 border-b border-dashed border-gray-200">
                  <h3 className="text-lg font-black text-green-700 tracking-wider">SUNU DAARA PRO</h3>
                  <p className="text-xs text-gray-400">Internat d'Excellence Coranique</p>
                  <div className="mt-4 inline-block bg-gray-50 px-3 py-1 rounded-full text-xs font-mono font-bold text-gray-600">
                    {selectedPaiement.recu_numero}
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('payment_date') || "Date"} :</span>
                    <span className="font-bold">{new Date(selectedPaiement.date_paiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('eleve') || "Élève"} :</span>
                    <span className="font-bold">{selectedPaiement.eleve_prenom} {selectedPaiement.eleve_nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Matricule :</span>
                    <span className="font-bold font-mono">{selectedPaiement.eleve_matricule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type :</span>
                    <span className="font-bold">
                      {selectedPaiement.type_paiement === 'Inscription' ? t('registration_fee') : `${t('monthly_fee')} (${selectedPaiement.mois})`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-800">{t('montant') || "Montant"} :</span>
                    <span className="text-lg font-black text-green-700">{selectedPaiement.montant.toLocaleString()} CFA</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-dashed border-gray-200 flex flex-col items-center">
                  <p className="text-[10px] text-gray-400 italic">Ce reçu fait office de preuve de paiement.</p>
                  <p className="text-[10px] text-gray-400 font-bold">Baraka Allahou Fikoum</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedPaiement(null)} 
                  className="flex-1 py-3 text-gray-500 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t('cancel') || "Fermer"}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const printContent = document.getElementById('receipt-print-area')?.innerHTML;
                    if (printContent) {
                      const win = window.open('', '_blank');
                      if (win) {
                        win.document.write(`
                          <html>
                            <head>
                              <title>Reçu ${selectedPaiement.recu_numero}</title>
                              <style>
                                body { font-family: sans-serif; padding: 40px; text-align: left; color: #333; }
                                .space-y-6 > * + * { margin-top: 1.5rem; }
                                .space-y-3 > * + * { margin-top: 0.75rem; }
                                .flex { display: flex; }
                                .justify-between { justify-content: space-between; }
                                .text-center { text-align: center; }
                                .pb-4 { padding-bottom: 1rem; }
                                .border-b { border-bottom: 1px solid #e5e7eb; }
                                .border-b.border-dashed { border-bottom-style: dashed; }
                                .border-t { border-top: 1px solid #e5e7eb; }
                                .border-t.border-dashed { border-top-style: dashed; }
                                .pt-4 { padding-top: 1rem; }
                                .pt-6 { padding-top: 1.5rem; }
                                .text-lg { font-size: 1.125rem; }
                                .text-xs { font-size: 0.75rem; }
                                .text-sm { font-size: 0.875rem; }
                                .text-[10px] { font-size: 0.625rem; }
                                .font-bold { font-weight: bold; }
                                .font-black { font-weight: 900; }
                                .font-mono { font-family: monospace; }
                                .text-green-700 { color: #15803d; }
                                .text-gray-400 { color: #9ca3af; }
                                .text-gray-800 { color: #1f2937; }
                                .italic { font-style: italic; }
                                .inline-block { display: inline-block; }
                                .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
                                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                                .rounded-full { border-radius: 9999px; }
                                .bg-gray-50 { background-color: #f9fafb; }
                              </style>
                            </head>
                            <body>
                              <div style="max-width: 400px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px;">
                                ${printContent}
                              </div>
                              <script>window.onload = function() { window.print(); window.close(); }</script>
                            </body>
                          </html>
                        `);
                        win.document.close();
                      }
                    }
                  }} 
                  className="flex-1 bg-green-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-green-700/20 hover:bg-green-800 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('download') || "Imprimer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-black text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('delete') || "Supprimer"} ?</h3>
              <p className="text-sm text-gray-500 mb-6">Cette action supprimera définitivement le reçu de paiement et mettra à jour le solde de la caisse.</p>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setDeleteConfirmId(null)} 
                  className="flex-1 py-3 text-gray-500 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t('cancel') || "Annuler"}
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    if (deleteConfirmId !== null) {
                      await deletePaiement(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }
                  }} 
                  className="flex-1 bg-red-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
                >
                  {t('delete') || "Supprimer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Paie du Personnel */}
      <AnimatePresence>
        {isPaieModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaieModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-black">
              <h2 className="text-2xl font-bold mb-6 text-black">{t('record_salary') || "Enregistrer une Paie"}</h2>
              <form className="space-y-4" onSubmit={handlePaieSubmit}>
                
                {/* Rôle / Poste */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">{t('role_personnel') || "Rôle / Poste"}</label>
                  <select 
                    value={paieForm.role_personnel}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-black"
                  >
                    <option value="Enseignant">{t('role_enseignant') || "Enseignant"}</option>
                    <option value="Surveillant">{t('role_surveillant') || "Surveillant"}</option>
                    <option value="Administrateur">{t('role_administrateur') || "Administrateur"}</option>
                    <option value="Vigile">{t('role_vigile') || "Vigile"}</option>
                    <option value="Cuisinière">{t('role_cuisiniere') || "Cuisinière"}</option>
                    <option value="Laveuse">{t('role_laveuse') || "Laveuse"}</option>
                  </select>
                </div>

                {/* Si Enseignant, sélection du profil enseignant */}
                {paieForm.role_personnel === 'Enseignant' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('role_enseignant') || "Enseignant"}</label>
                    <select 
                      value={selectedTeacherId}
                      onChange={(e) => handleTeacherChange(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-black"
                    >
                      <option value="" disabled>{t('select_teacher') || "Sélectionner un enseignant..."}</option>
                      {enseignants.filter(e => e.statut === 'Actif').map((teacher) => (
                        <option key={teacher.id} value={String(teacher.id)}>
                          {teacher.prenom} {teacher.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nom et Prénom (Lecture seule si Enseignant, saisie libre sinon) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('first_name') || "Prénom"}</label>
                    <input 
                      type="text" 
                      required 
                      disabled={paieForm.role_personnel === 'Enseignant'}
                      value={paieForm.prenom}
                      onChange={(e) => setPaieForm(prev => ({ ...prev, prenom: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none disabled:bg-gray-100 disabled:text-gray-500 text-black" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('last_name') || "Nom"}</label>
                    <input 
                      type="text" 
                      required 
                      disabled={paieForm.role_personnel === 'Enseignant'}
                      value={paieForm.nom}
                      onChange={(e) => setPaieForm(prev => ({ ...prev, nom: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none disabled:bg-gray-100 disabled:text-gray-500 text-black" 
                    />
                  </div>
                </div>

                {/* Mois de paie et Montant */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('payroll_month') || "Mois de paie"}</label>
                    <input 
                      type="month" 
                      required 
                      value={paieForm.mois}
                      onChange={(e) => setPaieForm(prev => ({ ...prev, mois: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-black" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">{t('salary_amount') || "Montant (CFA)"}</label>
                    <input 
                      type="number" 
                      required 
                      value={paieForm.montant}
                      onChange={(e) => setPaieForm(prev => ({ ...prev, montant: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-black" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 text-black">
                  <button 
                    type="button" 
                    onClick={() => setIsPaieModalOpen(false)} 
                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel') || "Annuler"}
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-green-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-green-700/20 hover:bg-green-800 transition-all"
                  >
                    {t('confirm') || "Valider"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Viewer Modal for payroll */}
      <AnimatePresence>
        {selectedPaie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPaie(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-black">
              {/* Receipt Content */}
              <div id="paie-receipt-print-area" className="space-y-6">
                <div className="text-center pb-4 border-b border-dashed border-gray-200">
                  <h3 className="text-lg font-black text-green-700 tracking-wider">SUNU DAARA PRO</h3>
                  <p className="text-xs text-gray-400 font-bold">Fiche de Paiement du Personnel</p>
                  <div className="mt-4 inline-block bg-gray-50 px-3 py-1 rounded-full text-xs font-mono font-bold text-gray-600">
                    {selectedPaie.recu_numero}
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('payment_date') || "Date"} :</span>
                    <span className="font-bold">{new Date(selectedPaie.date_paiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('employee_name') || "Employé"} :</span>
                    <span className="font-bold">{selectedPaie.prenom} {selectedPaie.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('role_personnel') || "Rôle / Poste"} :</span>
                    <span className="font-bold">{t(getRoleTranslationKey(selectedPaie.role_personnel)) || selectedPaie.role_personnel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('payroll_month') || "Mois de paie"} :</span>
                    <span className="font-bold font-mono">{selectedPaie.mois}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-800">{t('salary_amount') || "Montant Versé"} :</span>
                    <span className="text-lg font-black text-green-700">{selectedPaie.montant.toLocaleString()} CFA</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-dashed border-gray-200 flex flex-col items-center">
                  <p className="text-[10px] text-gray-400 italic">Ce reçu fait office de bulletin de paiement de salaire.</p>
                  <p className="text-[10px] text-gray-400 font-bold">Baraka Allahou Fikoum</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3 text-black">
                <button 
                  type="button"
                  onClick={() => setSelectedPaie(null)} 
                  className="flex-1 py-3 text-gray-500 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t('cancel') || "Fermer"}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const printContent = document.getElementById('paie-receipt-print-area')?.innerHTML;
                    if (printContent) {
                      const win = window.open('', '_blank');
                      if (win) {
                        win.document.write(`
                          <html>
                            <head>
                              <title>Bulletin ${selectedPaie.recu_numero}</title>
                              <style>
                                body { font-family: sans-serif; padding: 40px; text-align: left; color: #333; }
                                .space-y-6 > * + * { margin-top: 1.5rem; }
                                .space-y-3 > * + * { margin-top: 0.75rem; }
                                .flex { display: flex; }
                                .justify-between { justify-content: space-between; }
                                .text-center { text-align: center; }
                                .pb-4 { padding-bottom: 1rem; }
                                .border-b { border-bottom: 1px solid #e5e7eb; }
                                .border-b.border-dashed { border-bottom-style: dashed; }
                                .border-t { border-top: 1px solid #e5e7eb; }
                                .border-t.border-dashed { border-top-style: dashed; }
                                .pt-4 { padding-top: 1rem; }
                                .pt-6 { padding-top: 1.5rem; }
                                .text-lg { font-size: 1.125rem; }
                                .text-xs { font-size: 0.75rem; }
                                .text-sm { font-size: 0.875rem; }
                                .text-[10px] { font-size: 0.625rem; }
                                .font-bold { font-weight: bold; }
                                .font-black { font-weight: 900; }
                                .font-mono { font-family: monospace; }
                                .text-green-700 { color: #15803d; }
                                .text-gray-400 { color: #9ca3af; }
                                .text-gray-800 { color: #1f2937; }
                                .italic { font-style: italic; }
                                .inline-block { display: inline-block; }
                                .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
                                .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                                .rounded-full { border-radius: 9999px; }
                                .bg-gray-50 { background-color: #f9fafb; }
                              </style>
                            </head>
                            <body>
                              <div style="max-width: 400px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px;">
                                ${printContent}
                              </div>
                              <script>window.onload = function() { window.print(); window.close(); }</script>
                            </body>
                          </html>
                        `);
                        win.document.close();
                      }
                    }
                  }} 
                  className="flex-1 bg-green-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-green-700/20 hover:bg-green-800 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('download') || "Imprimer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal for payroll */}
      <AnimatePresence>
        {deleteConfirmPaieId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmPaieId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-black text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('delete') || "Supprimer la Paie"} ?</h3>
              <p className="text-sm text-gray-500 mb-6">Cette action supprimera définitivement le bulletin de salaire de l'employé et créditera à nouveau le solde de la caisse.</p>
              <div className="flex gap-3 text-black">
                <button 
                  type="button"
                  onClick={() => setDeleteConfirmPaieId(null)} 
                  className="flex-1 py-3 text-gray-500 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t('cancel') || "Annuler"}
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    if (deleteConfirmPaieId !== null) {
                      await deletePaie(deleteConfirmPaieId);
                      setDeleteConfirmPaieId(null);
                    }
                  }} 
                  className="flex-1 bg-red-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
                >
                  {t('delete') || "Supprimer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
