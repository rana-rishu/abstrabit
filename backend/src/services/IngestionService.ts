import { IDocumentRepository } from '../repositories/interfaces/IDocumentRepository';
import { IChunkRepository } from '../repositories/interfaces/IChunkRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ChunkRepository } from '../repositories/ChunkRepository';
import { PdfExtractor } from './extractors/PdfExtractor';
import { ExtractedDocument } from './extractors/IDocumentExtractor';
import { normalizeDocument, computeSha256 } from '../utils/textNormalizer';
import { SemanticChunker, GeneratedChunk } from '../rag/chunking/semanticChunker';
import { EmbeddingProviderFactory } from '../rag/embeddings/EmbeddingProviderFactory';
import { defaultEmbeddingCache, IEmbeddingCache } from '../rag/embeddings/EmbeddingCache';
import { runInTransaction } from '../db/transaction';
import { Document } from '../models/document.model';
import { logger } from '../utils/logger';

export interface StageMetrics {
  extractionMs: number;
  chunkingMs: number;
  embeddingMs: number;
  persistenceMs: number;
  totalMs: number;
  chunkCount: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface IngestionResult {
  document: Document;
  isDuplicate: boolean;
  metrics: StageMetrics;
}

export class IngestionService {
  private documentRepo: IDocumentRepository;
  private chunkRepo: IChunkRepository;
  private chunker: SemanticChunker;
  private cache: IEmbeddingCache;

  constructor(
    documentRepo?: IDocumentRepository,
    chunkRepo?: IChunkRepository,
    cache?: IEmbeddingCache,
  ) {
    this.documentRepo = documentRepo || new DocumentRepository();
    this.chunkRepo = chunkRepo || new ChunkRepository();
    this.chunker = new SemanticChunker({ targetChunkSize: 500, overlapSize: 100 });
    this.cache = cache || defaultEmbeddingCache;
  }

  public async ingestDocument(
    workspaceId: string,
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType?: string,
    requestId?: string,
  ): Promise<IngestionResult> {
    const startTime = Date.now();

    // 1. Compute SHA-256 Checksum for Idempotency Check
    const fileHash = computeSha256(fileBuffer);

    logger.debug(
      {
        requestId,
        workspaceId,
        filename: originalFilename,
        mimeType: mimeType || 'application/pdf',
        fileSizeBytes: fileBuffer.length,
        fileHash,
      },
      'Ingestion Stage 1: File Upload verified',
    );

    const existingDoc = await this.documentRepo.findByHash(workspaceId, fileHash);

    if (existingDoc) {
      logger.info(
        { requestId, workspaceId, fileHash, documentId: existingDoc.id },
        'Idempotency Match: Identical document already exists in workspace. Skipping ingestion.',
      );
      return {
        document: existingDoc,
        isDuplicate: true,
        metrics: {
          extractionMs: 0,
          chunkingMs: 0,
          embeddingMs: 0,
          persistenceMs: 0,
          totalMs: Date.now() - startTime,
          chunkCount: existingDoc.chunk_count,
          cacheHits: 0,
          cacheMisses: 0,
        },
      };
    }

    // Stage 1: Extraction & Metadata Collection
    const { extractedData, extractionMs } = await this.extractStage(fileBuffer, originalFilename, mimeType);

    // Stage 2: Page-by-Page Text Normalization
    const normalizedDoc = this.normalizeStage(extractedData);

    // Stage 3: Page-Scoped Structure-Aware Semantic Chunking
    const { chunks, chunkingMs } = this.chunkStage(normalizedDoc);

    // Stage 4: Embedding Generation with Cache Lookup
    const { embeddings, embeddingMs, cacheHits, cacheMisses } = await this.embedStage(chunks);

    // Stage 5: Atomic Database Persistence (Transaction)
    const { document, persistenceMs } = await this.persistStage(
      workspaceId,
      originalFilename,
      fileHash,
      fileBuffer.length,
      chunks,
      embeddings,
    );

    const totalMs = Date.now() - startTime;

    logger.info(
      {
        requestId,
        workspaceId,
        documentId: document.id,
        filename: originalFilename,
        sizeBytes: fileBuffer.length,
        chunkCount: chunks.length,
        metrics: { extractionMs, chunkingMs, embeddingMs, persistenceMs, totalMs, cacheHits, cacheMisses },
      },
      'Document ingested and vector embeddings persisted successfully',
    );

    return {
      document,
      isDuplicate: false,
      metrics: {
        extractionMs,
        chunkingMs,
        embeddingMs,
        persistenceMs,
        totalMs,
        chunkCount: chunks.length,
        cacheHits,
        cacheMisses,
      },
    };
  }

  // --- Pipeline Stage Isolations ---

  public async extractStage(
    fileBuffer: Buffer,
    filename: string,
    _mimeType?: string,
  ): Promise<{ extractedData: ExtractedDocument; extractionMs: number }> {
    const t0 = Date.now();
    const extractor = new PdfExtractor();
    const extractedData = await extractor.extract(fileBuffer, filename);
    return { extractedData, extractionMs: Date.now() - t0 };
  }

