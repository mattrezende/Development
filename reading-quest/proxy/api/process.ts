import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractDocxText } from '../lib/extractDocx';
import { countWords, processFile, processText, type GeminiSection } from '../lib/gemini';

const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const CHUNK_WORD_LIMIT = 6000;

function chunkText(text: string, maxWords: number): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  const chunks: string[] = [];
  let current: string[] = [];
  let currentWords = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).length;
    if (currentWords + words > maxWords && current.length > 0) {
      chunks.push(current.join('\n\n'));
      current = [];
      currentWords = 0;
    }
    current.push(paragraph);
    currentWords += words;
  }
  if (current.length > 0) chunks.push(current.join('\n\n'));
  return chunks;
}

async function processLongText(text: string) {
  const chunks = chunkText(text, CHUNK_WORD_LIMIT);
  const allSections: GeminiSection[] = [];
  let title = '';

  for (const chunk of chunks) {
    const result = await processText(chunk);
    if (!title) title = result.title;
    allSections.push(...result.sections);
  }

  return { title, sections: allSections };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { mimeType, fileBase64, rawText } = req.body ?? {};

    let result: { title: string; sections: GeminiSection[] };

    if (mimeType === DOCX_MIME_TYPE && fileBase64) {
      const text = await extractDocxText(fileBase64);
      result = await processLongText(text);
    } else if (rawText) {
      result = await processLongText(rawText);
    } else if (fileBase64 && mimeType) {
      result = await processFile(mimeType, fileBase64);
    } else {
      res.status(400).json({ error: 'Envie fileBase64+mimeType ou rawText.' });
      return;
    }

    res.status(200).json({
      title: result.title,
      sections: result.sections,
      totalWords: countWords(result.sections),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
