import { QueryProcessor } from './query/QueryProcessor';
import { EmbeddingProviderFactory } from './embeddings/EmbeddingProviderFactory';
import { IEmbeddingProvider } from './embeddings/IEmbeddingProvider';
import { IHybridRetriever } from './interfaces/IRetriever';
import { HybridRetriever } from './retrieval/HybridRetriever';
import { ContextCompressor } from './compression/ContextCompressor';
import { IPromptBuilder } from './interfaces/IPromptBuilder';
import { PromptBuilder } from './prompts/PromptBuilder';
import { ILLMClient, LLMResponse } from './interfaces/ILLMClient';
import { GeminiClient } from './llm/GeminiClient';
import { ICitationMapper } from './interfaces/ICitationMapper';
import { CitationMapper } from './citations/CitationMapper';
import { RetrievalDebugger, DebuggerPayload } from './debug/RetrievalDebugger';
import { ToolExecutor } from '../tools/ToolExecutor';
import { IDocumentRepository } from '../repositories/interfaces/IDocumentRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ITaskRepository } from '../repositories/interfaces/ITaskRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { CitationReference } from '../models/chat.model';
import { SemanticQuoteExtractor } from './compression/SemanticQuoteExtractor';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';

export interface ActiveContext {
  documentId?: string;
  pageNumber?: number;
  sectionId?: string;
  sectionTitle?: string;
}

export interface RagResult {
  answer: string;
  citations: CitationReference[];
  activeContext?: ActiveContext;
  executedTools?: Array<{ toolName: string; success: boolean; data?: unknown }>;
  debugPayload?: DebuggerPayload;
  metrics: {
    embeddingMs: number;
    hybridMs: number;
    compressionMs: number;
    llmMs: number;
    totalMs: number;
    promptTokens: number;
    completionTokens: number;
  };
}

export class RagOrchestrator {
  private queryProcessor: QueryProcessor;
  private embeddingProvider: IEmbeddingProvider;
  private hybridRetriever: IHybridRetriever;
  private contextCompressor: ContextCompressor;
  private semanticQuoteExtractor: SemanticQuoteExtractor;
  private promptBuilder: IPromptBuilder;
  private llmClient: ILLMClient;
  private citationMapper: ICitationMapper;
  private toolExecutor: ToolExecutor;
  private documentRepo: IDocumentRepository;
  private taskRepo: ITaskRepository;

  constructor(
    queryProcessor?: QueryProcessor,
    embeddingProvider?: IEmbeddingProvider,
    hybridRetriever?: IHybridRetriever,
    contextCompressor?: ContextCompressor,
    promptBuilder?: IPromptBuilder,
    llmClient?: ILLMClient,
    citationMapper?: ICitationMapper,
    toolExecutor?: ToolExecutor,
    documentRepo?: IDocumentRepository,
    taskRepo?: ITaskRepository,
  ) {
    this.queryProcessor = queryProcessor || new QueryProcessor();
    this.embeddingProvider = embeddingProvider || EmbeddingProviderFactory.getProvider();
    this.hybridRetriever = hybridRetriever || new HybridRetriever();
    this.contextCompressor = contextCompressor || new ContextCompressor(3500);
    this.semanticQuoteExtractor = new SemanticQuoteExtractor();
    this.promptBuilder = promptBuilder || new PromptBuilder();
    this.llmClient = llmClient || new GeminiClient();
    this.citationMapper = citationMapper || new CitationMapper();
    this.toolExecutor = toolExecutor || new ToolExecutor();
    this.documentRepo = documentRepo || new DocumentRepository();
    this.taskRepo = taskRepo || new TaskRepository();
  }

