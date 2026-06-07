import type { Zone } from '../types';

interface ZoneCardProps {
  zone: Zone;
  activeSensorsCount: number;
  onClick: () => void;
}

export function ZoneCard({ zone, activeSensorsCount, onClick }: ZoneCardProps) {
  return (
    <div className="zone-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="zone-card__header">
        <h3 className="zone-card__name">{zone.name}</h3>
        <span className={`zone-card__status zone-card__status--${zone.operational_status}`}>
          {zone.operational_status === 'operational' ? 'Operacional' : 'No operacional'}
        </span>
      </div>
      <p className="zone-card__location">📍 {zone.location}</p>
      <p className="zone-card__sensors">
        <strong>{activeSensorsCount}</strong> sensor{activeSensorsCount !== 1 ? 'es' : ''} activo{activeSensorsCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
