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
