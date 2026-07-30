import { ICitationMapper } from '../interfaces/ICitationMapper';
import { CitationReference } from '../../models/chat.model';
import { ScoredChunk } from '../interfaces/IRetriever';

export class CitationMapper implements ICitationMapper {
  public mapCitations(
    chunks: ScoredChunk[],
    documentMap: Map<string, { filename: string }>,
  ): CitationReference[] {
    return chunks.map((chunk) => {
      const doc = documentMap.get(chunk.document_id);
      return {
        document_id: chunk.document_id,
        filename: doc?.filename || 'Document',
        chunk_index: chunk.chunk_index,
        section_id: chunk.section_id || undefined,
        section_title: chunk.section_title || 'General',
        page_number: chunk.page_number ?? undefined,
        vector_similarity: chunk.vectorSimilarity !== undefined ? parseFloat(chunk.vectorSimilarity.toFixed(4)) : (chunk.similarity ? parseFloat(chunk.similarity.toFixed(4)) : undefined),
        retrieval_rank: chunk.retrievalRank || chunk.vectorRank || 1,
        content: chunk.content,
        char_start: chunk.charStart,
        char_end: chunk.charEnd,
      };
    });
  }
}
