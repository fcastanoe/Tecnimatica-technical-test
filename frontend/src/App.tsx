import { useState } from 'react';
import { ZonesPage } from './pages/ZonesPage';
import { AssignPage } from './pages/AssignPage';
import './index.css';

type Tab = 'zones' | 'assign';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('zones');
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAssignSuccess = () => {
    setRefreshKey(k => k + 1);
    setActiveTab('zones');
  };

  return (
    <div className="app-container">
      {/* TopNavBar */}
      <nav className="top-navbar">
        <div className="top-navbar__container">
          <div className="top-navbar__left">
            <div className="top-navbar__brand" onClick={() => { setActiveTab('zones'); setMobileMenuOpen(false); }}>
              <img src="/ICONO.png" alt="Icono" className="top-navbar__logo" />
              <span>IND-MONITOR</span>
            </div>
          </div>

          <div className="top-navbar__right">
            <button className="top-navbar__icon-btn" title="Notificaciones (Simulado)">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="top-navbar__icon-btn" title="Configuración (Simulado)">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="top-navbar__profile">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxYFWm1QILfFAPwfGtX5SEj5icRO2pB2fj-3bEzyQNDMK8xPOjDO4fR9MAoa8qlKMw1WVzFFC7KjZU1rapsAz9F-xePo1xI29PFTYb-BHSyMajVjC7vXcM-_TVfewoM6N6eRco2HjKrjn7xJxC9yrz1IG5EqkECGpCx_Bq6qc7PDftsv1Bcf8NRJyTxysQQoHKu9F7krc-DEiP_kIw3rfIfO0es1Qt7IMBoy4G88iNJmXcEtPBBdzS8BOZxLXr9T3ucKYIPX36IGY" 
                alt="Operador" 
                className="top-navbar__avatar" 
              />
            </div>
            {/* Mobile Hamburger */}
            <button className="top-navbar__hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button
            className={`mobile-menu__link ${activeTab === 'zones' ? 'mobile-menu__link--active' : ''}`}
            onClick={() => { setActiveTab('zones'); setMobileMenuOpen(false); }}
          >
            <span className="material-symbols-outlined">settings_input_component</span>
            Control de Zonas
          </button>
          <button
            className={`mobile-menu__link ${activeTab === 'assign' ? 'mobile-menu__link--active' : ''}`}
            onClick={() => { setActiveTab('assign'); setMobileMenuOpen(false); }}
          >
            <span className="material-symbols-outlined">sensors</span>
            Asignar Sensor
          </button>
          <div className="mobile-menu__divider"></div>
          <span className="mobile-menu__category">Sistemas (Próximamente)</span>
          <div className="mobile-menu__mock-item">
            <span className="material-symbols-outlined">live_tv</span>
            Live Feed <span className="badge-soon">Soon</span>
          </div>
          <div className="mobile-menu__mock-item">
            <span className="material-symbols-outlined">list_alt</span>
            Historial <span className="badge-soon">Soon</span>
          </div>
        </div>
      )}

      {/* SideNavBar */}
      <aside className="sidenavbar">
        <div className="sidenavbar__container">
          <div className="sidenavbar__header">
            <div className="sidenavbar__icon-wrapper">
              <span className="material-symbols-outlined text-primary">dns</span>
            </div>
            <div>
              <h2 className="sidenavbar__title">Control Center</h2>
              <p className="sidenavbar__subtitle">Terminal 04 - Sector B</p>
            </div>
          </div>

          <nav className="sidenavbar__nav">
            <button
              className={`sidenavbar__link ${activeTab === 'zones' ? 'sidenavbar__link--active' : ''}`}
              onClick={() => setActiveTab('zones')}
            >
              <span className="material-symbols-outlined">settings_input_component</span>
              <span>Control de Zonas</span>
            </button>

            <button
              className={`sidenavbar__link ${activeTab === 'assign' ? 'sidenavbar__link--active' : ''}`}
              onClick={() => setActiveTab('assign')}
            >
              <span className="material-symbols-outlined">sensors</span>
              <span>Asignar Sensor</span>
            </button>

            <div className="sidenavbar__divider"></div>
            <span className="sidenavbar__section-title">Telemetría y Procesos</span>

            <div className="sidenavbar__link sidenavbar__link--disabled" title="Próximamente">
              <span className="material-symbols-outlined">live_tv</span>
              <span>Live Feed</span>
              <span className="badge-soon">Soon</span>
            </div>

            <div className="sidenavbar__link sidenavbar__link--disabled" title="Próximamente">
              <span className="material-symbols-outlined">list_alt</span>
              <span>Historial</span>
              <span className="badge-soon">Soon</span>
            </div>

            <div className="sidenavbar__link sidenavbar__link--disabled" title="Próximamente">
              <span className="material-symbols-outlined">build</span>
              <span>Mantenimiento</span>
              <span className="badge-soon">Soon</span>
            </div>

            <div className="sidenavbar__link sidenavbar__link--disabled" title="Próximamente">
              <span className="material-symbols-outlined">health_and_safety</span>
              <span>Estado del Sistema</span>
              <span className="badge-soon">Soon</span>
            </div>
          </nav>

          <div className="sidenavbar__footer">
            <button 
              className="sidenavbar__emergency-btn" 
              onClick={() => alert('Parada de Emergencia: Funcionalidad simulada para entorno de pruebas.')}
            >
              <span className="material-symbols-outlined">warning</span>
              Parada de Emergencia
            </button>
            <div className="sidenavbar__footer-links">
              <a href="#" className="sidenavbar__footer-link" onClick={(e) => { e.preventDefault(); alert('Ayuda del Sistema'); }}>
                <span className="material-symbols-outlined">help</span>
                Ayuda
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="main-content__inner">
          {activeTab === 'zones' && <ZonesPage key={refreshKey} />}
          {activeTab === 'assign' && <AssignPage onSuccess={handleAssignSuccess} />}
        </div>
      </main>
    </div>
  );
}
