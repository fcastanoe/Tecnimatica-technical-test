import { Router } from 'express';
import { getSensors, getSensorZones } from '../controllers/sensorController';

const router = Router();

router.get('/', getSensors);
router.get('/:id/zones', getSensorZones);

export default router;
