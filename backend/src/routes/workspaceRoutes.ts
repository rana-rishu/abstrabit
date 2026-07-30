import { Router } from 'express';
import { WorkspaceController } from '../controllers/WorkspaceController';
import { authGuard } from '../middlewares/authGuard';

const router = Router();
const controller = new WorkspaceController();

router.get('/', authGuard, controller.listWorkspaces);
router.post('/', authGuard, controller.createWorkspace);

export default router;
