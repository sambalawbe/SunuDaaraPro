import * as React from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Login() {
  const { login } = useApp();
  const [email, setEmail] = React.useState('admin@sunudaara.sn');
  const [password, setPassword] = React.useState('admin');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Petite simulation de délai réseau
      await new Promise((resolve) => setTimeout(resolve, 800));
      const success = await login(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-slate-200/50 mb-4 border border-slate-100"
          >
            <img src="/src/public/LOGO INTERNAT.png" alt="Sama Daara" className="w-16 h-16 object-contain" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sunu Daara <span className="text-emerald-600">Pro</span></h1>
          <p className="text-slate-400 mt-2 text-sm font-medium italic">Système de Gestion d'Internat Social</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 p-10 border border-slate-50 relative overflow-hidden"
        >
          {/* Background Decorative */}
          <div className="absolute top-0 right-0 p-8">
             <ShieldCheck className="w-24 h-24 text-slate-50 opacity-20 -rotate-12" />
          </div>

          <div className="relative">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Connexion Sécurisée</h2>
            <p className="text-xs text-slate-400 mb-8 font-medium italic">Entrez vos identifiants pour accéder au back-office.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-bold leading-tight">{error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100/50 rounded-2xl pl-12 pr-4 py-4 text-slate-700 font-medium focus:border-emerald-500 outline-none transition-all"
                    placeholder="nom@daara.sn"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100/50 rounded-2xl pl-12 pr-12 py-4 text-slate-700 font-medium focus:border-emerald-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20" />
                  <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Rester connecté</span>
                </label>
                <button type="button" className="text-xs font-bold text-emerald-600 hover:underline">Oublié ?</button>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full bg-slate-900 text-white rounded-[24px] py-4 font-bold text-sm shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all",
                  isLoading && "opacity-80 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Footer Info */}
        <p className="text-center mt-8 text-[11px] text-slate-400 font-medium uppercase tracking-widest leading-loose">
          Accès strictement réservé au personnel de l'internat.<br />
          © 2024 Sunu Daara Pro - Daara Sama Daara
        </p>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
