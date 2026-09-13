import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

export interface PickedFile {
  name: string;
  mimeType: string;
  base64: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function pickDocumentFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ALLOWED_TYPES,
    multiple: false,
    copyToCacheDirectory: true,
    base64: Platform.OS === 'web',
  });

  if (result.canceled || !result.assets || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? 'application/octet-stream';

  const base64 = asset.base64 ?? (await new File(asset.uri).base64());

  return { name: asset.name, mimeType, base64 };
}
