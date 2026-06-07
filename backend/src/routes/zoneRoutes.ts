import { Router } from 'express';
import { getZones, getZoneSensors, updateZone } from '../controllers/zoneController';

const router = Router();

router.get('/', getZones);
router.get('/:id/sensors', getZoneSensors);
router.patch('/:id', updateZone);

export default router;

