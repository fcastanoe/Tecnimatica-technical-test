import pool from '../config/database';
import { Sensor } from '../interfaces';

export const getAllSensors = async (): Promise<Sensor[]> => {
  const result = await pool.query('SELECT * FROM sensors ORDER BY id;');
  return result.rows;
};

export const getSensorById = async (id: number): Promise<Sensor | null> => {
  const result = await pool.query('SELECT * FROM sensors WHERE id = $1;', [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};
