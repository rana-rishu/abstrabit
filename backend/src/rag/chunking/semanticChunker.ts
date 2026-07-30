import { computeSha256 } from '../../utils/textNormalizer';
import { ExtractedDocument } from '../../services/extractors/IDocumentExtractor';
import { RAG_CONFIG } from '../../constants/rag.constants';

export interface GeneratedChunk {
  chunkIndex: number;
  pageNumber: number;
  sectionId?: string;
  sectionTitle?: string;
  content: string;
  checksum: string;
  tokenCount: number;
  charStart: number;
  charEnd: number;
}

export interface ChunkOptions {
  targetChunkSize?: number; // ~500 chars (approx 125 tokens)
  overlapSize?: number;     // ~50 chars (approx 12 tokens)
}

export class SemanticChunker {
  private targetSize: number;
  private overlap: number;

  constructor(options?: ChunkOptions) {
    this.targetSize = options?.targetChunkSize || RAG_CONFIG.CHUNK_SIZE;
    this.overlap = options?.overlapSize || RAG_CONFIG.CHUNK_OVERLAP;
  }

  public chunk(document: ExtractedDocument): GeneratedChunk[] {
    if (!document || !document.pages || document.pages.length === 0) {
      return [];
    }

    const allChunks: GeneratedChunk[] = [];
    let globalChunkIndex = 0;

    for (const page of document.pages) {
      const pageText = page.text;
      if (!pageText || pageText.trim() === '') {
        continue;
      }

      const blocks = this.splitStructuralBlocks(pageText);
      let currentBuffer = '';
      let currentSectionTitle = 'General';
      let currentSectionId: string | undefined = undefined;
      let currentStartPos = 0;

      for (const block of blocks) {
        const trimmed = block.content.trim();
        if (!trimmed) continue;

        if (block.sectionTitle) {
          currentSectionTitle = block.sectionTitle;
        }
        if (block.sectionId) {
          currentSectionId = block.sectionId;
        }

        if (currentBuffer.length + trimmed.length + 2 <= this.targetSize || block.isAtomic) {
          if (currentBuffer.length > 0 && block.isAtomic && currentBuffer.length + trimmed.length > this.targetSize) {
            const charEnd = currentStartPos + currentBuffer.length;
            allChunks.push(
              this.createChunkObject(
                globalChunkIndex++,
                page.pageNumber,
                currentBuffer,
                currentSectionTitle,
                currentSectionId,
                currentStartPos,
                charEnd,
              ),
            );
            currentStartPos = charEnd;
            currentBuffer = trimmed;
          } else {
            currentBuffer += (currentBuffer ? '\n\n' : '') + trimmed;
          }
        } else {
          if (currentBuffer.length > 0) {
            const charEnd = currentStartPos + currentBuffer.length;
            allChunks.push(
              this.createChunkObject(
                globalChunkIndex++,
                page.pageNumber,
                currentBuffer,
                currentSectionTitle,
                currentSectionId,
                currentStartPos,
                charEnd,
              ),
            );

            const overlapTail = currentBuffer.slice(-this.overlap);
            currentStartPos = Math.max(0, charEnd - this.overlap);
            currentBuffer = overlapTail + '\n\n' + trimmed;
          } else {
            currentBuffer = trimmed;
          }
        }
      }

      if (currentBuffer.trim().length > 0) {
        const charEnd = currentStartPos + currentBuffer.length;
        allChunks.push(
          this.createChunkObject(
            globalChunkIndex++,
            page.pageNumber,
            currentBuffer,
            currentSectionTitle,
            currentSectionId,
            currentStartPos,
            charEnd,
          ),
        );
      }
    }

    return allChunks;
  }

  private splitStructuralBlocks(text: string): Array<{
    content: string;
    sectionId?: string;
    sectionTitle?: string;
    isAtomic: boolean;
  }> {
    const results: Array<{ content: string; sectionId?: string; sectionTitle?: string; isAtomic: boolean }> = [];
    const lines = text.split('\n');

    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];
    let currentHeading = 'General';
    let currentSectionId: string | undefined = undefined;
    let paragraphBuffer: string[] = [];

    const flushParagraph = () => {
      if (paragraphBuffer.length > 0) {
        const content = paragraphBuffer.join('\n').trim();
        if (content) {
          const isTable = content.startsWith('|') && content.includes('|');
          results.push({ content, sectionId: currentSectionId, sectionTitle: currentHeading, isAtomic: isTable });
        }
        paragraphBuffer = [];
      }
    };

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          codeBlockBuffer.push(line);
          results.push({
            content: codeBlockBuffer.join('\n'),
            sectionId: currentSectionId,
            sectionTitle: currentHeading,
            isAtomic: true,
          });
          codeBlockBuffer = [];
          inCodeBlock = false;
        } else {
          flushParagraph();
          inCodeBlock = true;
          codeBlockBuffer.push(line);
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        continue;
      }

      const headingMatch = line.match(/^(#{1,6})\s*(?:(\d+(?:\.\d+)*)\s+)?(.+)$/);
      if (headingMatch) {
        flushParagraph();
        currentSectionId = headingMatch[2] ? headingMatch[2].trim() : undefined;
        currentHeading = headingMatch[3].trim();
        paragraphBuffer.push(line);
        continue;
      }

      if (line.trim() === '') {
        flushParagraph();
      } else {
        paragraphBuffer.push(line);
      }
    }

    if (inCodeBlock && codeBlockBuffer.length > 0) {
      results.push({
        content: codeBlockBuffer.join('\n'),
        sectionId: currentSectionId,
        sectionTitle: currentHeading,
        isAtomic: true,
      });
    } else {
      flushParagraph();
    }

    return results;
  }

  private createChunkObject(
    index: number,
    pageNumber: number,
    content: string,
    sectionTitle: string,
    sectionId: string | undefined,
    charStart: number,
    charEnd: number,
  ): GeneratedChunk {
    const trimmed = content.trim();
    const approxTokens = Math.max(1, Math.ceil(trimmed.length / 4));
    return {
      chunkIndex: index,
      pageNumber,
      sectionId,
      sectionTitle,
      content: trimmed,
      charStart,
      charEnd,
      tokenCount: approxTokens,
      checksum: computeSha256(trimmed),
    };
  }
}
