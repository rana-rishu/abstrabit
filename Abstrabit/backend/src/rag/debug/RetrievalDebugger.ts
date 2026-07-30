import { ScoredChunk } from '../interfaces/IRetriever';
import { LLMResponse } from '../interfaces/ILLMClient';

export interface DebuggerPayload {
  query: string;
  workspaceId: string;
  embeddingMetadata: {
    model: string;
    dimension: number;
    embeddingMs: number;
  };
  retrievalMetrics: {
    totalChunksRetrieved: number;
    acceptedChunksCount: number;
    rejectedChunksCount: number;
    hybridMs: number;
    compressionMs: number;
  };
  scoredChunks: Array<{
    id: string;
    documentId: string;
    chunkIndex: number;
    content: string;
    sectionTitle?: string;
    vectorRank?: number;
    keywordRank?: number;
    fusionScore?: number;
    similarity?: number;
  }>;
  promptPreview: {
    systemInstruction: string;
    userPayload: string;
  };
  llmResponse: LLMResponse;
}

export class RetrievalDebugger {
  public static createPayload(
    query: string,
    workspaceId: string,
    embeddingMs: number,
    hybridMs: number,
    compressionMs: number,
    acceptedChunks: ScoredChunk[],
    rejectedCount: number,
    systemInstruction: string,
    userPayload: string,
    llmResponse: LLMResponse,
  ): DebuggerPayload {
    return {
      query,
      workspaceId,
      embeddingMetadata: {
        model: 'text-embedding-004',
        dimension: 768,
        embeddingMs,
      },
      retrievalMetrics: {
        totalChunksRetrieved: acceptedChunks.length + rejectedCount,
        acceptedChunksCount: acceptedChunks.length,
        rejectedChunksCount: rejectedCount,
        hybridMs,
        compressionMs,
      },
      scoredChunks: acceptedChunks.map((c) => ({
        id: c.id,
        documentId: c.document_id,
        chunkIndex: c.chunk_index,
        content: c.content,
        sectionTitle: c.section_title || undefined,
        vectorRank: c.vectorRank,
        keywordRank: c.keywordRank,
        fusionScore: c.fusionScore ? parseFloat(c.fusionScore.toFixed(4)) : undefined,
        similarity: c.similarity ? parseFloat(c.similarity.toFixed(3)) : undefined,
      })),
      promptPreview: {
        systemInstruction,
        userPayload,
      },
      llmResponse,
    };
  }
}
