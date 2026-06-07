import { useState } from 'react';
import type { Zone, ZoneSensor } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ThresholdIndicator } from '../components/ThresholdIndicator';
import { updateMonitoring, updateZone } from '../services/api';

interface ZoneDetailPageProps {
  zone: Zone;
  sensors: ZoneSensor[];
  onBack: () => void;
  onUpdate: () => void;
  onZoneUpdate: (updatedZone: Zone) => void;
}

const getUnitForReadingType = (type: string) => {
  switch (type) {
    case 'temperature': return '°C';
    case 'pressure': return 'bar';
    case 'vibration': return 'mm/s';
    case 'flow': return 'L/min';
    default: return '';
  }
};

export function ZoneDetailPage({ zone, sensors, onBack, onUpdate, onZoneUpdate }: ZoneDetailPageProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState<string>('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loadingZone, setLoadingZone] = useState(false);
  const [error, setError] = useState<string>('');

  const startEdit = (monitoringId: number, currentThreshold: string) => {
    setError('');
    setEditingId(monitoringId);
    setEditVal(parseFloat(currentThreshold).toString());
  };

  const handleSaveThreshold = async (monitoringId: number) => {
    setError('');
    const parsedVal = parseFloat(editVal);
    if (isNaN(parsedVal) || parsedVal <= 0) {
      setError('El valor umbral debe ser mayor que 0.');
      return;
    }

    setLoadingId(monitoringId);
    try {
      await updateMonitoring(monitoringId, { threshold_value: parsedVal });
      setEditingId(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el umbral.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleStatus = async (monitoringId: number, currentStatus: 'active' | 'paused') => {
    setError('');
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    setLoadingId(monitoringId);
    try {
      await updateMonitoring(monitoringId, { status: newStatus });
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado del monitoreo.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleZoneStatus = async () => {
    setError('');
    const newStatus = zone.operational_status === 'operational' ? 'non-operational' : 'operational';

    setLoadingZone(true);
    try {
      const updatedZone = await updateZone(zone.id, newStatus);
      onZoneUpdate(updatedZone);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado de la zona.');
    } finally {
      setLoadingZone(false);
    }
  };

  return (
    <div className="zone-detail">
      {/* Minimalist Back Button */}
      <button className="btn--back" onClick={onBack}>
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Volver al Control General</span>
      </button>

      {/* Header Panel */}
      <div className="zone-detail__header-panel">
        <div className="zone-detail__title-section">
          <div className="zone-detail__title-wrapper">
            <span className="material-symbols-outlined zone-detail__title-icon">
              {zone.name.toLowerCase().includes('caldera') ? 'local_fire_department' : 'settings_input_component'}
            </span>
            <h2 className="zone-detail__title">{zone.name}</h2>
          </div>
          {zone.description && <p className="zone-detail__description">{zone.description}</p>}
        </div>

        <div className="zone-detail__actions">
          <div className="zone-detail__badge-location">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
            <span>{zone.location}</span>
          </div>
          <button
            onClick={handleToggleZoneStatus}
            disabled={loadingZone}
            className={`btn ${zone.operational_status === 'operational' ? 'btn--warning' : 'btn--success'}`}
          >
            {loadingZone ? '...' : zone.operational_status === 'operational' ? 'Desactivar zona' : 'Activar zona'}
          </button>
        </div>
      </div>

      {/* Non-operational warning banner */}
      {zone.operational_status !== 'operational' && (
        <div className="alert alert--warning zone-detail__alert">
          <span className="material-symbols-outlined">warning</span>
          <span>Esta zona no se encuentra operativa actualmente. El monitoreo de sensores está restringido.</span>
        </div>
      )}

      {error && (
        <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Data Table Section */}
      {sensors.length === 0 ? (
        <p className="state-message">No hay sensores registrados en esta zona.</p>
      ) : (
        <div className="sensors-table-wrapper">
          <div className="sensors-table-header">
            <h3>Sensores Asignados</h3>
            <span className="sensors-table-header__badge">
              {sensors.length} {sensors.length === 1 ? 'Sensor' : 'Sensores'}
            </span>
          </div>
          
          <table className="sensors-table">
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Tipo</th>
                <th className="text-right">Valor actual</th>
                <th className="text-right">Umbral</th>
                <th>Estado</th>
                <th>Alerta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map(s => {
                const isEditing = editingId === s.monitoring_id;
                const isLoading = loadingId === s.monitoring_id;
                const isExceeded = parseFloat(s.current_value) > parseFloat(s.threshold_value);

                return (
                  <tr key={s.monitoring_id} className={isExceeded && s.status === 'active' ? 'row--warning' : ''}>
                    {/* Double-row cell for Sensor Name and Metadata */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="sensor-cell-name">{s.name}</span>
                        <span className="sensor-cell-sn">{s.manufacturer} • SN-{s.monitoring_id}20-T</span>
                      </div>
                    </td>
                    
                    <td className="text-capitalize">{s.reading_type}</td>
                    
                    {/* Value cell highlighted in red if threshold is exceeded */}
                    <td className={`text-right font-mono ${isExceeded && s.status === 'active' ? 'text-error' : 'text-primary'}`} style={{ fontWeight: '600' }}>
                      {parseFloat(s.current_value).toFixed(2)} <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.85em' }}>{getUnitForReadingType(s.reading_type)}</span>
                    </td>
                    
                    <td className="text-right font-mono">
                      {isEditing ? (
                        <div className="edit-threshold-cell">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            disabled={isLoading}
                            className="input-edit"
                          />
                        </div>
                      ) : (
                        <span>
                          {parseFloat(s.threshold_value).toFixed(2)} <span style={{ color: 'var(--outline)', fontSize: '0.85em' }}>{getUnitForReadingType(s.reading_type)}</span>
                        </span>
                      )}
                    </td>
                    
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    
                    <td>
                      {s.status === 'active' ? (
                        <ThresholdIndicator
                          currentValue={parseFloat(s.current_value)}
                          thresholdValue={parseFloat(s.threshold_value)}
                        />
                      ) : (
                        <span className="threshold-indicator threshold-indicator--normal" style={{ opacity: 0.5 }}>—</span>
                      )}
                    </td>
                    
                    <td>
                      <div className="action-buttons">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveThreshold(s.monitoring_id)}
                              disabled={isLoading}
                              className="btn btn--small btn--primary"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={isLoading}
                              className="btn btn--small btn--cancel"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(s.monitoring_id, s.threshold_value)}
                              disabled={isLoading}
                              className="btn btn--small btn--secondary"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleToggleStatus(s.monitoring_id, s.status)}
                              disabled={isLoading}
                              className={`btn btn--small ${s.status === 'active' ? 'btn--warning' : 'btn--success'}`}
                            >
                              {s.status === 'active' ? 'Pausar' : 'Activar'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
