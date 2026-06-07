export interface Sensor {
  id?: number;
  name: string;
  type: 'temperature' | 'pressure' | 'vibration' | 'flow';
  manufacturer: string;
  manufacture_date: string | Date;
  created_at?: string | Date;
}

export interface Zone {
  id?: number;
  name: string;
  description?: string;
  location: string;
  operational_status: 'operational' | 'non-operational';
  created_at?: string | Date;
}

export interface Monitoring {
  id?: number;
  sensor_id: number;
  zone_id: number;
  installation_date: string | Date;
  reading_type: 'temperature' | 'pressure' | 'vibration' | 'flow';
  threshold_value: number;
  current_value: number;
  status: 'active' | 'paused';
  created_at?: string | Date;
  sensor_name?: string;
  zone_name?: string;
}