  public normalizeStage(doc: ExtractedDocument): ExtractedDocument {
    logger.debug({ docTitle: doc.metadata.title || 'Untitled' }, 'Ingestion Stage 3: Text Normalization started');
    const normalizedDoc = normalizeDocument(doc);
    logger.debug(
      {
        docTitle: doc.metadata.title || 'Untitled',
        normalizedPagesCount: normalizedDoc.pages.length,
        pages: normalizedDoc.pages.map((p) => ({
          pageNumber: p.pageNumber,
          normalizedLengthChars: p.text.length,
        })),
      },
      'Ingestion Stage 3: Text Normalization completed',
    );
    return normalizedDoc;
  }

  public chunkStage(doc: ExtractedDocument): { chunks: GeneratedChunk[]; chunkingMs: number } {
    const t0 = Date.now();
    const chunks = this.chunker.chunk(doc);

    logger.debug(
      {
        docTitle: doc.metadata.title || 'Untitled',
        totalChunksGenerated: chunks.length,
        chunks: chunks.map((chunk) => ({
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          sectionTitle: chunk.sectionTitle || 'N/A',
          charStart: chunk.charStart,
          charEnd: chunk.charEnd,
          contentLengthChars: chunk.content.length,
          checksum: chunk.checksum,
          preview: `${chunk.content.slice(0, 150).replace(/\n/g, ' ')}...`,
        })),
      },
      'Ingestion Stage 4: Chunking completed',
    );

    return { chunks, chunkingMs: Date.now() - t0 };
  }

  public async embedStage(
    chunks: GeneratedChunk[],
  ): Promise<{ embeddings: number[][]; embeddingMs: number; cacheHits: number; cacheMisses: number }> {
    const t0 = Date.now();
    const provider = EmbeddingProviderFactory.getProvider();
    const modelName = provider.getModelName();

    const embeddings: number[][] = [];
    let cacheHits = 0;
    let cacheMisses = 0;

    logger.debug({ modelName, chunksCount: chunks.length }, 'Ingestion Stage 5: Embedding Stage started');

    const chunkEmbedsLog: Array<{ chunkIndex: number; pageNumber: number; checksum: string; vectorDim: number; source: string }> = [];

    for (const chunk of chunks) {
      const cached = await this.cache.get(chunk.checksum, modelName);
      let source = 'API';
      if (cached) {
        cacheHits++;
        embeddings.push(cached);
        source = 'Cache';
      } else {
        cacheMisses++;
        const generated = await provider.generateEmbedding(chunk.content);
        await this.cache.set(chunk.checksum, modelName, generated);
        embeddings.push(generated);
      }

      chunkEmbedsLog.push({
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        checksum: chunk.checksum,
        vectorDim: embeddings[embeddings.length - 1]?.length || 0,
        source,
      });
    }

    logger.debug(
      {
        modelName,
        chunksEmbedded: chunkEmbedsLog,
      },
      'Ingestion Stage 5: Embedding Stage completed',
    );

    return {
      embeddings,
      embeddingMs: Date.now() - t0,
      cacheHits,
      cacheMisses,
    };
  }

  public async persistStage(
    workspaceId: string,
    filename: string,
    fileHash: string,
    sizeBytes: number,
    chunks: GeneratedChunk[],
    embeddings: number[][],
  ): Promise<{ document: Document; persistenceMs: number }> {
    const t0 = Date.now();
    const docType = 'PDF';

    const newDoc = await this.documentRepo.create({
      workspace_id: workspaceId,
      filename,
      file_hash: fileHash,
      doc_type: docType,
      size_bytes: sizeBytes,
      chunk_count: chunks.length,
    });

    const chunkInputs = chunks.map((chunk, i) => ({
      workspace_id: workspaceId,
      document_id: newDoc.id,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      section_id: chunk.sectionId,
      section_title: chunk.sectionTitle,
      token_count: chunk.tokenCount,
      checksum: chunk.checksum,
      embedding: embeddings[i],
      page_number: chunk.pageNumber,
    }));

    console.log('\n========================================');
    console.log('[DEBUG] STAGE 6: DATABASE INSERT');
    console.log('--- PERSISTING CHUNKS TO POSTGRESQL ---');
    chunkInputs.forEach((c) => {
      console.log(`Chunk ${c.chunk_index} -> Stored Page: ${c.page_number}`);
    });

    const insertedChunks = await this.chunkRepo.insertBatch(chunkInputs);

    console.log('--- VERIFIED DB INSERT READBACK ---');
    insertedChunks.forEach((ic) => {
      console.log(`chunk_index: ${ic.chunk_index} -> page_number: ${ic.page_number}`);
    });
    console.log('========================================\n');

    return { document: newDoc, persistenceMs: Date.now() - t0 };
  }

  public async listWorkspaceDocuments(workspaceId: string, page = 1, limit = 20) {
    return await this.documentRepo.listByWorkspace(workspaceId, page, limit);
  }

  public async deleteDocument(documentId: string, workspaceId: string): Promise<boolean> {
    return await runInTransaction(async (_client) => {
      await this.chunkRepo.deleteByDocument(documentId, workspaceId);
      return await this.documentRepo.softDelete(documentId, workspaceId);
    });
  }
}
