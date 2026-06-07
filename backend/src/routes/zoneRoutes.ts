import { Router } from 'express';
import { getZones, getZoneSensors } from '../controllers/zoneController';

const router = Router();

router.get('/', getZones);
router.get('/:id/sensors', getZoneSensors);

export default router;
