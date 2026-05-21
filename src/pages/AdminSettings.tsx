import * as React from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Lock, 
  UserCircle,
  Eye,
  EyeOff,
  Activity,
  AlertTriangle,
  Database,
  Download,
  Plus,
  Edit3,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp } from '../context/AppContext';
import { UserRole, Utilisateur, Role } from '../types';

const ALL_PERMISSIONS = [
  { code: 'dashboard', label: 'Tableau de bord', description: 'Vue générale et statistiques globales' },
  { code: 'eleves', label: 'Gestion des Élèves', description: 'Inscription, suivi et dossiers des élèves' },
  { code: 'enseignants', label: 'Gestion des Enseignants', description: 'Dossiers, salaires et affectations' },
  { code: 'finances', label: 'Finances & Dons', description: 'Trésorerie, dons reçus et dépenses' },
  { code: 'logistique', label: 'Logistique & Stock', description: 'Inventaire de la daara, fournitures et repas' },
  { code: 'logement', label: 'Hébergement (Dortoirs)', description: 'Attribution des lits et gestion des dortoirs' },
  { code: 'sante', label: 'Suivi Médical', description: 'Fiches de santé et historique des consultations' },
  { code: 'communications', label: 'Communications & SMS', description: 'Envoi de SMS et alertes aux parents' },
  { code: 'parametres', label: 'Espace Admin (Paramètres)', description: 'Gestion des utilisateurs et rôles' },
];

const PERM_LABELS: Record<string, string> = {
  dashboard: 'Bord',
  eleves: 'Élèves',
  enseignants: 'Profs',
  finances: 'Finances',
  logistique: 'Logistique',
  logement: 'Dortoirs',
  sante: 'Santé',
  communications: 'SMS',
  parametres: 'Admin',
};

