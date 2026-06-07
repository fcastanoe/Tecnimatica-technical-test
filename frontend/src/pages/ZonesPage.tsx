import { useState, useEffect } from 'react';
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
      {selectedZone ? (
        <ZoneDetailPage
          zone={selectedZone}
          sensors={sensorsMap[selectedZone.id] ?? []}
          onBack={() => setSelectedZone(null)}
          onUpdate={() => loadZones(true)}
          onZoneUpdate={handleZoneUpdate}
        />
      ) : (
        <>
          <h2 className="page__title">Zonas de Monitoreo</h2>
          <div className="zones-grid">
            {zones.map(zone => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                activeSensorsCount={(sensorsMap[zone.id] ?? []).length}
                onClick={() => setSelectedZone(zone)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

