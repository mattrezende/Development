import mammoth from 'mammoth';

export async function extractDocxText(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}
