import { Request, Response, NextFunction } from 'express';
import * as monitoringService from '../services/monitoringService';
import * as sensorService from '../services/sensorService';
import * as zoneService from '../services/zoneService';
import { AppError } from '../middlewares/errorHandler';

export const getMonitorings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    if (status && status !== 'active' && status !== 'paused') {
      throw new AppError("El estado debe ser 'active' o 'paused'", 400);
    }
    const monitorings = await monitoringService.getAllMonitorings(status);
    res.json(monitorings);
  } catch (error) {
    next(error);
  }
};

export const createMonitoring = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sensor_id, zone_id, installation_date, reading_type, threshold_value, current_value, status } = req.body;

    // 1. Validaciones básicas de presencia
    if (sensor_id === undefined || zone_id === undefined || !installation_date || !reading_type || threshold_value === undefined || current_value === undefined || !status) {
      throw new AppError('Faltan campos obligatorios en el cuerpo de la petición', 400);
    }

    // 2. Validaciones de tipos de datos
    const parsedSensorId = parseInt(sensor_id);
    const parsedZoneId = parseInt(zone_id);
    if (isNaN(parsedSensorId) || isNaN(parsedZoneId)) {
      throw new AppError('sensor_id y zone_id deben ser números válidos', 400);
    }

    // 3. Validar existencia de Sensor
    const sensor = await sensorService.getSensorById(parsedSensorId);
    if (!sensor) {
      throw new AppError(`El sensor con ID ${parsedSensorId} no fue encontrado`, 404);
    }

    // 4. Validar existencia de Zona
    const zone = await zoneService.getZoneById(parsedZoneId);
    if (!zone) {
      throw new AppError(`La zona con ID ${parsedZoneId} no fue encontrada`, 404);
    }

    // 5. Validar tipo de lectura
    const validReadingTypes = ['temperature', 'pressure', 'vibration', 'flow'];
    if (!validReadingTypes.includes(reading_type)) {
      throw new AppError(`reading_type debe ser uno de: ${validReadingTypes.join(', ')}`, 400);
    }

    // 6. Validar umbral
    const parsedThreshold = parseFloat(threshold_value);
    if (isNaN(parsedThreshold) || parsedThreshold <= 0) {
      throw new AppError('El valor umbral debe ser mayor que 0', 400);
    }

    // 7. Validar estado
    if (status !== 'active' && status !== 'paused') {
      throw new AppError("status debe ser 'active' o 'paused'", 400);
    }

    // 8. Validar duplicación (sensor_id, zone_id, reading_type único)
    const isDuplicate = await monitoringService.checkDuplicateAssignment(parsedSensorId, parsedZoneId, reading_type);
    if (isDuplicate) {
      throw new AppError('Ya existe un monitoreo registrado con este sensor, zona y tipo de lectura', 400);
    }

    const newMonitoring = await monitoringService.createMonitoring({
      sensor_id: parsedSensorId,
      zone_id: parsedZoneId,
      installation_date,
      reading_type,
      threshold_value: parsedThreshold,
      current_value: parseFloat(current_value),
      status,
    });

    res.status(201).json(newMonitoring);
  } catch (error) {
    next(error);
  }
};

export const updateMonitoring = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const monitoringId = parseInt(req.params.id as string);
    if (isNaN(monitoringId)) {
      throw new AppError('El ID del monitoreo debe ser un número válido', 400);
    }

    const { threshold_value, status, current_value } = req.body;

    // Validar si el monitoreo existe
    const monitoring = await monitoringService.getMonitoringById(monitoringId);
    if (!monitoring) {
      throw new AppError(`El monitoreo con ID ${monitoringId} no fue encontrado`, 404);
    }

    // Validar umbral si se envía
    let parsedThreshold: number | undefined;
    if (threshold_value !== undefined) {
      parsedThreshold = parseFloat(threshold_value);
      if (isNaN(parsedThreshold) || parsedThreshold <= 0) {
        throw new AppError('El valor umbral debe ser mayor que 0', 400);
      }
    }

    // Validar estado si se envía
    if (status !== undefined && status !== 'active' && status !== 'paused') {
      throw new AppError("status debe ser 'active' o 'paused'", 400);
    }

    // Validar valor actual si se envía
    let parsedCurrent: number | undefined;
    if (current_value !== undefined) {
      parsedCurrent = parseFloat(current_value);
      if (isNaN(parsedCurrent)) {
        throw new AppError('El valor actual debe ser un número válido', 400);
      }
    }

    const updated = await monitoringService.updateMonitoring(monitoringId, parsedThreshold, status, parsedCurrent);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteMonitoring = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const monitoringId = parseInt(req.params.id as string);
    if (isNaN(monitoringId)) {
      throw new AppError('El ID del monitoreo debe ser un número válido', 400);
    }

    // Validar si el monitoreo existe
    const monitoring = await monitoringService.getMonitoringById(monitoringId);
    if (!monitoring) {
      throw new AppError(`El monitoreo con ID ${monitoringId} no fue encontrado`, 404);
    }

    await monitoringService.deleteMonitoring(monitoringId);
    res.json({ message: 'Monitoreo eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

