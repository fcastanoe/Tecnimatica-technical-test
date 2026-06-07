import { motion } from 'framer-motion';

interface ThresholdIndicatorProps {
  currentValue: number;
  thresholdValue: number;
}

export function ThresholdIndicator({ currentValue, thresholdValue }: ThresholdIndicatorProps) {
  const exceeded = currentValue > thresholdValue;

  return (
    <motion.span
      className={`threshold-indicator ${exceeded ? 'threshold-indicator--exceeded' : 'threshold-indicator--normal'}`}
      animate={exceeded ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={exceeded ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
    >
      {exceeded ? '⚠ Umbral superado' : '✓ Normal'}
    </motion.span>
  );
}

