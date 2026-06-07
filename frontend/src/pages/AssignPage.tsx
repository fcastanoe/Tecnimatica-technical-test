import { MonitoringForm } from '../components/MonitoringForm';

interface AssignPageProps {
  onSuccess: () => void;
}

export function AssignPage({ onSuccess }: AssignPageProps) {
  return (
    <div className="page">
      <MonitoringForm onSuccess={onSuccess} />
    </div>
  );
}
