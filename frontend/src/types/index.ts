export interface Sensor {
  id: number;
  name: string;
  type: 'temperature' | 'pressure' | 'vibration' | 'flow';
  manufacturer: string;
  manufacture_date: string;
  created_at: string;
}

export interface Zone {
  id: number;
  name: string;
  description?: string;
  location: string;
  operational_status: 'operational' | 'non-operational';
  created_at: string;
}

export interface Monitoring {
  id: number;
  sensor_id: number;
  zone_id: number;
  installation_date: string;
  reading_type: 'temperature' | 'pressure' | 'vibration' | 'flow';
  threshold_value: string;
  current_value: string;
  status: 'active' | 'paused';
  created_at: string;
  sensor_name?: string;
  zone_name?: string;
}

export interface ZoneSensor {
  id: number;
  name: string;
  type: string;
  manufacturer: string;
  manufacture_date: string;
  reading_type: string;
  threshold_value: string;
  current_value: string;
  status: 'active' | 'paused';
  monitoring_id: number;
}

export interface CreateMonitoringPayload {
  sensor_id: number;
  zone_id: number;
  installation_date: string;
  reading_type: string;
  threshold_value: number;
  current_value: number;
  status: 'active' | 'paused';
}

export interface UpdateMonitoringPayload {
  threshold_value?: number;
  status?: 'active' | 'paused';
  current_value?: number;
}
