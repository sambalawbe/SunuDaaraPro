/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Health } from './pages/Health';
import { Inventory } from './pages/Inventory';
import { Communications } from './pages/Communications';
import { Finances } from './pages/Finances';
import { AdminSettings } from './pages/AdminSettings';
import { Login } from './pages/Login';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="p-4 md:p-8 h-full">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'eleves' && <Students />}
        {activeTab === 'enseignants' && <Teachers />}
        {activeTab === 'finances' && <Finances />}
        {activeTab === 'parametres' && <AdminSettings />}
        {activeTab === 'sante' && <Health />}
        {activeTab === 'logistique' && <Inventory />}
        {activeTab === 'communications' && <Communications />}
        {activeTab !== 'dashboard' && activeTab !== 'eleves' && activeTab !== 'enseignants' && activeTab !== 'finances' && activeTab !== 'parametres' && activeTab !== 'sante' && activeTab !== 'logistique' && activeTab !== 'communications' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             <h2 className="text-xl font-bold">Module en cours de développement</h2>
             <p>Le module {activeTab} sera bientôt disponible.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

