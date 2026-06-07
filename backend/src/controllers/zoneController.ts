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
      throw new AppError(`La zona con ID ${zoneId} no fue encontrada`, 404);
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

export const updateZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const zoneId = parseInt(req.params.id as string);
    if (isNaN(zoneId)) {
      throw new AppError('El ID de la zona debe ser un número válido', 400);
    }

    const zone = await zoneService.getZoneById(zoneId);
    if (!zone) {
      throw new AppError(`La zona con ID ${zoneId} no fue encontrada`, 404);
    }

    const { operational_status } = req.body;
    if (operational_status !== 'operational' && operational_status !== 'non-operational') {
      throw new AppError("operational_status debe ser 'operational' o 'non-operational'", 400);
    }

    const updated = await zoneService.updateZoneStatus(zoneId, operational_status);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

