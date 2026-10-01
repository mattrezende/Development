import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDocuments } from '../../src/db/queries';
import type { DocumentRow } from '../../src/db/schema';

export default function LibraryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  const reload = useCallback(async () => {
    setDocuments(await getDocuments(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(reload, 3000);
    return () => clearInterval(interval);
  }, [documents, reload]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Sua biblioteca</Text>
        <Link href="/add-document" asChild>
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Novo</Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum documento ainda. Toque em "+ Novo" para importar um PDF, imagem, DOCX ou texto.
          </Text>
        }
        renderItem={({ item }) => {
          const progress = item.totalWords > 0 ? item.wordsReadTotal / item.totalWords : 0;
          return (
            <Pressable
              style={styles.card}
              disabled={item.status !== 'ready'}
              onPress={() => router.push(`/reader/${item.id}`)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.status === 'processing' && 'Processando...'}
                {item.status === 'error' && 'Erro ao processar. Toque para reimportar.'}
                {item.status === 'ready' &&
                  `${Math.round(progress * 100)}% lido · prazo ${item.deadline}`}
              </Text>
              {item.status === 'ready' ? (
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F4' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1F2A24' },
  addButton: { backgroundColor: '#2E7D5B', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: 'white', fontWeight: '600' },
  list: { padding: 20, gap: 12 },
  empty: { color: '#5B6660', marginTop: 40, textAlign: 'center' },
  card: { backgroundColor: 'white', borderRadius: 14, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1F2A24' },
  cardMeta: { fontSize: 13, color: '#5B6660', marginTop: 4 },
  barTrack: { marginTop: 10, height: 6, borderRadius: 3, backgroundColor: '#E7EEE9', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#2E7D5B' },
});
