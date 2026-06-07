import { Request, Response, NextFunction } from 'express';
import * as zoneService from '../services/zoneService';
import * as monitoringService from '../services/monitoringService';
import { AppError } from '../middlewares/errorHandler';

export const getZoneSensors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zoneId = parseInt(req.params.id as string);
    if (isNaN(zoneId)) {
      throw new AppError('El ID de la zona debe ser un número válido', 400);
    }

    const zone = await zoneService.getZoneById(zoneId);
    if (!zone) {
      throw new AppError(`Zona con id ${zoneId} was not found`, 404);
    }

    const sensors = await monitoringService.getSensorsByZone(zoneId);
    res.json(sensors);
  } catch (error) {
    next(error);
  }
};

export const getZones = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zones = await zoneService.getAllZones();
    res.json(zones);
  } catch (error) {
    next(error);
  }
};
