import { Request, Response, NextFunction } from 'express';
import { IngestionService } from '../services/IngestionService';
import { ApiResponse } from '../dto/response.dto';
import { ValidationError } from '../errors/AppError';
import { paginationQuerySchema } from '../dto/pagination.dto';
import { documentIdParamSchema } from '../validators/documentValidators';

export class DocumentController {
  private ingestionService: IngestionService;

  constructor(ingestionService?: IngestionService) {
    this.ingestionService = ingestionService || new IngestionService();
  }

  public uploadDocument = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        throw new ValidationError('Workspace ID is required');
      }

      if (!req.file) {
        throw new ValidationError('No document file uploaded');
      }

      // Filename sanitization
      const originalFilename = req.file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const mimeType = req.file.mimetype;

      const result = await this.ingestionService.ingestDocument(
        workspaceId,
        req.file.buffer,
        originalFilename,
        mimeType,
        req.id,
      );

      const statusCode = result.isDuplicate ? 200 : 201;
      res.status(statusCode).json(ApiResponse.success(result, undefined, req.id));
    } catch (err) {
      next(err);
    }
  };

  public listDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspaceId = req.params.workspaceId || (req.headers['x-workspace-id'] as string);
      const queryValidation = paginationQuerySchema.safeParse(req.query);
      const { page, limit } = queryValidation.success
        ? queryValidation.data
        : { page: 1, limit: 20 };

      const result = await this.ingestionService.listWorkspaceDocuments(
        workspaceId,
        page,
        limit,
      );

      res.status(200).json(ApiResponse.success(result.data, result.meta, req.id));
    } catch (err) {
      next(err);
    }
  };

  public deleteDocument = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const paramValidation = documentIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError('Invalid workspace or document ID format', paramValidation.error.format());
      }

      const { workspaceId, documentId } = paramValidation.data;
      const success = await this.ingestionService.deleteDocument(documentId, workspaceId);

      if (!success) {
        throw new ValidationError('Document not found or already deleted');
      }

      res.status(200).json(
        ApiResponse.success({ message: 'Document deleted successfully' }, undefined, req.id),
      );
    } catch (err) {
      next(err);
    }
  };
}
