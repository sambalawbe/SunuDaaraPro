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
  Trash,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp } from '../context/AppContext';
import { Don, Depense, PaiementEleve, Paie, Eleve } from '../types';

export function Finances() {
  const { 
    dons, 
    depenses, 
    paiements, 
    paies, 
    enseignants,
    eleves,
    config,
    addDon, 
    addDepense, 
    addPaie, 
    addPaiement,
    deletePaie, 
    deletePaiement, 
    t,
    searchQuery,
    setSearchQuery
  } = useApp();
  const [activeTab, setActiveTab] = React.useState<'dons' | 'depenses' | 'scolarite' | 'paies'>('dons');
  const [scolariteSubTab, setScolariteSubTab] = React.useState<'suivi' | 'transactions'>('suivi');
  const [isDonModalOpen, setIsDonModalOpen] = React.useState(false);
  const [isDepenseModalOpen, setIsDepenseModalOpen] = React.useState(false);
  const [isPaieModalOpen, setIsPaieModalOpen] = React.useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = React.useState(false);
  const [selectedStudentForPayments, setSelectedStudentForPayments] = React.useState<Eleve | null>(null);
  const [paiementForm, setPaiementForm] = React.useState({
    eleve_id: '',
    type_paiement: 'Mensualité' as 'Inscription' | 'Mensualité',
    mois: new Date().toISOString().slice(0, 7),
    montant: ''
  });
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

  const handleOpenPaiementModal = (eleveId?: number, type: 'Inscription' | 'Mensualité' = 'Mensualité', defaultMonth?: string) => {
    setPaiementForm({
      eleve_id: eleveId ? String(eleveId) : '',
      type_paiement: type,
      mois: defaultMonth || new Date().toISOString().slice(0, 7),
      montant: String(type === 'Inscription' ? (config?.frais_inscription || 0) : (config?.mensualite || 0))
    });
    setIsPaiementModalOpen(true);
  };

  const handlePaiementTypeChange = (type: 'Inscription' | 'Mensualité') => {
    setPaiementForm(prev => ({
      ...prev,
      type_paiement: type,
      montant: String(type === 'Inscription' ? (config?.frais_inscription || 0) : (config?.mensualite || 0))
    }));
  };

  const handlePaiementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paiementForm.eleve_id || !paiementForm.montant) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const student = eleves.find(el => el.id === Number(paiementForm.eleve_id));
    if (!student) return;

    const details = paiementForm.type_paiement === 'Mensualité' 
      ? `la mensualité de ${paiementForm.mois}`
      : "les frais d'inscription";

    if (!confirm(`Voulez-vous vraiment enregistrer le paiement de ${details} (${Number(paiementForm.montant).toLocaleString()} CFA) pour ${student.prenom} ${student.nom} ?`)) {
      return;
    }

    const payload = {
      eleve_id: student.id,
      type_paiement: paiementForm.type_paiement,
      mois: paiementForm.type_paiement === 'Mensualité' ? paiementForm.mois : undefined,
      montant: Number(paiementForm.montant)
    };

    const success = await addPaiement(payload);
    if (success) {
      setIsPaiementModalOpen(false);
      setPaiementForm({
        eleve_id: '',
        type_paiement: 'Mensualité',
        mois: new Date().toISOString().slice(0, 7),
        montant: ''
      });
    } else {
      alert("Erreur lors de l'enregistrement du paiement.");
    }
  };

  const getPaiementMensuel = (eleveId: number, monthStr: string) => {
    return (paiements || []).find(p => p.eleve_id === eleveId && p.type_paiement === 'Mensualité' && p.mois === monthStr);
  };

  const getPaiementInscription = (eleveId: number) => {
    return (paiements || []).find(p => p.eleve_id === eleveId && p.type_paiement === 'Inscription');
  };

  // Stats calculate
  const totalDons = dons.reduce((sum, d) => sum + d.montant, 0);
  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const totalPaiements = (paiements || []).reduce((sum, p) => sum + p.montant, 0);
  const totalPaies = (paies || []).reduce((sum, p) => sum + p.montant, 0);
  const soldeActuel = totalDons + totalPaiements - totalDepenses - totalPaies;

  // Search filtering
  const filteredDons = dons.filter(d => 
    d.donateur_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.assignation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type_paiement.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDepenses = depenses.filter(d => 
    d.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.categorie.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPaiements = (paiements || []).filter(p => 
    (p.eleve_nom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.eleve_prenom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.eleve_matricule || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.recu_numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type_paiement.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredElevesForScolarite = eleves.filter(e => 
    e.statut === 'Actif' && 
    e.type_eleve !== 'Gratuit' &&
    (
      e.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.matricule.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredPaies = (paies || []).filter(p => 
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role_personnel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.recu_numero.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-800">{t('finance_title')}</h1>
          <p className="text-gray-500 text-sm">{t('finance_subtitle')}</p>
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
          ) : activeTab === 'scolarite' ? (
            <button 
              onClick={handleOpenPaiementModal}
              className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-700/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer un Paiement</span>
            </button>
          ) : activeTab === 'depenses' ? (
            <button 
              onClick={() => setIsDepenseModalOpen(true)}
              className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-700/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer une Dépense</span>
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

        {activeTab === 'scolarite' && (
          <div className="flex border-b border-gray-100 bg-gray-50/40 px-6 gap-6">
            <button 
              onClick={() => setScolariteSubTab('suivi')}
              className={cn(
                "py-3 text-xs font-bold transition-all relative",
                scolariteSubTab === 'suivi' ? "text-green-700" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Fiches de Suivi & Mensualités
              {scolariteSubTab === 'suivi' && <motion.div layoutId="scol-sub" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700" />}
            </button>
            <button 
              onClick={() => setScolariteSubTab('transactions')}
              className={cn(
                "py-3 text-xs font-bold transition-all relative",
                scolariteSubTab === 'transactions' ? "text-green-700" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Historique des Reçus de Caisse
              {scolariteSubTab === 'transactions' && <motion.div layoutId="scol-sub" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700" />}
            </button>
          </div>
        )}

        {/* Content Table */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_placeholder') || "Rechercher..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                scolariteSubTab === 'suivi' ? (
                  <tr>
                    <th className="px-6 py-4">Élève</th>
                    <th className="px-6 py-4">Frais d'Inscription</th>
                    <th className="px-6 py-4">Mois Courant</th>
                    <th className="px-6 py-4 text-center">Mensualités (Année en cours)</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4">{t('eleve') || "Élève"}</th>
                    <th className="px-6 py-4">{t('type_paiement') || "Type de paiement"}</th>
                    <th className="px-6 py-4">{t('recu_numero') || "N° de Reçu"}</th>
                    <th className="px-6 py-4">{t('montant') || "Montant"}</th>
                    <th className="px-6 py-4">{t('payment_date') || "Date de paiement"}</th>
                    <th className="px-6 py-4 text-right">{t('actions') || "Actions"}</th>
                  </tr>
                )
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
                scolariteSubTab === 'suivi' ? (
                  filteredElevesForScolarite.map((eleve) => {
                    const currentYear = new Date().getFullYear();
                    const currentMonthCode = String(new Date().getMonth() + 1).padStart(2, '0');
                    const currentMonthStr = `${currentYear}-${currentMonthCode}`;
                    const currentMonthName = new Date().toLocaleDateString('fr-FR', { month: 'long' });
                    
                    const pInscription = getPaiementInscription(eleve.id);
                    const pMoisCourant = getPaiementMensuel(eleve.id, currentMonthStr);
                    
                    const MOIS_COMPACT = [
                      { id: '01', letter: 'J', name: 'Janvier' },
                      { id: '02', letter: 'F', name: 'Février' },
                      { id: '03', letter: 'M', name: 'Mars' },
                      { id: '04', letter: 'A', name: 'Avril' },
                      { id: '05', letter: 'M', name: 'Mai' },
                      { id: '06', letter: 'J', name: 'Juin' },
                      { id: '07', letter: 'J', name: 'Juillet' },
                      { id: '08', letter: 'A', name: 'Août' },
                      { id: '09', letter: 'S', name: 'Septembre' },
                      { id: '10', letter: 'O', name: 'Octobre' },
                      { id: '11', letter: 'N', name: 'Novembre' },
                      { id: '12', letter: 'D', name: 'Décembre' }
                    ];

                    return (
                      <tr key={eleve.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Élève Info */}
                        <td className="px-6 py-4">
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:underline decoration-emerald-600/40"
                            onClick={() => setSelectedStudentForPayments(eleve)}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                              {(eleve.prenom?.[0] || '') + (eleve.nom?.[0] || '')}
                            </div>
                            <div>
                              <span className="font-bold text-gray-800">{eleve.prenom} {eleve.nom}</span>
                              <span className="block text-[10px] text-gray-400 font-mono">{eleve.matricule}</span>
                            </div>
                          </div>
                        </td>

                        {/* Inscription Fee */}
                        <td className="px-6 py-4 text-xs font-semibold">
                          {pInscription ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-bold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Payé
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenPaiementModal(eleve.id, 'Inscription')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-[10px] uppercase"
                            >
                              <Plus className="w-3 h-3" />
                              Non Payé
                            </button>
                          )}
                        </td>

                        {/* Monthly Fee (Current Month) */}
                        <td className="px-6 py-4 text-xs font-semibold">
                          {pMoisCourant ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-bold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Payé
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenPaiementModal(eleve.id, 'Mensualité', currentMonthStr)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-[10px] uppercase"
                            >
                              <Plus className="w-3 h-3" />
                              Non Payé
                            </button>
                          )}
                        </td>

                        {/* Visual 12-Month Calendar Grid */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {MOIS_COMPACT.map(m => {
                              const isPaid = getPaiementMensuel(eleve.id, `${currentYear}-${m.id}`);
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  title={`${m.name} ${currentYear} : ${isPaid ? 'Payé' : 'En attente'}`}
                                  onClick={() => {
                                    if (isPaid) {
                                      // Clicked a paid month -> Open detailed sheet of this student
                                      setSelectedStudentForPayments(eleve);
                                    } else {
                                      // Clicked unpaid month -> Quick record payment modal for this month
                                      handleOpenPaiementModal(eleve.id, 'Mensualité', `${currentYear}-${m.id}`);
                                    }
                                  }}
                                  className={cn(
                                    "w-6 h-6 flex items-center justify-center rounded text-[9px] font-black transition-all hover:scale-110",
                                    isPaid 
                                      ? "bg-green-500 text-white shadow-sm shadow-green-500/25" 
                                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                  )}
                                >
                                  {m.letter}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setSelectedStudentForPayments(eleve)}
                              className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                              title="Voir Fiche de Paiement"
                            >
                              <Wallet className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenPaiementModal(eleve.id)}
                              className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                              title="Enregistrer un Paiement"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredPaiements.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div 
                          className="flex items-center gap-3 cursor-pointer hover:underline decoration-emerald-600/40"
                          onClick={() => {
                            const student = eleves.find(el => el.id === p.eleve_id);
                            if (student) setSelectedStudentForPayments(student);
                          }}
                        >
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
                           onClick={() => {
                             const student = eleves.find(el => el.id === p.eleve_id);
                             if (student) setSelectedStudentForPayments(student);
                           }}
                           className="text-gray-400 hover:text-emerald-600 p-1"
                           title="Voir Fiche de Paiement"
                         >
                           <Wallet className="w-4 h-4 text-emerald-600" />
                         </button>
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
                )
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

      {/* Modal Enregistrer un Paiement */}
      <AnimatePresence>
        {isPaiementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaiementModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-black">
              <h2 className="text-2xl font-bold mb-6 text-black">Enregistrer un Paiement</h2>
              <form className="space-y-4" onSubmit={handlePaiementSubmit}>
                
                {/* Sélection de l'Élève */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Élève Payant</label>
                  <select 
                    value={paiementForm.eleve_id}
                    onChange={(e) => setPaiementForm(prev => ({ ...prev, eleve_id: e.target.value }))}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-black font-semibold"
                  >
                    <option value="" disabled>Sélectionner un élève...</option>
                    {eleves.filter(e => e.statut === 'Actif' && e.type_eleve !== 'Gratuit').map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.prenom} {student.nom} ({student.matricule})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type de Paiement */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Type de Paiement</label>
                  <select 
                    value={paiementForm.type_paiement}
                    onChange={(e) => handlePaiementTypeChange(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-black"
                  >
                    <option value="Mensualité">Mensualité (Pension)</option>
                    <option value="Inscription">Inscription</option>
                  </select>
                </div>

                {/* Mois de pension (seulement pour les mensualités) */}
                {paiementForm.type_paiement === 'Mensualité' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Mois de la pension</label>
                    <input 
                      type="month" 
                      required 
                      value={paiementForm.mois}
                      onChange={(e) => setPaiementForm(prev => ({ ...prev, mois: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-black font-semibold" 
                    />
                  </div>
                )}

                {/* Montant (CFA) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Montant (CFA)</label>
                  <input 
                    type="number" 
                    required 
                    value={paiementForm.montant}
                    onChange={(e) => setPaiementForm(prev => ({ ...prev, montant: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-black font-semibold" 
                  />
                </div>

                <div className="pt-4 flex gap-3 text-black">
                  <button 
                    type="button" 
                    onClick={() => setIsPaiementModalOpen(false)} 
                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-green-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-green-700/20 hover:bg-green-800 transition-all flex items-center justify-center"
                  >
                    Valider le Paiement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Payments Detailed Sheet Modal */}
      <AnimatePresence>
        {selectedStudentForPayments && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedStudentForPayments(null)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-black max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                    {selectedStudentForPayments.type_eleve || 'Payant'}
                  </span>
                  <h2 className="text-2xl font-black mt-2 text-gray-800">
                    Fiche de Paiement : {selectedStudentForPayments.prenom} {selectedStudentForPayments.nom}
                  </h2>
                  <p className="text-sm text-gray-400 font-mono mt-1">Matricule: {selectedStudentForPayments.matricule}</p>
                </div>
                <button 
                  onClick={() => setSelectedStudentForPayments(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedStudentForPayments.type_eleve === 'Gratuit' ? (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center space-y-2">
                  <Wallet className="w-12 h-12 text-blue-600 mx-auto" />
                  <h3 className="text-lg font-bold text-blue-800">Élève non assujetti aux frais</h3>
                  <p className="text-sm text-blue-600 max-w-md mx-auto">
                    Cet élève est enregistré comme étant **Gratuit**. Il est dispensé des frais d'inscription et des mensualités.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Registration Fee Box */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800">Frais d'Inscription</h4>
                      <p className="text-xs text-gray-400">Requis pour l'entrée au Daara ({(config?.frais_inscription || 0).toLocaleString()} CFA)</p>
                    </div>
                    {(() => {
                      const pInscription = getPaiementInscription(selectedStudentForPayments.id);
                      return pInscription ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">Payé</span>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">{pInscription.recu_numero}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={async () => {
                              if (confirm("Voulez-vous vraiment annuler ce paiement ?")) {
                                await deletePaiement(pInscription.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Annuler le paiement"
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={async () => {
                            if (!confirm(`Voulez-vous vraiment enregistrer le paiement des frais d'inscription (${(config?.frais_inscription || 0).toLocaleString()} CFA) pour ${selectedStudentForPayments.prenom} ${selectedStudentForPayments.nom} ?`)) {
                              return;
                            }
                            const success = await addPaiement({
                              eleve_id: selectedStudentForPayments.id,
                              type_paiement: 'Inscription',
                              montant: config?.frais_inscription || 0
                            });
                            if (success) alert("Paiement enregistré !");
                          }}
                          className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-green-700/10"
                        >
                          Enregistrer le paiement
                        </button>
                      );
                    })()}
                  </div>

                  {/* Monthly Pension Box */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800">Mensualités ({new Date().getFullYear()})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[
                        { id: '01', name: 'Janvier' },
                        { id: '02', name: 'Février' },
                        { id: '03', name: 'Mars' },
                        { id: '04', name: 'Avril' },
                        { id: '05', name: 'Mai' },
                        { id: '06', name: 'Juin' },
                        { id: '07', name: 'Juillet' },
                        { id: '08', name: 'Août' },
                        { id: '09', name: 'Septembre' },
                        { id: '10', name: 'Octobre' },
                        { id: '11', name: 'Novembre' },
                        { id: '12', name: 'Décembre' }
                      ].map(m => {
                        const currentYear = new Date().getFullYear();
                        const monthStr = `${currentYear}-${m.id}`;
                        const p = getPaiementMensuel(selectedStudentForPayments.id, monthStr);
                        return (
                          <div 
                            key={m.id}
                            className={cn(
                              "p-4 rounded-2xl border flex flex-col justify-between h-32 transition-all relative overflow-hidden",
                              p 
                                ? "bg-green-50/20 border-green-200" 
                                : "bg-white border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div>
                              <p className="text-sm font-bold text-gray-800">{m.name}</p>
                              <p className="text-xs text-gray-400">{currentYear}</p>
                            </div>
                            {p ? (
                              <div className="flex items-center justify-between mt-4">
                                <div>
                                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">Payé</span>
                                  <p className="text-[9px] text-gray-400 mt-1 font-mono truncate max-w-[80px]" title={p.recu_numero}>
                                    {p.recu_numero.split('-').pop()}
                                  </p>
                                </div>
                                <button 
                                  type="button"
                                  onClick={async () => {
                                    if (confirm("Voulez-vous vraiment annuler ce paiement ?")) {
                                      await deletePaiement(p.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Annuler"
                                >
                                  <Trash className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={async () => {
                                  if (!confirm(`Voulez-vous vraiment enregistrer le paiement de la mensualité de ${m.name} (${(config?.mensualite || 0).toLocaleString()} CFA) pour ${selectedStudentForPayments.prenom} ${selectedStudentForPayments.nom} ?`)) {
                                    return;
                                  }
                                  const success = await addPaiement({
                                    eleve_id: selectedStudentForPayments.id,
                                    type_paiement: 'Mensualité',
                                    mois: monthStr,
                                    montant: config?.mensualite || 0
                                  });
                                  if (success) alert("Paiement de la mensualité enregistré !");
                                }}
                                className="mt-4 w-full text-center py-2 bg-gray-50 hover:bg-green-700 hover:text-white border border-gray-200 hover:border-green-700 text-xs font-bold text-gray-700 rounded-xl transition-all"
                              >
                                Payer {(config?.mensualite || 0).toLocaleString()} CFA
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedStudentForPayments(null)} 
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Fermer
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
