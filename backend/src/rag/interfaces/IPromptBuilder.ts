import { ScoredChunk } from './IRetriever';

export interface ConstructedPrompt {
  systemInstruction: string;
  userPayload: string;
  retrievedContextText: string;
}

export interface IPromptBuilder {
  buildPrompt(query: string, chunks: ScoredChunk[]): ConstructedPrompt;
}
