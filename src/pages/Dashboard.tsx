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
  Package
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

// Données fictives pour la démo
const distributionNiveau = [
  { name: 'Niveau I (Débutants)', value: 120 },
  { name: 'Niveau II (Moyen)', value: 85 },
  { name: 'Niveau III (Avancé)', value: 45 },
  { name: 'Hafiz', value: 15 },
];

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

const StatCard = ({ title, value, icon: Icon, trend, className }: StatCardProps) => (
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
        <span className="text-xs text-gray-400 ml-1">vs mois dernier</span>
      </div>
    )}
  </motion.div>
);

export function Dashboard() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bienvenue, Admin Daara</h1>
          <p className="text-gray-500">Aperçu global de votre établissement coranique.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Exporter PDF
          </button>
          <button className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors">
            Ajouter un élève
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Élèves Actifs" 
          value="265" 
          icon={Users} 
          trend={{ value: 12, isUp: true }} 
        />
        <StatCard 
          title="Mémorisateurs (Hafiz)" 
          value="15" 
          icon={GraduationCap} 
          trend={{ value: 2, isUp: true }} 
        />
        <StatCard 
          title="Recettes (CFA)" 
          value="1,245,000" 
          icon={TrendingUp} 
          trend={{ value: 5, isUp: true }} 
        />
        <StatCard 
          title="Stock Critique" 
          value="4" 
          icon={AlertCircle} 
          className="border-red-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Distribution par Niveau */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800">Distribution par Niveau</h3>
            <select className="text-xs border-gray-200 rounded-md bg-gray-50 p-1 outline-none">
              <option>Cette année</option>
              <option>Mois dernier</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionNiveau} barSize={40}>
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
                  {distributionNiveau.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Chart - Répartition Hafiz */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-8">Répartition Hafiz / Niveau</h3>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionNiveau}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionNiveau.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {distributionNiveau.map((item, index) => (
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
            <h3 className="font-bold text-gray-800">Activités Récentes</h3>
            <button className="text-sm text-green-600 font-medium hover:underline">Voir tout</button>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { id: 1, type: 'payment', user: 'Pape Diouf', action: 'à payé sa scolarité de Juin', time: 'il y a 2h', icon: Wallet, color: 'bg-green-50 text-green-600' },
              { id: 2, type: 'behavior', user: 'Ibrahima Fall', action: 'a reçu un bonus (+10 pts) - Tarbyya', time: 'il y a 4h', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
              { id: 3, type: 'medical', user: 'Modou Lo', action: 'Consultation à l\'infirmerie (Fièvre)', time: 'il y a 5h', icon: Stethoscope, color: 'bg-orange-50 text-orange-600' },
              { id: 4, type: 'inventory', user: 'Stock', action: 'Alerte: Mouchafs en rupture', time: 'il y a 1j', icon: Package, color: 'bg-red-50 text-red-600' },
            ].map((activity) => (
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
            <h3 className="font-bold text-gray-800">Évolution de la Caisse</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">Entrées</span>
              </div>
               <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-gray-500">Sorties</span>
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
