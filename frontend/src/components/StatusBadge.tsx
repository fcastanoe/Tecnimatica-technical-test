interface StatusBadgeProps {
  status: 'active' | 'paused';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {status === 'active' ? '● Activo' : '⏸ Pausado'}
    </span>
  );
}
