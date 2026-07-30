import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();

router.get('/live', HealthController.getLive);
router.get('/ready', HealthController.getReady);
router.get('/metrics', HealthController.getMetrics);

export default router;
