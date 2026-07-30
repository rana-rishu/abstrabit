import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { authGuard } from '../middlewares/authGuard';
import { workspaceGuard } from '../middlewares/workspaceGuard';

const router = Router({ mergeParams: true });
const controller = new TaskController();

router.get('/', authGuard, workspaceGuard, controller.listTasks);
router.post('/', authGuard, workspaceGuard, controller.createTask);
router.patch('/:taskId/status', authGuard, workspaceGuard, controller.updateTaskStatus);
router.delete('/:taskId', authGuard, workspaceGuard, controller.deleteTask);

export default router;
