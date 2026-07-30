import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authGuard } from '../middlewares/authGuard';
import { workspaceGuard } from '../middlewares/workspaceGuard';

const router = Router({ mergeParams: true });
const controller = new ChatController();

router.post('/', authGuard, workspaceGuard, controller.chat);
router.get('/history', authGuard, workspaceGuard, controller.getChatHistory);
router.get('/debug', authGuard, workspaceGuard, controller.getDebugRetrieval);

export default router;
