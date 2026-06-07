import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Zone, ZoneSensor } from '../types';
import { getZones, getZoneSensors } from '../services/api';
import { ZoneCard } from '../components/ZoneCard';
import { ZoneDetailPage } from './ZoneDetailPage';

export function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [sensorsMap, setSensorsMap] = useState<Record<number, ZoneSensor[]>>({});
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const zonesData = await getZones();
      setZones(zonesData);
      // Load sensors for all zones in parallel
      const results = await Promise.all(
        zonesData.map(z => getZoneSensors(z.id).catch(() => []))
      );
      const map: Record<number, ZoneSensor[]> = {};
      zonesData.forEach((z, i) => { map[z.id] = results[i]; });
      setSensorsMap(map);
    } catch {
      setError('Unable to load sensors. Please verify that the backend is running.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Updates selectedZone state immediately when its status changes
  const handleZoneUpdate = (updatedZone: Zone) => {
    setSelectedZone(updatedZone);
    setZones(prev => prev.map(z => z.id === updatedZone.id ? updatedZone : z));
  };

  if (loading) return <div className="state-message">Cargando zonas...</div>;
  if (error) return <div className="state-message state-message--error">{error}</div>;

  return (
    <div className="page">
      <AnimatePresence mode="wait">
        {selectedZone ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ZoneDetailPage
              zone={selectedZone}
              sensors={sensorsMap[selectedZone.id] ?? []}
              onBack={() => setSelectedZone(null)}
              onUpdate={() => loadZones(true)}
              onZoneUpdate={handleZoneUpdate}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="page__title-wrapper">
              <h2 className="page__title">Monitoreo de Zonas</h2>
              <p className="page__subtitle">Vista general operativa de sistemas críticos y telemetría de planta.</p>
            </div>
            <div className="zones-grid">
              {zones.map((zone, i) => {
                const zoneSensors = sensorsMap[zone.id] ?? [];
                const activeCount = zoneSensors.filter(s => s.status === 'active').length;
                const pausedCount = zoneSensors.filter(s => s.status === 'paused').length;
                
                return (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    index={i}
                    activeCount={activeCount}
                    pausedCount={pausedCount}
                    onClick={() => setSelectedZone(zone)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
