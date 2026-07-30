import pdfParse from 'pdf-parse';
import { IDocumentExtractor, ExtractedDocument, ExtractedPage } from './IDocumentExtractor';
import { ExtractionError } from '../../errors/IngestionErrors';
import { logger } from '../../utils/logger';

export class PdfExtractor implements IDocumentExtractor {
  public async extract(fileBuffer: Buffer, filename: string): Promise<ExtractedDocument> {
    try {
      const parseFunction = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default || pdfParse;
      const extractedPages: ExtractedPage[] = [];

      const options = {
        pagerender: async (pageData: any): Promise<string> => {
          const textContent = await pageData.getTextContent();
          let lastY: number | undefined;
          let text = '';
          for (const item of textContent.items) {
            if (lastY === item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }

          const pageNumber = pageData.pageIndex + 1; // 1-indexed page number
          extractedPages.push({
            pageNumber,
            text,
          });

          return text;
        },
      };

      const data = await parseFunction(fileBuffer, options);

      // Ensure pages are ordered by pageNumber
      extractedPages.sort((a, b) => a.pageNumber - b.pageNumber);

      const totalCharacters = extractedPages.reduce((acc, p) => acc + p.text.length, 0);
      const totalWords = extractedPages.reduce(
        (acc, p) => acc + (p.text.trim() ? p.text.trim().split(/\s+/).length : 0),
        0,
      );
      const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

      logger.debug(
        {
          filename,
          pageCount: extractedPages.length,
          totalCharacters,
          totalWords,
        },
        'PDF extraction completed',
      );

      return {
        pages: extractedPages,
        metadata: {
          pageCount: data.numpages || extractedPages.length || 1,
          title: data.info?.Title || filename.replace(/\.[^/.]+$/, ''),
          author: data.info?.Author,
          language: 'en',
          wordCount: totalWords,
          characterCount: totalCharacters,
          readingTimeMinutes,
          info: data.info,
        },
      };
    } catch (err) {
      throw new ExtractionError('Failed to parse PDF document content', err);
    }
  }
}
