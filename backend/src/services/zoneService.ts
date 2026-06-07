import pool from '../config/database';
import { Zone } from '../interfaces';

export const getZoneById = async (id: number): Promise<Zone | null> => {
  const result = await pool.query('SELECT * FROM zones WHERE id = $1;', [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getAllZones = async (): Promise<Zone[]> => {
  const result = await pool.query('SELECT * FROM zones ORDER BY id;');
  return result.rows;
};

export const updateZoneStatus = async (
  id: number,
  operational_status: 'operational' | 'non-operational'
): Promise<Zone | null> => {
  const result = await pool.query(
    'UPDATE zones SET operational_status = $1 WHERE id = $2 RETURNING *;',
    [operational_status, id]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

