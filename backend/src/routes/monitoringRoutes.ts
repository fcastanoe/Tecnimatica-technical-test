import { Router } from 'express';
import { getMonitorings, createMonitoring, updateMonitoring } from '../controllers/monitoringController';

const router = Router();

router.get('/', getMonitorings);
router.post('/', createMonitoring);
router.patch('/:id', updateMonitoring);

export default router;
