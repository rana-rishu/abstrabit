export interface LLMResponse {
  text: string;
  finishReason?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

export interface ILLMClient {
  generateResponse(systemInstruction: string, userPayload: string): Promise<LLMResponse>;
  getModelName(): string;
}
