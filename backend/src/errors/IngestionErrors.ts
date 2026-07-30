import { AppError } from './AppError';

export class UnsupportedFileError extends AppError {
  constructor(message = 'Unsupported file format or MIME type', details?: unknown) {
    super(message, 400, 'UNSUPPORTED_FILE_FORMAT', details);
  }
}

export class ExtractionError extends AppError {
  constructor(message = 'Failed to extract text from document', details?: unknown) {
    super(message, 422, 'EXTRACTION_FAILED', details);
  }
}

export class ChunkingError extends AppError {
  constructor(message = 'Document chunking process failed', details?: unknown) {
    super(message, 422, 'CHUNKING_FAILED', details);
  }
}

export class EmbeddingError extends AppError {
  constructor(message = 'Failed to generate vector embeddings', details?: unknown) {
    super(message, 502, 'EMBEDDING_GENERATION_FAILED', details);
  }
}

export class DuplicateDocumentError extends AppError {
  constructor(message = 'Identical document already exists in this workspace', details?: unknown) {
    super(message, 409, 'DUPLICATE_DOCUMENT', details);
  }
}
