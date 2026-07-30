import { ScoredChunk } from './IRetriever';

export interface IReranker {
  rerank(
    vectorResults: ScoredChunk[],
    keywordResults: ScoredChunk[],
    topK?: number,
  ): ScoredChunk[];
}
