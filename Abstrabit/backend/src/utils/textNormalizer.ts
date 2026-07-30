import crypto from 'crypto';
import { ExtractedDocument } from '../services/extractors/IDocumentExtractor';

export const normalizeText = (rawText: string): string => {
  return rawText
    .normalize('NFC')
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove invisible control characters (keep \n)
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces/tabs into single space
    .replace(/\n{3,}/g, '\n\n') // Collapse 3+ blank lines into 2
    .trim();
};

export const normalizeDocument = (document: ExtractedDocument): ExtractedDocument => {
  const normalizedPages = document.pages.map((page) => ({
    pageNumber: page.pageNumber,
    text: normalizeText(page.text),
  }));

  const totalWords = normalizedPages.reduce(
    (acc, p) => acc + (p.text.trim() ? p.text.trim().split(/\s+/).length : 0),
    0,
  );
  const totalChars = normalizedPages.reduce((acc, p) => acc + p.text.length, 0);

  return {
    pages: normalizedPages,
    metadata: {
      ...document.metadata,
      wordCount: totalWords,
      characterCount: totalChars,
      readingTimeMinutes: Math.max(1, Math.ceil(totalWords / 200)),
    },
  };
};

export const computeSha256 = (bufferOrString: Buffer | string): string => {
  return crypto.createHash('sha256').update(bufferOrString).digest('hex');
};
