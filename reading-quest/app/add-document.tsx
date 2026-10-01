import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { insertDocument, markDocumentError, saveProcessedDocument } from '../src/db/queries';
import { pickDocumentFile, type PickedFile } from '../src/services/importPicker';
import { processDocument } from '../src/services/processApi';

export default function AddDocumentScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [rawText, setRawText] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handlePickFile() {
    try {
      const file = await pickDocumentFile();
      if (!file) return;
      setPickedFile(file);
      setRawText('');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    } catch (error) {
      Alert.alert('Erro ao selecionar arquivo', String(error));
    }
  }

  function isValidDeadline(value: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  async function handleSubmit() {
    if (!pickedFile && !rawText.trim()) {
      Alert.alert('Adicione um arquivo ou cole um texto.');
      return;
    }
    if (!isValidDeadline(deadline)) {
      Alert.alert('Informe o prazo no formato AAAA-MM-DD.');
      return;
    }

    const finalTitle = title.trim() || 'Novo documento';
    const documentId = Crypto.randomUUID();

    setSubmitting(true);
    try {
      await insertDocument(db, { id: documentId, title: finalTitle, deadline });
      router.back();

      const processed = await processDocument(
        pickedFile
          ? { mimeType: pickedFile.mimeType, fileBase64: pickedFile.base64 }
          : { mimeType: 'text/plain', rawText: rawText.trim() },
      );

      await saveProcessedDocument(db, documentId, processed);
    } catch (error) {
      await markDocumentError(db, documentId);
      Alert.alert('Falha ao processar documento', String(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Sapiens"
        />

        <Text style={styles.label}>Arquivo (PDF, PNG, JPEG ou DOCX)</Text>
        <Pressable style={styles.pickButton} onPress={handlePickFile}>
          <Text style={styles.pickButtonText}>
            {pickedFile ? pickedFile.name : 'Escolher arquivo'}
          </Text>
        </Pressable>

        <Text style={styles.orText}>ou cole o texto abaixo</Text>
        <TextInput
          style={styles.textArea}
          value={rawText}
          onChangeText={(value) => {
            setRawText(value);
            if (value) setPickedFile(null);
          }}
          placeholder="Cole aqui o texto que deseja ler..."
          multiline
          editable={!pickedFile}
        />

        <Text style={styles.label}>Prazo final para terminar a leitura</Text>
        <TextInput
          style={styles.input}
          value={deadline}
          onChangeText={setDeadline}
          placeholder="AAAA-MM-DD"
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Importar e reformatar</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F4' },
  content: { padding: 20, gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#1F2A24', marginTop: 16 },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 6,
  },
  pickButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D7E0DA',
    borderStyle: 'dashed',
  },
  pickButtonText: { color: '#2E7D5B', fontWeight: '600', textAlign: 'center' },
  orText: { textAlign: 'center', color: '#5B6660', marginTop: 12, marginBottom: 4 },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2E7D5B',
    borderRadius: 10,
    padding: 16,
    marginTop: 28,
    alignItems: 'center',
  },
  submitButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
