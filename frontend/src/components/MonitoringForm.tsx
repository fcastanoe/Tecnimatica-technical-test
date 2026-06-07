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
  const [zoneWarning, setZoneWarning] = useState('');

  const [thresholdInput, setThresholdInput] = useState('');
  const [currentInput, setCurrentInput] = useState('');

  const [form, setForm] = useState<Omit<CreateMonitoringPayload, 'threshold_value' | 'current_value'> & { threshold_value: number; current_value: number }>({
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
    
    if (name === 'sensor_id') {
      const sensorId = parseInt(value);
      const sensor = sensors.find(s => s.id === sensorId);
      const readingType = sensor ? sensor.type : 'temperature';
      
      setForm(prev => ({
        ...prev,
        sensor_id: sensorId,
        reading_type: readingType,
      }));
    } else if (name === 'zone_id') {
      const zoneId = parseInt(value);
      const zone = zones.find(z => z.id === zoneId);
      
      if (zone && zone.operational_status === 'non-operational') {
        setZoneWarning('⚠️ Esta zona no está operativa. El monitoreo se creará pausado automáticamente.');
        setForm(prev => ({
          ...prev,
          zone_id: zoneId,
          status: 'paused'
        }));
      } else {
        setZoneWarning('');
        setForm(prev => ({
          ...prev,
          zone_id: zoneId
        }));
      }
    } else {
      setForm(prev => ({
        ...prev,
        [name]: name === 'threshold_value' || name === 'current_value' ? parseFloat(value) : value,
      }));
    }
  };

  const handleReset = () => {
    setForm({
      sensor_id: 0,
      zone_id: 0,
      installation_date: new Date().toISOString().split('T')[0],
      reading_type: 'temperature',
      threshold_value: 0,
      current_value: 0,
      status: 'active',
    });
    setThresholdInput('');
    setCurrentInput('');
    setZoneWarning('');
    setSubmitError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess(false);

    if (!form.sensor_id || !form.zone_id) {
      setSubmitError('Debes seleccionar un sensor y una zona.');
      return;
    }

    const parsedThreshold = parseFloat(thresholdInput);
    const parsedCurrent = parseFloat(currentInput || '0');

    if (isNaN(parsedThreshold) || parsedThreshold <= 0) {
      setSubmitError('El valor umbral debe ser mayor que 0.');
      return;
    }

    setLoading(true);
    try {
      await createMonitoring({ ...form, threshold_value: parsedThreshold, current_value: parsedCurrent });
      onSuccess();
      handleReset();
      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to create monitoring assignment. Please check the form data.');
    } finally {
      setLoading(false);
    }
  };

  const selectedZoneObj = zones.find(z => z.id === form.zone_id);
  const isZoneNonOperational = selectedZoneObj?.operational_status === 'non-operational';

  return (
    <form className="monitoring-form" onSubmit={handleSubmit}>
      <h2 className="monitoring-form__title">Asignar Nuevo Sensor</h2>
      <p className="monitoring-form__subtitle">Configure un nuevo punto de monitoreo y establezca sus parámetros operativos.</p>

      {fetchError && (
        <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined">error</span>
          <span>{fetchError}</span>
        </div>
      )}
      
      {submitError && (
        <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined">error</span>
          <span>{submitError}</span>
        </div>
      )}
      
      {zoneWarning && (
        <div className="alert alert--warning" style={{ marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined">warning</span>
          <span>{zoneWarning}</span>
        </div>
      )}
      
      {success && (
        <div className="alert alert--success" style={{ marginBottom: '1.5rem' }}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>✓ Monitoreo creado exitosamente</span>
        </div>
      )}

      <div className="form-grid">
        {/* Section 1: Identificación */}
        <h3 className="form-section-title">1. Identificación del Dispositivo</h3>

        <div className="form-field">
          <span>
            <span className="material-symbols-outlined">memory</span>
            Selector de Sensor
          </span>
          <select name="sensor_id" value={form.sensor_id} onChange={handleChange} required>
            <option value={0}>-- Seleccionar sensor --</option>
            {sensors.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <span>
            <span className="material-symbols-outlined">map</span>
            Selector de Zona
          </span>
          <select name="zone_id" value={form.zone_id} onChange={handleChange} required>
            <option value={0}>-- Seleccionar zona --</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name} ({z.operational_status === 'operational' ? 'Operativa' : 'No operativa'})</option>
            ))}
          </select>
        </div>

        {/* Section 2: Configuración */}
        <h3 className="form-section-title">2. Parámetros de Monitoreo</h3>

        <div className="form-field">
          <span>
            <span className="material-symbols-outlined">analytics</span>
            Tipo de lectura
          </span>
          <select 
            name="reading_type" 
            value={form.reading_type} 
            onChange={handleChange} 
            disabled={form.sensor_id > 0} 
            required
          >
            {READING_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {form.sensor_id > 0 && <span className="field-hint">Bloqueado según el tipo del sensor</span>}
        </div>

        <div className="form-field">
          <span>
            <span className="material-symbols-outlined">calendar_today</span>
            Fecha de instalación
          </span>
          <input type="date" name="installation_date" value={form.installation_date} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <span>
            <span className="material-symbols-outlined">warning</span>
            Valor umbral (Crítico)
          </span>
          <input
            type="number"
            value={thresholdInput}
            onChange={e => setThresholdInput(e.target.value)}
            step="0.01"
            min="0.01"
            placeholder="Ej: 80.00"
            required
          />
        </div>

        <div className="form-field">
          <span>
            <span className="material-symbols-outlined">track_changes</span>
            Valor actual (Calibración)
          </span>
          <input
            type="number"
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            step="0.01"
            placeholder="Ej: 75.00"
            required
          />
        </div>

        <div className="form-field" style={{ gridColumn: '1 / -1' }}>
          <span>
            <span className="material-symbols-outlined">toggle_off</span>
            Estado Inicial del Monitoreo
          </span>
          <select 
            name="status" 
            value={form.status} 
            onChange={handleChange} 
            disabled={isZoneNonOperational} 
            required
          >
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
          </select>
          {isZoneNonOperational && <span className="field-hint">Solo se admite "Pausado" en zonas inactivas</span>}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button className="btn btn--secondary" type="button" onClick={handleReset}>
            Limpiar Campos
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            <span className="material-symbols-outlined">add_task</span>
            {loading ? 'Creando...' : 'Crear monitoreo'}
          </button>
        </div>
      </div>
    </form>
  );
}
