import type {
  Sensor,
  Zone,
  Monitoring,
  ZoneSensor,
  CreateMonitoringPayload,
  UpdateMonitoringPayload,
} from '../types';

const BASE_URL = 'http://localhost:3000';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const getSensors = (): Promise<Sensor[]> =>
  fetchJSON('/sensors');

export const getZones = (): Promise<Zone[]> =>
  fetchJSON('/zones');

export const getMonitorings = (status?: 'active' | 'paused'): Promise<Monitoring[]> =>
  fetchJSON(`/monitorings${status ? `?status=${status}` : ''}`);

export const getZoneSensors = (zoneId: number): Promise<ZoneSensor[]> =>
  fetchJSON(`/zones/${zoneId}/sensors`);

export const getSensorZones = (sensorId: number): Promise<Zone[]> =>
  fetchJSON(`/sensors/${sensorId}/zones`);

export const createMonitoring = (payload: CreateMonitoringPayload): Promise<Monitoring> =>
  fetchJSON('/monitorings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const updateMonitoring = (id: number, payload: UpdateMonitoringPayload): Promise<Monitoring> =>
  fetchJSON(`/monitorings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const updateZone = (id: number, operational_status: 'operational' | 'non-operational'): Promise<Zone> =>
  fetchJSON(`/zones/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operational_status }),
  });

