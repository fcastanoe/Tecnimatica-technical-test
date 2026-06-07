import { motion } from 'framer-motion';
import type { Zone } from '../types';

interface ZoneCardProps {
  zone: Zone;
  activeSensorsCount: number;
  onClick: () => void;
  index?: number;
}

export function ZoneCard({ zone, activeSensorsCount, onClick, index = 0 }: ZoneCardProps) {
  return (
    <motion.div
      className="zone-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ scale: 1.025, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.97 }}
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
    </motion.div>
  );
}
