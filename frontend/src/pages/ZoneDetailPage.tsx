import { useState } from 'react';
import type { Zone, ZoneSensor } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ThresholdIndicator } from '../components/ThresholdIndicator';
import { updateMonitoring } from '../services/api';

interface ZoneDetailPageProps {
  zone: Zone;
  sensors: ZoneSensor[];
  onBack: () => void;
  onUpdate: () => void;
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

export function ZoneDetailPage({ zone, sensors, onBack, onUpdate }: ZoneDetailPageProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState<string>('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
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

  return (
    <div className="zone-detail">
      <button className="btn btn--back" onClick={onBack}>← Volver</button>
      
      <div className="zone-detail__header">
        <h2>{zone.name}</h2>
        <span className={`zone-card__status zone-card__status--${zone.operational_status}`}>
          {zone.operational_status === 'operational' ? 'Operacional' : 'No operacional'}
        </span>
      </div>

      {zone.operational_status !== 'operational' && (
        <div className="alert alert--warning zone-detail__alert">
          ⚠️ Esta zona no se encuentra operativa actualmente.
        </div>
      )}
      
      {zone.description && <p className="zone-detail__description">{zone.description}</p>}
      <p className="zone-detail__location">📍 {zone.location}</p>

      {error && <div className="alert alert--error">{error}</div>}

      <h3 className="zone-detail__sensors-title">Sensores asignados</h3>
      {sensors.length === 0 ? (
        <p className="state-message">No hay sensores activos en esta zona.</p>
      ) : (
        <div className="sensors-table-wrapper">
          <table className="sensors-table">
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Tipo de lectura</th>
                <th>Valor actual</th>
                <th>Umbral</th>
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
                    <td>{s.name}</td>
                    <td className="text-capitalize">{s.reading_type}</td>
                    <td className="text-right font-mono">
                      {parseFloat(s.current_value).toFixed(2)} {getUnitForReadingType(s.reading_type)}
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
                          {parseFloat(s.threshold_value).toFixed(2)} {getUnitForReadingType(s.reading_type)}
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
                        <span className="threshold-indicator threshold-indicator--normal">—</span>
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
