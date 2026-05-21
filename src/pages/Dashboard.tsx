import * as React from 'react';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Wallet,
  Stethoscope,
  Package,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp } from '../context/AppContext';

// Couleurs pour les graphiques
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#7c3aed'];

const evolutionFinances = [
  { name: 'Jan', entries: 4000, exits: 2400 },
  { name: 'Feb', entries: 3000, exits: 1398 },
  { name: 'Mar', entries: 2000, exits: 9800 },
  { name: 'Apr', entries: 2780, exits: 3908 },
  { name: 'May', entries: 1890, exits: 4800 },
  { name: 'Jun', entries: 2390, exits: 3800 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, className }: StatCardProps) => {
  const { t } = useApp();
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn("bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md", className)}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className="p-3 bg-green-50 rounded-xl text-green-600">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          {trend.isUp ? (
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
          <span className={cn("text-sm font-medium", trend.isUp ? "text-green-500" : "text-red-500")}>
            {trend.value}%
          </span>
          <span className="text-xs text-gray-400 ml-1">{t('vs_last_month')}</span>
        </div>
      )}
    </motion.div>
  );
};

interface DashboardProps {
  onNavigate?: (tabId: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { eleves, enseignants, articles, consultations, mouvements, logs, dons, depenses, paiements, paies, t } = useApp();

  // Calcul des statistiques dynamiques
  const totalEleves = eleves.length;
  const hafizCount = eleves.filter(e => e.niveau_actuel === 'Hafiz').length;
  const stockCritiqueCount = articles.filter(a => a.quantite <= a.seuil_alerte).length;
  
  // Finances
  const totalDons = dons.reduce((sum, d) => sum + d.montant, 0);
  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const totalPaiements = (paiements || []).reduce((sum, p) => sum + p.montant, 0);
  const totalPaies = (paies || []).reduce((sum, p) => sum + p.montant, 0);
  const soldeCaisse = totalDons + totalPaiements - totalDepenses - totalPaies;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const donsMois = dons
    .filter(d => {
      const date = new Date(d.date_don);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, d) => sum + d.montant, 0);

  const depensesMois = depenses
    .filter(d => {
      const date = new Date(d.date_depense);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, d) => sum + d.montant, 0) +
    (paies || [])
    .filter(p => {
      const date = new Date(p.date_paiement);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.montant, 0);

  // Seuil critique fund alert (ex: less than 200,000 CFA for demonstration)
  const isBudgetLow = soldeCaisse < 200000;

  const handleNavigate = (tabId: string) => {
    console.log('[Dashboard] handleNavigate called with:', tabId, 'onNavigate prop exists:', !!onNavigate);
    if (onNavigate) {
      onNavigate(tabId);
    } else {
      console.warn('[Dashboard] Warning: onNavigate prop is not defined in Dashboard component!');
    }
  };

  // Distribution par niveau pour le graphique
  const niveaux = ['Débutant', 'Intermédiaire', 'Hafiz'];
  const dynamicDistribution = niveaux.map(n => ({
    name: n,
    value: eleves.filter(e => e.niveau_actuel === n).length
  }));

  // Activités récentes consolidées
  const recentActivities = [
    ...dons.slice(0, 1).map(d => ({
      id: `don-${d.id}`,
      user: d.donateur_nom,
      action: `Don reçu: ${d.montant.toLocaleString()} CFA`,
      time: 'Récent',
      icon: Wallet,
      color: 'bg-green-50 text-green-600'
    })),
    ...depenses.slice(0, 1).map(dep => ({
      id: `dep-${dep.id}`,
      user: dep.libelle,
      action: `Dépense: -${dep.montant.toLocaleString()} CFA`,
      time: 'Récent',
      icon: TrendingDown,
      color: 'bg-red-50 text-red-600'
    })),
    ...consultations.slice(0, 1).map(c => ({
      id: `c-${c.id}`,
      user: `${c.eleve_prenom} ${c.eleve_nom}`,
      action: `Santé: ${c.diagnostic}`,
      time: 'Aujourd\'hui',
      icon: Stethoscope,
      color: 'bg-orange-50 text-orange-600'
    })),
    ...mouvements.slice(0, 1).map(m => ({
      id: `m-${m.id}`,
      user: 'Stock',
      action: `${m.type_mouvement}: ${m.quantite} unités`,
      time: 'Récent',
      icon: Package,
      color: 'bg-blue-50 text-blue-600'
    }))
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('dashboard_title')}</h1>
          <p className="text-gray-500">{t('dashboard_subtitle')}</p>
        </div>
        <div className="flex gap-2 text-black">
           <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            {t('export_report')}
          </button>
          <button 
            onClick={() => handleNavigate('finances')}
            className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {t('new_don')}
          </button>
        </div>
      </header>

      {/* Alertes Budget */}
      {isBudgetLow && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 text-red-700"
        >
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">{t('treasury_alert_title')}</p>
            <p className="text-xs opacity-80">{t('treasury_alert_desc')}</p>
          </div>
          <button 
            onClick={() => handleNavigate('finances')}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
          >
            {t('view_details')}
          </button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('stats_treasury')} 
          value={`${soldeCaisse.toLocaleString()} CFA`} 
          icon={Wallet} 
          trend={{ value: 12, isUp: true }} 
          className={soldeCaisse < 100000 ? "border-red-100 bg-red-50/10" : ""}
        />
        <StatCard 
          title={t('stats_dons_mois')} 
          value={`${donsMois.toLocaleString()} CFA`} 
          icon={TrendingUp} 
          trend={{ value: 8, isUp: true }} 
        />
        <StatCard 
          title={t('stats_depenses_mois')} 
          value={`${depensesMois.toLocaleString()} CFA`} 
          icon={TrendingDown} 
          trend={{ value: 5, isUp: false }} 
        />
        <StatCard 
          title={t('stats_low_stock')} 
          value={stockCritiqueCount} 
          icon={AlertCircle} 
          className={cn(stockCritiqueCount > 0 ? "border-orange-100 bg-orange-50/10 text-orange-600" : "")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Distribution par Niveau */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800">{t('distribution_level')}</h3>
            <select className="text-xs border-gray-200 rounded-md bg-gray-50 p-1 outline-none">
              <option>Cette année</option>
              <option>Mois dernier</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicDistribution} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {dynamicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Chart - Répartition Hafiz */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-8">{t('hafiz_distribution')}</h3>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dynamicDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {dynamicDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-black">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">{t('recent_activities')}</h3>
            <button 
              onClick={() => handleNavigate('finances')}
              className="text-sm text-green-600 font-medium hover:underline"
            >
              {t('see_all')}
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className={cn("p-2 rounded-full", activity.color)}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Evolution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800">{t('finance_evolution')}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">{t('entries')}</span>
              </div>
               <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-gray-500">{t('exits')}</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionFinances}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="entries" stroke="#10b981" fillOpacity={1} fill="url(#colorEntries)" strokeWidth={2} />
                <Area type="monotone" dataKey="exits" stroke="#f87171" fillOpacity={0} strokeWidth={2} dashArray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
