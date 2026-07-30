import { z } from 'zod';

export const documentUploadQuerySchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID format'),
});

export const documentIdParamSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID format'),
  documentId: z.string().uuid('Invalid document ID format'),
});

export type DocumentUploadQuery = z.infer<typeof documentUploadQuerySchema>;
export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
