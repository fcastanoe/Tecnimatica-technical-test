import type { Zone, ZoneSensor } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ThresholdIndicator } from '../components/ThresholdIndicator';

interface ZoneDetailPageProps {
  zone: Zone;
  sensors: ZoneSensor[];
  onBack: () => void;
}

export function ZoneDetailPage({ zone, sensors, onBack }: ZoneDetailPageProps) {
  return (
    <div className="zone-detail">
      <button className="btn btn--back" onClick={onBack}>← Volver</button>
      
      <div className="zone-detail__header">
        <h2>{zone.name}</h2>
        <span className={`zone-card__status zone-card__status--${zone.operational_status}`}>
          {zone.operational_status === 'operational' ? 'Operacional' : 'No operacional'}
        </span>
      </div>
      
      {zone.description && <p className="zone-detail__description">{zone.description}</p>}
      <p className="zone-detail__location">📍 {zone.location}</p>

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
              </tr>
            </thead>
            <tbody>
              {sensors.map(s => (
                <tr key={s.monitoring_id} className={parseFloat(s.current_value) > parseFloat(s.threshold_value) ? 'row--warning' : ''}>
                  <td>{s.name}</td>
                  <td>{s.reading_type}</td>
                  <td>{s.current_value}</td>
                  <td>{s.threshold_value}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td><ThresholdIndicator currentValue={parseFloat(s.current_value)} thresholdValue={parseFloat(s.threshold_value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