export function AdminSettings() {
  const { 
    utilisateurs, 
    auditLogs, 
    addUtilisateur, 
    toggleUserStatus, 
    updateUserRole, 
    currentUser, 
    t,
    roles,
    addRole,
    updateRole,
    deleteRole
  } = useApp();
  
  const [activeTab, setActiveTab] = React.useState<'users' | 'roles' | 'logs' | 'backup'>('users');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);

  // Form state
  const [newUser, setNewUser] = React.useState({
    nom: '',
    prenom: '',
    email: '',
    role: ''
  });

  // Form state for role
  const [roleForm, setRoleForm] = React.useState({
    libelle: '',
    code: '',
    description: '',
    permissions: [] as string[]
  });

  React.useEffect(() => {
    if (roles.length > 0 && !newUser.role) {
      setNewUser(prev => ({ 
        ...prev, 
        role: roles.find(r => r.code === 'ENSEIGNANT')?.code || roles[0].code 
      }));
    }
  }, [roles]);

  const getRoleColor = (roleCode: string) => {
    const defaultColors: Record<string, string> = {
      'SUPER_ADMIN': 'bg-red-50 text-red-600 border-red-100',
      'INTENDANT': 'bg-blue-50 text-blue-600 border-blue-100',
      'MEDECIN': 'bg-purple-50 text-purple-600 border-purple-100',
      'ENSEIGNANT': 'bg-green-50 text-green-600 border-green-100'
    };
    
    if (defaultColors[roleCode]) return defaultColors[roleCode];
    
    const colors = [
      'bg-amber-50 text-amber-600 border-amber-100',
      'bg-emerald-50 text-emerald-600 border-emerald-100',
      'bg-cyan-50 text-cyan-600 border-cyan-100',
      'bg-indigo-50 text-indigo-600 border-indigo-100',
      'bg-rose-50 text-rose-600 border-rose-100',
      'bg-orange-50 text-orange-600 border-orange-100',
      'bg-violet-50 text-violet-600 border-violet-100'
    ];
    let sum = 0;
    for (let i = 0; i < roleCode.length; i++) {
      sum += roleCode.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Accès Refusé</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Cette section est exclusivement réservée à l'administrateur principal. 
          Veuillez contacter le directeur pour toute modification de compte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Espace Super Admin</h1>
          <p className="text-gray-500 text-sm italic">Gestion du personnel et traçabilité des actions.</p>
        </div>
        <div>
          {activeTab === 'users' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Créer un compte personnel
            </button>
          )}
          {activeTab === 'roles' && (
            <button 
              onClick={() => {
                setEditingRole(null);
                setRoleForm({
                  libelle: '',
                  code: '',
                  description: '',
                  permissions: ['dashboard']
                });
                setIsRoleModalOpen(true);
              }}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Créer un nouveau rôle
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 bg-white p-1 rounded-2xl border border-gray-100 w-fit">
        <button 
          onClick={() => setActiveTab('users')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'users' ? "bg-slate-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <UserCircle className="w-4 h-4" />
          Utilisateurs
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'roles' ? "bg-slate-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          Configuration des Rôles
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'logs' ? "bg-slate-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <History className="w-4 h-4" />
          Journal d'Audit (Logs)
        </button>
        <button 
          onClick={() => setActiveTab('backup')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'backup' ? "bg-slate-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Database className="w-4 h-4" />
          Sauvegarde (Backup)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-black"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">Personnel</th>
                    <th className="px-8 py-5">Email</th>
                    <th className="px-8 py-5">Rôle</th>
                    <th className="px-8 py-5">Date Création</th>
                    <th className="px-8 py-5 text-center">Statut</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 italic">
                  {utilisateurs.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                            getRoleColor(user.role)
                          )}>
                            {user.prenom[0]}{user.nom[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.prenom} {user.nom}</p>
                            <p className="text-[10px] text-slate-400 font-medium">ID: {user.id.toString().padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-slate-600">{user.email}</span>
                      </td>
                      <td className="px-8 py-5">
                        {user.id === currentUser?.id ? (
                          <span className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold border opacity-80 cursor-not-allowed inline-block",
                            getRoleColor(user.role)
                          )}>
                            {roles.find(r => r.code === user.role)?.libelle || user.role}
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={async (e) => {
                              const success = await updateUserRole(user.id, e.target.value);
                              if (!success) {
                                alert("Une erreur est survenue lors de la modification du rôle.");
                              }
                            }}
                            className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-bold border focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer bg-transparent",
                              getRoleColor(user.role)
                            )}
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.code} className="text-slate-800 bg-white">
                                {r.libelle}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500">
                        {new Date(user.date_creation).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={() => toggleUserStatus(user.id)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                            user.statut === 'Actif' ? "bg-green-500" : "bg-slate-300"
                          )}
                        >
                          <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            user.statut === 'Actif' ? "translate-x-6" : "translate-x-1"
                          )} />
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'roles' && (
          <motion.div 
            key="roles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-black"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">Rôle</th>
                    <th className="px-8 py-5">Description</th>
                    <th className="px-8 py-5">Modules Accessibles</th>
                    <th className="px-8 py-5 text-center">Personnel</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 italic">
                  {roles.map((role) => {
                    const userCount = utilisateurs.filter(u => u.role === role.code).length;
                    return (
                      <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
                              getRoleColor(role.code)
                            )}>
                              {role.code.slice(0, 3)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 not-italic">{role.libelle}</p>
                              <p className="text-[10px] text-slate-400 font-mono">CODE: {role.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 max-w-xs">
                          <p className="text-sm text-slate-600 line-clamp-2 not-italic font-medium">
                            {role.description || "Aucune description renseignée."}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-1 max-w-md not-italic">
                            {role.code === 'SUPER_ADMIN' ? (
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px]">
                                Accès Total
                              </span>
                            ) : role.permissions.length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic">Aucun accès</span>
                            ) : (
                              role.permissions.map(p => (
                                <span key={p} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/50 text-slate-600 text-[10px] font-medium">
                                  {PERM_LABELS[p] || p}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center font-bold not-italic">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold",
                            userCount > 0 ? "bg-slate-100 text-slate-800" : "bg-slate-50 text-slate-400"
                          )}>
                            {userCount}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right not-italic">
                          {role.code === 'SUPER_ADMIN' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 select-none">
                              <Lock className="w-3.5 h-3.5" />
                              Système
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 justify-end">
                              <button 
                                onClick={() => {
                                  setEditingRole(role);
                                  setRoleForm({
                                    libelle: role.libelle,
                                    code: role.code,
                                    description: role.description || '',
                                    permissions: [...role.permissions]
                                  });
                                  setIsRoleModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                                title="Modifier le rôle"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (userCount > 0) {
                                    alert(`Impossible de supprimer ce rôle car il est actuellement attribué à ${userCount} utilisateur(s). Veuillez d'abord réaffecter ces utilisateurs.`);
                                    return;
                                  }
                                  if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.libelle}" ?`)) {
                                    await deleteRole(role.id);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                title="Supprimer le rôle"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div 
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-black"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Journal des Événements</h3>
                  <p className="text-xs text-slate-400 font-medium">Surveillance en temps réel des actions administrateur.</p>
                </div>
              </div>
              <button className="text-xs font-bold text-slate-900 hover:underline">Exporter CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Utilisateur</th>
                    <th className="px-8 py-4">Action</th>
                    <th className="px-8 py-4">Date & Heure</th>
                    <th className="px-8 py-4">Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 font-bold text-slate-800">{log.utilisateur_nom}</td>
                      <td className="px-8 py-4">
                        <span className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs text-slate-400">
                        {new Date(log.date_heure).toLocaleString()}
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-mono text-[10px] text-slate-400">{log.adresse_ip || 'Internal'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'backup' && (
          <motion.div 
            key="backup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-black max-w-2xl space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t('db_backup')}</h3>
                <p className="text-xs text-slate-400 mt-1">{t('db_backup_sub')}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-3 font-medium text-xs text-slate-600 leading-relaxed">
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span>{t('db_type')} :</span>
                <span className="font-bold text-slate-800 font-mono">SQLite 3 (Local)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span>{t('db_file')} :</span>
                <span className="font-bold text-slate-800 font-mono">sama_daara.db</span>
              </div>
              <div className="flex justify-between">
                <span>{t('db_path')} :</span>
                <span className="font-bold text-slate-800 font-mono">/Users/yaya/Documents/GitHub/SunuDaaraPro/sama_daara.db</span>
              </div>
            </div>

            <div className="flex bg-amber-50 border border-amber-100 p-5 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="ml-3 space-y-2">
                <h4 className="text-xs font-bold text-amber-800">{t('db_warning_title')}</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  {t('db_warning_desc')}
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => {
                window.location.href = '/api/backup';
              }}
              className="w-full bg-slate-900 text-white rounded-[20px] py-4 font-bold text-sm shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t('db_download_btn')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Créer Compte */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <Lock className="w-12 h-12 text-slate-50 opacity-10 rotate-12" />
              </div>
              
              <h2 className="text-2xl font-extrabold mb-2 text-slate-900">Nouveau Personnel</h2>
              <p className="text-sm text-slate-400 mb-8 italic">Affectez un rôle et une identité numérique sécurisée.</p>

              <form className="space-y-6 text-black" onSubmit={(e) => {
                e.preventDefault();
                addUtilisateur({
                  ...newUser,
                  statut: 'Actif',
                  mot_de_passe: 'Temporary123'
                });
                setIsModalOpen(false);
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Prénom</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-slate-900 outline-none transition-colors"
                      value={newUser.prenom}
                      onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nom de famille</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-slate-900 outline-none transition-colors"
                      value={newUser.nom}
                      onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Adresse Email Pro</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-slate-900 outline-none transition-colors"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Rôle & Permissions</label>
                  <div className="relative">
                     <select 
                        required 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-slate-900 outline-none transition-colors appearance-none font-bold text-slate-700 cursor-pointer"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.code}>
                            {r.libelle} {r.code === 'SUPER_ADMIN' ? '(Directeur)' : ''}
                          </option>
                        ))}
                      </select>
                      <ShieldCheck className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    Un mot de passe temporaire sera généré automatiquement. L'utilisateur devra le modifier lors de sa première connexion.
                  </p>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-slate-900 text-white rounded-[20px] py-4 font-bold shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Valider le Compte
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Créer/Modifier Rôle */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsRoleModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <Lock className="w-12 h-12 text-slate-50 opacity-10 rotate-12" />
              </div>
              
              <h2 className="text-2xl font-extrabold mb-2 text-slate-900">
                {editingRole ? 'Modifier le Rôle' : 'Nouveau Rôle'}
              </h2>
              <p className="text-sm text-slate-400 mb-8 italic">
                {editingRole ? 'Modifiez les informations et les privilèges d\'accès du rôle.' : 'Configurez les accès et l\'identité pour un nouveau rôle.'}
              </p>

              <form 
                className="space-y-6 text-black max-h-[70vh] overflow-y-auto pr-2" 
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  if (!roleForm.libelle.trim()) {
                    alert("Le libellé est requis.");
                    return;
                  }
                  if (!roleForm.code.trim()) {
                    alert("Le code du rôle est requis.");
                    return;
                  }
                  
                  let success = false;
                  if (editingRole) {
                    success = await updateRole({
                      id: editingRole.id,
                      libelle: roleForm.libelle,
                      code: roleForm.code,
                      description: roleForm.description,
                      permissions: roleForm.permissions
                    });
                  } else {
                    success = await addRole({
                      libelle: roleForm.libelle,
                      code: roleForm.code,
                      description: roleForm.description,
                      permissions: roleForm.permissions
                    });
                  }
                  
                  if (success) {
                    setIsRoleModalOpen(false);
                  } else {
                    alert(editingRole ? "Erreur lors de la modification du rôle." : "Erreur lors de la création du rôle. Le code est peut-être déjà utilisé.");
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nom / Libellé</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-slate-900 outline-none transition-colors font-bold text-slate-800"
                      value={roleForm.libelle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRoleForm(prev => {
                          const updated = { ...prev, libelle: val };
                          if (!editingRole) {
                            // Auto-generate code from libelle
                            updated.code = val
                              .toUpperCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/[^A-Z0-9]/g, '_')
                              .replace(/__+/g, '_')
                              .replace(/^_+|_+$/g, '');
                          }
                          return updated;
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Code du Rôle</label>
                    <input 
                      type="text" 
                      required 
                      disabled={!!editingRole}
                      placeholder="E.g. COMPTABLE"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-slate-900 outline-none transition-colors font-mono font-bold text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={roleForm.code}
                      onChange={(e) => {
                        const codeVal = e.target.value
                          .toUpperCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^A-Z0-9_]/g, '');
                        setRoleForm({ ...roleForm, code: codeVal });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                  <textarea 
                    rows={2}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-slate-900 outline-none transition-colors text-slate-700 font-medium"
                    placeholder="Décrivez les responsabilités de ce rôle..."
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">Modules & Permissions d'Accès</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = roleForm.permissions.includes(perm.code);
                      return (
                        <div 
                          key={perm.code}
                          onClick={() => {
                            setRoleForm(prev => {
                              const hasPerm = prev.permissions.includes(perm.code);
                              const permissions = hasPerm
                                ? prev.permissions.filter(p => p !== perm.code)
                                : [...prev.permissions, perm.code];
                              return { ...prev, permissions };
                            });
                          }}
                          className={cn(
                            "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none",
                            isChecked 
                              ? "border-slate-900 bg-slate-50/50 shadow-sm" 
                              : "border-slate-100 bg-white hover:border-slate-200"
                          )}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="mt-1 rounded border-slate-300 text-slate-900 focus:ring-slate-900 pointer-events-none"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{perm.label}</p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">{perm.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsRoleModalOpen(false)} 
                    className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-slate-900 text-white rounded-[20px] py-4 font-bold shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {editingRole ? 'Enregistrer' : 'Créer le Rôle'}
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
