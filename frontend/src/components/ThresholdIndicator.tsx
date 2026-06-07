interface ThresholdIndicatorProps {
  currentValue: number;
  thresholdValue: number;
}

export function ThresholdIndicator({ currentValue, thresholdValue }: ThresholdIndicatorProps) {
  const exceeded = currentValue > thresholdValue;

  return (
    <span className={`threshold-indicator ${exceeded ? 'threshold-indicator--exceeded' : 'threshold-indicator--normal'}`}>
      {exceeded ? '⚠ Umbral superado' : '✓ Normal'}
    </span>
  );
}