  public async execute(
    workspaceId: string,
    rawQuery: string,
    userId: string,
    activeContext?: ActiveContext,
    includeDebug = false,
    requestId = 'req-internal',
  ): Promise<RagResult> {
    const t0 = Date.now();

    // Step 1: Query Preprocessing
    const processedQuery = await this.queryProcessor.process(rawQuery);

    // Bypass RAG pipeline early if query is a tasks list shortcut command
    const startsWithTasksListCommand = /^@tasks\b/i.test(rawQuery.trim());
    if (startsWithTasksListCommand) {
      const tasksResult = await this.taskRepo.listByWorkspace(workspaceId, undefined, 1, 100);
      const tasks = tasksResult.data;

      let answer = `[System Action]: Retrieved tasks for this workspace.\n\n`;
      if (tasks.length === 0) {
        answer += `No tasks found in this workspace.`;
      } else {
        answer += `Here are the tasks in this workspace:\n`;
        tasks.forEach((task, index) => {
          const desc = task.description ? ` - *${task.description}*` : '';
          answer += `${index + 1}. **${task.title}** [Priority: \`${task.priority}\`, Status: \`${task.status}\`]${desc}\n`;
        });
      }

      const totalMs = Date.now() - t0;
      return {
        answer,
        citations: [],
        metrics: {
          embeddingMs: 0,
          hybridMs: 0,
          compressionMs: 0,
          llmMs: 0,
          totalMs,
          promptTokens: 0,
          completionTokens: 0,
        },
      };
    }

    // Bypass RAG pipeline early if query is a task shortcut command
    const startsWithTaskCommand = /^@task\b/i.test(rawQuery.trim());
    if (startsWithTaskCommand) {
      const taskTitleMatch = rawQuery.trim().match(/^@task\s+(.+)/i);
      const title = taskTitleMatch ? taskTitleMatch[1].trim() : 'Task from Chat Assistant';

      const toolResult = await this.toolExecutor.executeTool(
        'save_task',
        { title, priority: 'HIGH' },
        { userId, workspaceId, requestId },
      );

      const totalMs = Date.now() - t0;
      return {
        answer: `[System Action]: Task "${title}" saved successfully to this workspace.`,
        citations: [],
        executedTools: [{
          toolName: 'save_task',
          success: toolResult.success,
          data: toolResult.data,
        }],
        metrics: {
          embeddingMs: 0,
          hybridMs: 0,
          compressionMs: 0,
          llmMs: 0,
          totalMs,
          promptTokens: 0,
          completionTokens: 0,
        },
      };
    }

    // Step 2: Generate Query Embedding
    const tEmbed = Date.now();
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(
      processedQuery.normalizedQuery,
    );
    const embeddingMs = Date.now() - tEmbed;

    // Step 3: Candidate Vector & Hybrid Search (Top 25)
    const tHybrid = Date.now();
    let candidateChunks = await this.hybridRetriever.retrieveHybrid(
      workspaceId,
      queryEmbedding,
      processedQuery.normalizedQuery,
      25,
    );
    const hybridMs = Date.now() - tHybrid;

    // Step 4: Configurable Active Context Score Boosting (env.ACTIVE_CONTEXT_BOOST)
    const contextBoost = env.ACTIVE_CONTEXT_BOOST;
    if (activeContext && activeContext.documentId) {
      candidateChunks = candidateChunks.map((chunk) => {
        let boost = 0;
        if (chunk.document_id === activeContext.documentId) {
          boost += contextBoost;
          if (activeContext.pageNumber && chunk.page_number === activeContext.pageNumber) {
            boost += contextBoost / 2;
          }
          if (activeContext.sectionId && chunk.section_id === activeContext.sectionId) {
            boost += contextBoost / 2;
          }
        }
        return {
          ...chunk,
          vectorSimilarity: (chunk.vectorSimilarity || chunk.similarity || 0) + boost,
        };
      }).sort((a, b) => (b.vectorSimilarity || 0) - (a.vectorSimilarity || 0));
    }

    // Step 5: Filter to Top 3 Highest Priority Sources & Adjacent Chunk Merging
    const tCompress = Date.now();
    const topCandidatesOnly = candidateChunks.slice(0, 3);
    const compressed = this.contextCompressor.compress(topCandidatesOnly, 3500);
    const compressionMs = Date.now() - tCompress;

    // Step 6: Semantic Vector-Based Quote Extraction
    const { extractedQuotes, textPayload } = await this.semanticQuoteExtractor.extractSemanticQuotes(
      compressed.chunks,
      queryEmbedding,
      this.embeddingProvider,
      6,
    );

    // --- STRUCTURED DEBUG LOGGING ---
    logger.debug(
      {
        requestId,
        workspaceId,
        rawQuery,
        activeContext,
        contextBoost,
        candidatesCount: candidateChunks.length,
        mergedChunksCount: compressed.chunks.length,
        extractedQuotesCount: extractedQuotes.length,
        candidates: compressed.chunks.map((c, idx) => ({
          documentId: c.document_id,
          pageNumber: c.page_number ?? 1,
          sectionId: c.section_id || 'N/A',
          sectionTitle: c.section_title || 'General',
          rawVectorScore: c.similarity || 0,
          displayedSimilarity: c.vectorSimilarity || c.similarity || 0,
          retrievalRank: c.retrievalRank || idx + 1,
          charStart: c.charStart ?? 0,
          charEnd: c.charEnd ?? 0,
          preview: `${c.content.slice(0, 150)}...`,
        })),
        textPayloadPreview: `${textPayload.slice(0, 300)}...`,
      },
      'RAG Retrieval executed',
    );

    // Step 7: Construct System Prompt
    const prompt = this.promptBuilder.buildPrompt(
      processedQuery.normalizedQuery,
      compressed.chunks,
    );

    // Step 8: System Tool Execution Stub (for future extensions)
    const executedTools: Array<{ toolName: string; success: boolean; data?: unknown }> = [];

    // Step 9: LLM Completion
    const llmRes: LLMResponse = await this.llmClient.generateResponse(
      prompt.systemInstruction,
      prompt.userPayload,
    );

    // Step 10: Map Evidence Citations with Filenames
    const documentIds = [...new Set(compressed.chunks.map((c) => c.document_id))];
    const documentMap = new Map<string, { filename: string }>();

    for (const docId of documentIds) {
      const doc = await this.documentRepo.findById(docId, workspaceId);
      if (doc) {
        documentMap.set(docId, { filename: doc.filename });
      }
    }

    const citations = this.citationMapper.mapCitations(compressed.chunks, documentMap);
    const totalMs = Date.now() - t0;

    let finalAnswer = llmRes.text;
    if (executedTools.length > 0) {
      finalAnswer += `\n\n[System Action]: Executed tool '${executedTools[0].toolName}' successfully.`;
    }

    // Update active context from top retrieved candidate for session continuity
    const topChunk = compressed.chunks[0];
    const newActiveContext: ActiveContext | undefined = topChunk
      ? {
          documentId: topChunk.document_id,
          pageNumber: topChunk.page_number || 1,
          sectionId: topChunk.section_id || undefined,
          sectionTitle: topChunk.section_title || undefined,
        }
      : undefined;

    logger.info(
      {
        requestId,
        workspaceId,
        userId,
        query: processedQuery.normalizedQuery,
        retrievedCount: compressed.chunks.length,
        executedToolsCount: executedTools.length,
        metrics: { embeddingMs, hybridMs, compressionMs, llmMs: llmRes.durationMs, totalMs },
      },
      'RAG Search and Completion successful',
    );

    let debugPayload: DebuggerPayload | undefined;
    if (includeDebug) {
      debugPayload = RetrievalDebugger.createPayload(
        processedQuery.normalizedQuery,
        workspaceId,
        embeddingMs,
        hybridMs,
        compressionMs,
        compressed.chunks,
        compressed.rejectedChunkCount,
        prompt.systemInstruction,
        prompt.userPayload,
        llmRes,
      );
    }

    return {
      answer: finalAnswer,
      citations,
      activeContext: newActiveContext,
      executedTools: executedTools.length > 0 ? executedTools : undefined,
      debugPayload,
      metrics: {
        embeddingMs,
        hybridMs,
        compressionMs,
        llmMs: llmRes.durationMs,
        totalMs,
        promptTokens: llmRes.usage.promptTokens,
        completionTokens: llmRes.usage.completionTokens,
      },
    };
  }
}
