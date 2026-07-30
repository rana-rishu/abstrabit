import { ChunkWithSimilarity } from '../../models/chunk.model';

export interface ScoredChunk extends ChunkWithSimilarity {
  vectorRank?: number;
  keywordRank?: number;
  fusionScore?: number;
  vectorSimilarity?: number;
  retrievalRank?: number;
  charStart?: number;
  charEnd?: number;
}

export interface IVectorRetriever {
  retrieveVector(
    workspaceId: string,
    queryEmbedding: number[],
    limit?: number,
  ): Promise<ScoredChunk[]>;
}

export interface IKeywordRetriever {
  retrieveKeyword(
    workspaceId: string,
    queryText: string,
    limit?: number,
  ): Promise<ScoredChunk[]>;
}

export interface IHybridRetriever {
  retrieveHybrid(
    workspaceId: string,
    queryEmbedding: number[],
    queryText: string,
    limit?: number,
  ): Promise<ScoredChunk[]>;
}
