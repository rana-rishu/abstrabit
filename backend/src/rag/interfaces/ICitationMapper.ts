import { CitationReference } from '../../models/chat.model';
import { ScoredChunk } from './IRetriever';

export interface ICitationMapper {
  mapCitations(
    chunks: ScoredChunk[],
    documentMap: Map<string, { filename: string }>,
  ): CitationReference[];
}
