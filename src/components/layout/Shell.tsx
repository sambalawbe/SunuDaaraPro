import * as React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Wallet, 
  Package, 
  Bed, 
  Stethoscope, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Globe,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp } from '../../context/AppContext';

interface SidebarItemProps {
  key?: string | number;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3 transition-colors duration-200 group relative",
      active 
        ? "bg-green-50 text-green-700 font-medium" 
        : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-green-700" : "text-gray-400 group-hover:text-green-600")} />
    {!collapsed && (
      <span className="ml-3 text-sm">{label}</span>
    )}
    {active && (
      <motion.div
        layoutId="active-nav"
        className="absolute left-0 w-1 h-full bg-green-700"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </button>
);

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Shell({ children, activeTab, setActiveTab }: ShellProps) {
  const { canAccess, currentUser, logout, language, setLanguage, t } = useApp();
  const [collapsed, setCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'eleves', label: t('students'), icon: Users },
    { id: 'enseignants', label: t('teachers'), icon: UserRound },
    { id: 'finances', label: t('finances'), icon: Wallet },
    { id: 'logistique', label: t('logistics'), icon: Package },
    { id: 'logement', label: t('housing'), icon: Bed },
    { id: 'sante', label: t('health'), icon: Stethoscope },
    { id: 'communications', label: t('communications'), icon: MessageSquare },
    { id: 'parametres', label: t('settings'), icon: ShieldCheck },
  ].filter(item => canAccess(item.id));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        className="hidden md:flex flex-col bg-white border-r border-gray-200 z-30"
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <img src="/src/public/LOGO INTERNAT.png" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-bold text-lg text-gray-800 whitespace-nowrap">Sunu Daara Pro</span>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 mx-auto"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              collapsed={collapsed}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className={cn("p-4 border-t border-gray-100", collapsed && "flex justify-center")}>
          <button 
            onClick={() => logout()}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg group transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-700" />
            {!collapsed && <span className="ml-3">{t('logout')}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 -ml-2 text-gray-500" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-xs font-bold text-gray-700"
              >
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsLangDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 p-1.5 flex flex-col gap-1"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage('fr');
                          setIsLangDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-between",
                          language === 'fr' ? "text-green-700 bg-green-50/50 font-bold" : "text-gray-600"
                        )}
                      >
                        <span>Français</span>
                        {language === 'fr' && <span className="w-1.5 h-1.5 rounded-full bg-green-600" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage('wo');
                          setIsLangDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-between",
                          language === 'wo' ? "text-green-700 bg-green-50/50 font-bold" : "text-gray-600"
                        )}
                      >
                        <span>Wolof</span>
                        {language === 'wo' && <span className="w-1.5 h-1.5 rounded-full bg-green-600" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage('ar');
                          setIsLangDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-between",
                          language === 'ar' ? "text-green-700 bg-green-50/50 font-bold" : "text-gray-600"
                        )}
                      >
                        <span>العربية</span>
                        {language === 'ar' && <span className="w-1.5 h-1.5 rounded-full bg-green-600" />}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button title="Notifications" className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />
            <div className="relative">
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-3 p-1 pl-1 pr-2 hover:bg-gray-50 rounded-full transition-all group border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center text-green-700 font-semibold border border-green-200">
                  {currentUser ? `${currentUser.prenom[0]}${currentUser.nom[0]}` : ''}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-700 leading-tight transition-colors">{currentUser?.prenom} {currentUser?.nom}</p>
                  <p className="text-xs text-gray-400 capitalize">{currentUser?.role.toLowerCase().replace('_', ' ')}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsUserDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 p-2 flex flex-col gap-1"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('status')}</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{currentUser?.prenom} {currentUser?.nom}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsPasswordModalOpen(true);
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-green-700 transition-colors flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span>{t('change_password')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>{t('logout')}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Center */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto h-full">
             {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col"
            >
               <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded flex items-center justify-center">
                    <img src="/src/public/LOGO INTERNAT.png" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-bold text-lg text-gray-800">Sunu Daara Pro</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 py-4">
                {menuItems.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                ))}
              </nav>
              <div className="p-4 border-t border-gray-100">
                <button 
                  onClick={() => logout()}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg group transition-colors"
                >
                  <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-700" />
                  <span className="ml-3 font-semibold">{t('logout')}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsPasswordModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 overflow-hidden z-50 text-slate-800"
            >
              <div className="absolute top-0 right-0 p-6">
                <Lock className="w-12 h-12 text-slate-50 opacity-10 rotate-12" />
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-1">{t('change_password')}</h2>
              <p className="text-xs text-slate-400 mb-6 italic">Modifiez votre accès pour plus de sécurité.</p>

              <PasswordForm onClose={() => setIsPasswordModalOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PasswordFormProps {
  onClose: () => void;
}

function PasswordForm({ onClose }: PasswordFormProps) {
  const { changePassword, currentUser, t } = useApp();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (newPassword !== confirmPassword) {
      setError(t('password_error_mismatch'));
      return;
    }

    if (newPassword.length < 4) {
      setError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await changePassword(currentUser.id, currentPassword, newPassword);
      if (result.success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error === 'Le mot de passe actuel est incorrect.' ? t('password_error_incorrect') : (result.error || 'Une erreur est survenue.'));
      }
    } catch (err) {
      setError('Une erreur réseau est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-center gap-2.5 text-red-600 text-xs font-bold">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 p-3.5 rounded-xl flex items-center gap-2.5 text-green-600 text-xs font-bold">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span>{t('password_changed_success')}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
          {t('current_password')}
        </label>
        <div className="relative">
          <input 
            type={showCurrentPassword ? "text" : "password"}
            required
            disabled={isLoading || success}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-4 pr-10 py-3 text-slate-700 text-sm font-medium focus:border-slate-400 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
          {t('new_password')}
        </label>
        <div className="relative">
          <input 
            type={showNewPassword ? "text" : "password"}
            required
            disabled={isLoading || success}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-4 pr-10 py-3 text-slate-700 text-sm font-medium focus:border-slate-400 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
          {t('confirm_password')}
        </label>
        <div className="relative">
          <input 
            type={showConfirmPassword ? "text" : "password"}
            required
            disabled={isLoading || success}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-4 pr-10 py-3 text-slate-700 text-sm font-medium focus:border-slate-400 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button 
          type="button" 
          disabled={isLoading || success}
          onClick={onClose} 
          className="flex-1 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs cursor-pointer disabled:opacity-50"
        >
          {t('cancel')}
        </button>
        <button 
          type="submit" 
          disabled={isLoading || success}
          className="flex-1 bg-slate-900 text-white rounded-xl py-3 text-xs font-bold shadow-lg shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            t('save')
          )}
        </button>
      </div>
    </form>
  );
}
