import { useState, useEffect } from 'react';
import type { Sensor, Zone, CreateMonitoringPayload } from '../types';
import { getSensors, getZones, createMonitoring } from '../services/api';

interface MonitoringFormProps {
  onSuccess: () => void;
}

const READING_TYPES = ['temperature', 'pressure', 'vibration', 'flow'] as const;

export function MonitoringForm({ onSuccess }: MonitoringFormProps) {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CreateMonitoringPayload>({
    sensor_id: 0,
    zone_id: 0,
    installation_date: new Date().toISOString().split('T')[0],
    reading_type: 'temperature',
    threshold_value: 0,
    current_value: 0,
    status: 'active',
  });

  useEffect(() => {
    Promise.all([getSensors(), getZones()])
      .then(([s, z]) => { setSensors(s); setZones(z); })
      .catch(() => setFetchError('Unable to load sensors or zones. Please verify that the backend is running.'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'sensor_id' || name === 'zone_id' ? parseInt(value) :
               name === 'threshold_value' || name === 'current_value' ? parseFloat(value) :
               value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess(false);

    if (!form.sensor_id || !form.zone_id) {
      setSubmitError('Debes seleccionar un sensor y una zona.');
      return;
    }
    if (form.threshold_value <= 0) {
      setSubmitError('The threshold value must be greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await createMonitoring(form);
      setSuccess(true);
      onSuccess();
      setForm(prev => ({ ...prev, threshold_value: 0, current_value: 0 }));
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to create monitoring assignment. Please check the form data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="monitoring-form" onSubmit={handleSubmit}>
      <h2 className="monitoring-form__title">Asignar Sensor a Zona</h2>

      {fetchError && <p className="alert alert--error">{fetchError}</p>}
      {submitError && <p className="alert alert--error">{submitError}</p>}
      {success && <p className="alert alert--success">✓ Monitoreo creado exitosamente</p>}

      <div className="form-grid">
        <label className="form-field">
          <span>Sensor</span>
          <select name="sensor_id" value={form.sensor_id} onChange={handleChange} required>
            <option value={0}>-- Seleccionar sensor --</option>
            {sensors.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Zona</span>
          <select name="zone_id" value={form.zone_id} onChange={handleChange} required>
            <option value={0}>-- Seleccionar zona --</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Tipo de lectura</span>
          <select name="reading_type" value={form.reading_type} onChange={handleChange} required>
            {READING_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Fecha de instalación</span>
          <input type="date" name="installation_date" value={form.installation_date} onChange={handleChange} required />
        </label>

        <label className="form-field">
          <span>Valor umbral</span>
          <input type="number" name="threshold_value" value={form.threshold_value} onChange={handleChange} step="0.01" min="0.01" required />
        </label>

        <label className="form-field">
          <span>Valor actual</span>
          <input type="number" name="current_value" value={form.current_value} onChange={handleChange} step="0.01" required />
        </label>

        <label className="form-field">
          <span>Estado</span>
          <select name="status" value={form.status} onChange={handleChange} required>
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
          </select>
        </label>
      </div>

      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? 'Creando...' : 'Crear monitoreo'}
      </button>
    </form>
  );
}
