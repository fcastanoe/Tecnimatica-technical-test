import { Router } from 'express';
import { getMonitorings, createMonitoring, updateMonitoring, deleteMonitoring } from '../controllers/monitoringController';

const router = Router();

router.get('/', getMonitorings);
router.post('/', createMonitoring);
router.patch('/:id', updateMonitoring);
router.delete('/:id', deleteMonitoring);

export default router;
