import { useState } from 'react';
import { ZonesPage } from './pages/ZonesPage';
import { AssignPage } from './pages/AssignPage';
import './index.css';

type Tab = 'zones' | 'assign';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('zones');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAssignSuccess = () => {
    setRefreshKey(k => k + 1);
    setActiveTab('zones');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-header__title">🏭 Sistema de Monitoreo Industrial</h1>
        <nav className="app-nav">
          <button
            className={`app-nav__btn ${activeTab === 'zones' ? 'app-nav__btn--active' : ''}`}
            onClick={() => setActiveTab('zones')}
          >
            Zonas
          </button>
          <button
            className={`app-nav__btn ${activeTab === 'assign' ? 'app-nav__btn--active' : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            Asignar Sensor
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'zones' && <ZonesPage key={refreshKey} />}
        {activeTab === 'assign' && <AssignPage onSuccess={handleAssignSuccess} />}
      </main>
    </div>
  );
}
