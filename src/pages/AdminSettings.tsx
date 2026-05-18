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
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp } from '../context/AppContext';
import { UserRole, Utilisateur } from '../types';

export function AdminSettings() {
  const { utilisateurs, auditLogs, addUtilisateur, toggleUserStatus, currentUser } = useApp();
  const [activeTab, setActiveTab] = React.useState<'users' | 'logs'>('users');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form state
  const [newUser, setNewUser] = React.useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'ENSEIGNANT' as UserRole
  });

  const ROLE_COLORS: Record<UserRole, string> = {
    'SUPER_ADMIN': 'bg-red-50 text-red-600 border-red-100',
    'INTENDANT': 'bg-blue-50 text-blue-600 border-blue-100',
    'MEDECIN': 'bg-purple-50 text-purple-600 border-purple-100',
    'ENSEIGNANT': 'bg-green-50 text-green-600 border-green-100'
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Créer un compte personnel
          </button>
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
          <ShieldCheck className="w-4 h-4" />
          Utilisateurs & Rôles
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
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
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
                            ROLE_COLORS[user.role]
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
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold border",
                          ROLE_COLORS[user.role]
                        )}>
                          {user.role.replace('_', ' ')}
                        </span>
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
        ) : (
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
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-slate-900 outline-none transition-colors appearance-none font-bold text-slate-700"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                      >
                        <option value="ENSEIGNANT">ENSEIGNANT (Oustaz)</option>
                        <option value="INTENDANT">INTENDANT (Logistique)</option>
                        <option value="MEDECIN">MÉDECIN / INFIRMIER</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN (Directeur)</option>
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
                    className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-slate-900 text-white rounded-[20px] py-4 font-bold shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Valider le Compte
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
