export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  pages: ExtractedPage[];
  metadata: {
    pageCount: number;
    title?: string;
    author?: string;
    language?: string;
    wordCount: number;
    characterCount: number;
    readingTimeMinutes: number;
    info?: Record<string, unknown>;
  };
}

export interface IDocumentExtractor {
  extract(fileBuffer: Buffer, filename: string): Promise<ExtractedDocument>;
}

// Future-Ready OCR Extractor Interface abstraction
export interface IOcrExtractor extends IDocumentExtractor {
  supportsOcr(mimeType: string): boolean;
  extractWithOcr(fileBuffer: Buffer, mimeType: string): Promise<ExtractedDocument>;
}
