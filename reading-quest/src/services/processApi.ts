export interface ProcessedSection {
  heading: string;
  paragraphs: string[];
}

export interface ProcessedDocument {
  title: string;
  sections: ProcessedSection[];
  totalWords: number;
}

export interface ProcessRequest {
  mimeType: string;
  fileBase64?: string;
  rawText?: string;
}

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL;

export async function processDocument(request: ProcessRequest): Promise<ProcessedDocument> {
  if (!PROXY_URL) {
    throw new Error(
      'EXPO_PUBLIC_PROXY_URL não configurado. Defina no .env apontando para o proxy serverless.',
    );
  }

  const response = await fetch(`${PROXY_URL}/api/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Falha ao processar documento (${response.status}): ${text}`);
  }

  return response.json();
}
