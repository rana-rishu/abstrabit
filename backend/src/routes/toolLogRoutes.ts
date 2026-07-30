import { Router } from 'express';
import { ToolLogController } from '../controllers/ToolLogController';
import { authGuard } from '../middlewares/authGuard';
import { workspaceGuard } from '../middlewares/workspaceGuard';

const router = Router({ mergeParams: true });
const controller = new ToolLogController();

router.get('/', authGuard, workspaceGuard, controller.listToolLogs);

export default router;
