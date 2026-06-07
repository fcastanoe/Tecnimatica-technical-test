import { AnimatePresence, motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'active' | 'paused';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        className={`status-badge status-badge--${status}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {status === 'active' ? '● Activo' : '⏸ Pausado'}
      </motion.span>
    </AnimatePresence>
  );
}

