import * as React from 'react';
import { 
  Bed, 
  Home, 
  Plus, 
  UserMinus, 
  Search, 
  X, 
  Check, 
  Activity, 
  Info,
  Sparkles,
  Layers,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Eleve } from '../types';

interface Occupant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  photo_url?: string;
  lit_numero: number;
}

interface Dortoir {
  id: number;
  nom: string;
  capacite_lits: number;
  occupants: Occupant[];
}

export function Housing() {
  const { eleves, updateEleve } = useApp();
  const [dortoirs, setDortoirs] = React.useState<Dortoir[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDortoir, setSelectedDortoir] = React.useState<number | null>(null);
  
  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [assignTarget, setAssignTarget] = React.useState<{ dortoirId: number; litNumero: number } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [assigning, setAssigning] = React.useState(false);

  // Charger les dortoirs
  const fetchDortoirs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dortoirs');
      if (res.ok) {
        const data = await res.json();
        setDortoirs(data);
        if (data.length > 0 && selectedDortoir === null) {
          setSelectedDortoir(data[0].id);
        }
      }
    } catch (e) {
      console.error('Erreur dortoirs:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDortoirs();
  }, [eleves]); // Re-fetch quand les élèves sont modifiés

  // Liste des talibés internes non assignés à un dortoir
  const unassignedStudents = eleves.filter(
    (e) => e.statut === 'Actif' && e.statut_pension === 'Interne' && (!e.dortoir_id || e.dortoir_id === 0)
  );

  const filteredStudents = unassignedStudents.filter((e) =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Assigner un élève à un lit
  const handleAssignStudent = async (student: Eleve) => {
    if (!assignTarget) return;
    setAssigning(true);
    try {
      const updated = {
        ...student,
        dortoir_id: assignTarget.dortoirId,
        lit_numero: assignTarget.litNumero
      };
      await updateEleve(updated);
      setIsAssignModalOpen(false);
      setAssignTarget(null);
      setSearchQuery('');
      await fetchDortoirs();
    } catch (e) {
      console.error('Erreur assignation:', e);
    } finally {
      setAssigning(false);
    }
  };

  // Libérer un lit
  const handleFreeBed = async (studentId: number) => {
    const student = eleves.find(e => e.id === studentId);
    if (!student) return;
    
    if (window.confirm(`Voulez-vous libérer le lit de ${student.prenom} ${student.nom} ?`)) {
      try {
        const updated = {
          ...student,
          dortoir_id: undefined, // Will be serialized as null in server.ts (dortoir_id || null)
          lit_numero: undefined
        };
        await updateEleve(updated);
        await fetchDortoirs();
      } catch (e) {
        console.error('Erreur libération de lit:', e);
      }
    }
  };

  // Calcul des stats
  const totalBeds = dortoirs.reduce((acc, cur) => acc + cur.capacite_lits, 0);
  const occupiedBeds = dortoirs.reduce((acc, cur) => acc + cur.occupants.length, 0);
  const freeBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const currentDortoir = dortoirs.find(d => d.id === selectedDortoir);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hébergement & Dortoirs</h1>
          <p className="text-slate-500 text-sm">Visualisez la grille des lits, gérez les chambres et attribuez des logements aux élèves internes.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center gap-5"
        >
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Lits</span>
            <span className="text-2xl font-black text-slate-800 block mt-0.5">{totalBeds}</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center gap-5"
        >
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Occupés</span>
            <span className="text-2xl font-black text-slate-800 block mt-0.5">{occupiedBeds}</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center gap-5"
        >
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lits Libres</span>
            <span className="text-2xl font-black text-slate-800 block mt-0.5">{freeBeds}</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center gap-5"
        >
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Taux d'occupation</span>
            <span className="text-2xl font-black text-slate-800 block mt-0.5">{occupancyRate}%</span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Dormitory List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Dortoirs</h2>
          <div className="space-y-2">
            {loading && (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}
            {!loading && dortoirs.map((d) => {
              const occRate = Math.round((d.occupants.length / d.capacite_lits) * 100);
              const isActive = selectedDortoir === d.id;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDortoir(d.id)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all ${
                    isActive
                      ? 'bg-slate-900 border-slate-950 text-white shadow-xl shadow-slate-900/20'
                      : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Home className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="font-bold text-sm tracking-tight">{d.nom}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {d.occupants.length}/{d.capacite_lits}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${isActive ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                      style={{ width: `${occRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] opacity-60">Occupation</span>
                    <span className="text-[10px] font-bold">{occRate}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Bed Allocation Grid */}
        <div className="lg:col-span-3 space-y-6">
          {currentDortoir ? (
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-100/50">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{currentDortoir.nom}</h3>
                  <p className="text-xs text-slate-400 mt-1">Cliquez sur un lit libre pour y affecter un élève interne.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                    Capacité totale : {currentDortoir.capacite_lits} lits
                  </span>
                </div>
              </div>

              {/* Grid of Beds */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {Array.from({ length: currentDortoir.capacite_lits }).map((_, index) => {
                  const litNum = index + 1;
                  const occupant = currentDortoir.occupants.find((o) => o.lit_numero === litNum);

                  if (occupant) {
                    // Bed is occupied
                    return (
                      <motion.div
                        key={litNum}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-indigo-50/50 border border-indigo-100/80 p-5 rounded-3xl relative group overflow-hidden flex flex-col justify-between aspect-square"
                      >
                        <div className="flex justify-between items-start">
                          <div className="bg-indigo-600 text-white rounded-xl px-2 py-1 text-[10px] font-bold shadow-lg shadow-indigo-600/10">
                            Lit #{litNum}
                          </div>
                          <button
                            onClick={() => handleFreeBed(occupant.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                            title="Libérer ce lit"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col items-center text-center">
                          <img
                            src={occupant.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${occupant.prenom}`}
                            alt={occupant.prenom}
                            className="w-12 h-12 rounded-full object-cover border border-white shadow-md bg-white"
                          />
                          <h4 className="font-bold text-slate-800 text-xs mt-2 truncate max-w-full">
                            {occupant.prenom} {occupant.nom}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5 tracking-wider font-mono">
                            {occupant.matricule}
                          </span>
                        </div>
                      </motion.div>
                    );
                  } else {
                    // Bed is free
                    return (
                      <motion.button
                        key={litNum}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setAssignTarget({ dortoirId: currentDortoir.id, litNumero: litNum });
                          setIsAssignModalOpen(true);
                        }}
                        className="border-2 border-dashed border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/10 transition-all aspect-square cursor-pointer"
                      >
                        <div className="border border-slate-200 rounded-xl px-2 py-1 text-[10px] font-bold mb-3">
                          Lit #{litNum}
                        </div>
                        <Plus className="w-5 h-5 mb-1.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Attribuer</span>
                      </motion.button>
                    );
                  }
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
              <Bed className="w-12 h-12 text-slate-300 mb-4" />
              <p className="font-bold">Aucun dortoir configuré.</p>
              <p className="text-xs text-slate-400 mt-1">Créez des dortoirs dans les paramètres de la base de données.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && assignTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAssignModalOpen(false);
                setAssignTarget(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Attribuer le Lit #{assignTarget.litNumero}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Dortoir : {currentDortoir?.nom}</p>
                </div>
                <button
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setAssignTarget(null);
                  }}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou matricule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                />
              </div>

              {/* Students List */}
              <div className="flex-1 max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleAssignStudent(student)}
                      disabled={assigning}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 text-left transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.prenom}`}
                          alt={student.prenom}
                          className="w-8 h-8 rounded-full object-cover bg-white shadow-sm border border-slate-100"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">
                            {student.prenom} {student.nom}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono font-medium block">
                            {student.matricule}
                          </span>
                        </div>
                      </div>
                      <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center p-8 text-slate-400 flex flex-col items-center justify-center border border-dashed border-slate-100 rounded-3xl">
                    <Info className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold">Aucun élève interne libre</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                      Tous les élèves internes actifs ont déjà un lit assigné, ou aucun élève ne correspond à votre recherche.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
