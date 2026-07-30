import { ScoredChunk } from './IRetriever';

export interface CompressedContext {
  chunks: ScoredChunk[];
  totalTokens: number;
  rejectedChunkCount: number;
}

export interface IContextCompressor {
  compress(chunks: ScoredChunk[], maxTokenBudget?: number): CompressedContext;
}
