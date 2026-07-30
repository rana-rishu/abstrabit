import { AppError } from './AppError';

export class RetrievalError extends AppError {
  constructor(message = 'Failed to retrieve relevant document context', details?: unknown) {
    super(message, 500, 'RETRIEVAL_FAILED', details);
  }
}

export class PromptBuildError extends AppError {
  constructor(message = 'Failed to construct system prompt', details?: unknown) {
    super(message, 500, 'PROMPT_BUILD_FAILED', details);
  }
}

export class ContextOverflowError extends AppError {
  constructor(message = 'Retrieved context exceeds maximum token budget', details?: unknown) {
    super(message, 400, 'CONTEXT_OVERFLOW', details);
  }
}

export class LLMProviderError extends AppError {
  constructor(message = 'LLM provider call failed', details?: unknown) {
    super(message, 502, 'LLM_PROVIDER_ERROR', details);
  }
}

export class CitationError extends AppError {
  constructor(message = 'Failed to map response citations', details?: unknown) {
    super(message, 500, 'CITATION_MAPPING_FAILED', details);
  }
}
