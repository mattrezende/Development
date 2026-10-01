const API_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.7-flash';

const INSTRUCTION = `Você é um formatador de leitura. Extraia todo o conteúdo textual deste documento e reorganize em um formato de leitura limpo e padronizado.
Regras:
1. Ignore imagens, figuras, gráficos, tabelas e legendas — mantenha apenas o texto corrido (não descreva o que havia nelas).
2. Corrija apenas artefatos óbvios de OCR/quebras de linha indevidas, sem reescrever ou resumir o conteúdo original.
3. Preserve a estrutura em títulos de seção e parágrafos.
4. Responda estritamente no formato JSON pedido pelo schema.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          heading: { type: 'string' },
          paragraphs: { type: 'array', items: { type: 'string' } },
        },
        required: ['heading', 'paragraphs'],
      },
    },
  },
  required: ['title', 'sections'],
};

export interface GeminiSection {
  heading: string;
  paragraphs: string[];
}

export interface GeminiResult {
  title: string;
  sections: GeminiSection[];
}

type GeminiInput =
  | { type: 'text'; text: string }
  | { type: 'document'; mime_type: string; data: string }
  | { type: 'image'; mime_type: string; data: string };

function inputTypeForMimeType(mimeType: string): 'document' | 'image' {
  return mimeType.startsWith('image/') ? 'image' : 'document';
}

async function callGemini(input: GeminiInput[]): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no ambiente do proxy.');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      input,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  // A doc da Interactions API mostra `output_text`; validar contra a doc oficial ao integrar de verdade.
  const outputText = data.output_text ?? data.outputText;
  if (!outputText) throw new Error('Resposta do Gemini sem output_text.');

  return JSON.parse(outputText) as GeminiResult;
}

export function processFile(mimeType: string, base64: string): Promise<GeminiResult> {
  return callGemini([
    { type: inputTypeForMimeType(mimeType), mime_type: mimeType, data: base64 },
    { type: 'text', text: INSTRUCTION },
  ]);
}

export function processText(text: string): Promise<GeminiResult> {
  return callGemini([{ type: 'text', text: `${INSTRUCTION}\n\nTexto:\n${text}` }]);
}

export function countWords(sections: GeminiSection[]): number {
  return sections.reduce(
    (total, section) =>
      total + section.paragraphs.reduce((sum, p) => sum + p.trim().split(/\s+/).filter(Boolean).length, 0),
    0,
  );
}
