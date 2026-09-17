import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyGoalCard } from '../../src/components/DailyGoalCard';
import { getDocuments, getStreak, getTotalWordsReadForDate, saveStreak } from '../../src/db/queries';
import { checkStreakBreak, dailyTarget, todayString } from '../../src/services/pacing';

export default function ProgressScreen() {
  const db = useSQLiteContext();
  const [target, setTarget] = useState(0);
  const [wordsReadToday, setWordsReadToday] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        const today = todayString();
        const documents = await getDocuments(db);
        const activeDocs = documents.filter((d) => d.status === 'ready' && d.wordsReadTotal < d.totalWords);
        const totalTarget = activeDocs.reduce(
          (sum, doc) => sum + dailyTarget(doc.totalWords, doc.wordsReadTotal, doc.deadline, today),
          0,
        );
        const wordsToday = await getTotalWordsReadForDate(db, today);

        let streak = await getStreak(db);
        if (streak) {
          const updated = checkStreakBreak(streak, today);
          if (updated.currentStreak !== streak.currentStreak) {
            await saveStreak(db, updated);
          }
          streak = { ...streak, ...updated };
        }

        if (!cancelled) {
          setTarget(totalTarget);
          setWordsReadToday(wordsToday);
          setCurrentStreak(streak?.currentStreak ?? 0);
          setLongestStreak(streak?.longestStreak ?? 0);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progresso</Text>
        <DailyGoalCard target={target} wordsReadToday={wordsReadToday} currentStreak={currentStreak} />
        <View style={styles.longestCard}>
          <Text style={styles.longestLabel}>Melhor sequência</Text>
          <Text style={styles.longestValue}>{longestStreak} dias</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F4' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#1F2A24', marginBottom: 4 },
  longestCard: { backgroundColor: 'white', borderRadius: 16, padding: 16 },
  longestLabel: { fontSize: 14, color: '#5B6660', fontWeight: '600' },
  longestValue: { fontSize: 22, fontWeight: '700', marginTop: 6, color: '#1F2A24' },
});
