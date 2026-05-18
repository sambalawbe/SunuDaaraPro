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
import { AppProvider } from './context/AppContext';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  return (
    <AppProvider>
      <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'eleves' && <Students />}
        {activeTab === 'enseignants' && <Teachers />}
        {activeTab === 'finances' && <Finances />}
        {activeTab === 'sante' && <Health />}
        {activeTab === 'logistique' && <Inventory />}
        {activeTab === 'communications' && <Communications />}
        {activeTab !== 'dashboard' && activeTab !== 'eleves' && activeTab !== 'enseignants' && activeTab !== 'finances' && activeTab !== 'sante' && activeTab !== 'logistique' && activeTab !== 'communications' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             <h2 className="text-xl font-bold">Module en cours de développement</h2>
             <p>Le module {activeTab} sera bientôt disponible.</p>
          </div>
        )}
      </Shell>
    </AppProvider>
  );
}

