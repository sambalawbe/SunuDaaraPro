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
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

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
  const [collapsed, setCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'eleves', label: 'Élèves', icon: Users },
    { id: 'enseignants', label: 'Enseignants', icon: UserRound },
    { id: 'finances', label: 'Finances', icon: Wallet },
    { id: 'logistique', label: 'Logistique', icon: Package },
    { id: 'logement', label: 'Hébergement', icon: Bed },
    { id: 'sante', label: 'Santé', icon: Stethoscope },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
  ];

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
              <div className="w-8 h-8 bg-green-700 rounded flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">S</span>
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
          <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg group transition-colors">
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-700" />
            {!collapsed && <span className="ml-3">Déconnexion</span>}
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
                placeholder="Rechercher un élève, un matricule..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             <button title="Notifications" className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />
            <button className="flex items-center gap-3 p-1 pl-1 pr-2 hover:bg-gray-50 rounded-full transition-all group">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold border border-green-200">
                AD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 leading-tight">Admin Daara</p>
                <p className="text-xs text-gray-400">Directeur</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
            </button>
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
                  <div className="w-8 h-8 bg-green-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
