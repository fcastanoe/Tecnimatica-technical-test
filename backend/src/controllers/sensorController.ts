import { Request, Response, NextFunction } from 'express';
import * as sensorService from '../services/sensorService';
import * as monitoringService from '../services/monitoringService';
import { AppError } from '../middlewares/errorHandler';

export const getSensors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sensors = await sensorService.getAllSensors();
    res.json(sensors);
  } catch (error) {
    next(error);
  }
};

export const getSensorZones = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sensorId = parseInt(req.params.id as string);
    if (isNaN(sensorId)) {
      throw new AppError('El ID del sensor debe ser un número válido', 400);
    }

    const sensor = await sensorService.getSensorById(sensorId);
    if (!sensor) {
      throw new AppError(`El sensor con ID ${sensorId} no fue encontrado`, 404);
    }

    const zones = await monitoringService.getZonesBySensor(sensorId);
    res.json(zones);
  } catch (error) {
    next(error);
  }
};
