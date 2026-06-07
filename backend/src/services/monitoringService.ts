import pool from '../config/database';
import { Monitoring } from '../interfaces';

export const getAllMonitorings = async (status?: string): Promise<Monitoring[]> => {
  let query = `
    SELECT m.*, s.name as sensor_name, z.name as zone_name 
    FROM monitorings m
    JOIN sensors s ON s.id = m.sensor_id
    JOIN zones z ON z.id = m.zone_id
  `;
  const params: any[] = [];

  if (status) {
    query += ' WHERE m.status = $1';
    params.push(status);
  }

  query += ' ORDER BY m.id DESC;';

  const result = await pool.query(query, params);
  return result.rows;
};

export const getZonesBySensor = async (sensorId: number): Promise<any[]> => {
  const query = `
    SELECT z.id, z.name, z.description, z.location, z.operational_status,
           m.reading_type, m.threshold_value, m.current_value, m.status, m.id as monitoring_id
    FROM monitorings m
    JOIN zones z ON z.id = m.zone_id
    WHERE m.sensor_id = $1
    ORDER BY z.id;
  `;
  const result = await pool.query(query, [sensorId]);
  return result.rows;
};

export const getSensorsByZone = async (zoneId: number): Promise<any[]> => {
  const query = `
    SELECT s.id, s.name, s.type, s.manufacturer, s.manufacture_date,
           m.reading_type, m.threshold_value, m.current_value, m.status, m.id as monitoring_id
    FROM monitorings m
    JOIN sensors s ON s.id = m.sensor_id
    WHERE m.zone_id = $1
    ORDER BY s.id;
  `;
  const result = await pool.query(query, [zoneId]);
  return result.rows;
};


export const getMonitoringById = async (id: number): Promise<Monitoring | null> => {
  const result = await pool.query('SELECT * FROM monitorings WHERE id = $1;', [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const checkDuplicateAssignment = async (
  sensorId: number,
  zoneId: number,
  readingType: string
): Promise<boolean> => {
  const result = await pool.query(
    'SELECT 1 FROM monitorings WHERE sensor_id = $1 AND zone_id = $2 AND reading_type = $3;',
    [sensorId, zoneId, readingType]
  );
  return result.rows.length > 0;
};

export const createMonitoring = async (
  data: Omit<Monitoring, 'id' | 'created_at'>
): Promise<Monitoring> => {
  const query = `
    INSERT INTO monitorings (sensor_id, zone_id, installation_date, reading_type, threshold_value, current_value, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    data.sensor_id,
    data.zone_id,
    data.installation_date,
    data.reading_type,
    data.threshold_value,
    data.current_value,
    data.status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateMonitoring = async (
  id: number,
  thresholdValue?: number,
  status?: 'active' | 'paused',
  currentValue?: number
): Promise<Monitoring | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (thresholdValue !== undefined) {
    fields.push(`threshold_value = $${paramIdx++}`);
    values.push(thresholdValue);
  }

  if (status !== undefined) {
    fields.push(`status = $${paramIdx++}`);
    values.push(status);
  }

  if (currentValue !== undefined) {
    fields.push(`current_value = $${paramIdx++}`);
    values.push(currentValue);
  }

  if (fields.length === 0) {
    // If nothing to update, return the existing monitoring
    return getMonitoringById(id);
  }

  values.push(id);
  const query = `
    UPDATE monitorings
    SET ${fields.join(', ')}
    WHERE id = $${paramIdx}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const deleteMonitoring = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM monitorings WHERE id = $1;', [id]);
};

