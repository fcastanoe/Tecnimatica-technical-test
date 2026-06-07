import type { Zone } from '../types';

interface ZoneCardProps {
  zone: Zone;
  activeSensorsCount: number;
  onClick: () => void;
}

export function ZoneCard({ zone, activeSensorsCount, onClick }: ZoneCardProps) {
  return (
    <div 
      className="zone-card" 
      onClick={onClick} 
      role="button" 
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <div className="zone-card__header">
        <div>
          <h3 className="zone-card__name">{zone.name}</h3>
          <p className="zone-card__location">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
            {zone.location}
          </p>
        </div>
      </div>
      
      <div className="zone-card__sensors">
        Sensores Asignados
        <strong>{activeSensorsCount}</strong>
      </div>

      <div className="zone-card__footer">
        <span className={`zone-card__status zone-card__status--${zone.operational_status}`}>
          {zone.operational_status === 'operational' ? 'Operativo' : 'Inactivo'}
        </span>
      </div>
    </div>
  );
}
