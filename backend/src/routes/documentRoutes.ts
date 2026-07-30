import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/DocumentController';
import { authGuard } from '../middlewares/authGuard';
import { workspaceGuard } from '../middlewares/workspaceGuard';
import { UnsupportedFileError } from '../errors/IngestionErrors';

const router = Router({ mergeParams: true });
const controller = new DocumentController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB Max File Size
  },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    const isPdfExt = ext === 'pdf';
    const isPdfMime = file.mimetype === 'application/pdf';

    if (!isPdfExt || !isPdfMime) {
      return cb(
        new UnsupportedFileError(
          `File format '.${ext}' is not supported. Only PDF (.pdf) documents are allowed.`,
        ),
      );
    }
    cb(null, true);
  },
});

router.post(
  '/upload',
  authGuard,
  workspaceGuard,
  upload.single('document'),
  controller.uploadDocument,
);

router.get('/', authGuard, workspaceGuard, controller.listDocuments);
router.delete('/:documentId', authGuard, workspaceGuard, controller.deleteDocument);

export default router;
