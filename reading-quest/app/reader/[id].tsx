import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ReaderView } from '../../src/components/ReaderView';
import {
  getDocument,
  getSections,
  getStreak,
  getTotalWordsReadForDate,
  recordWordsRead,
  saveStreak,
} from '../../src/db/queries';
import type { DocumentRow, SectionRow } from '../../src/db/schema';
import { applyGoalMet, dailyTarget, todayString } from '../../src/services/pacing';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [document, setDocument] = useState<DocumentRow | null>(null);
  const [sections, setSections] = useState<SectionRow[]>([]);

  useEffect(() => {
    (async () => {
      const doc = await getDocument(db, id);
      setDocument(doc ?? null);
      navigation.setOptions({ title: doc?.title ?? '' });
      if (doc) setSections(await getSections(db, doc.id));
    })();
  }, [db, id, navigation]);

  async function handleSaveProgress(wordsReadDelta: number) {
    if (!document) return;
    const today = todayString();

    await recordWordsRead(db, document.id, today, wordsReadDelta);
    const updatedDocument = { ...document, wordsReadTotal: document.wordsReadTotal + wordsReadDelta };
    setDocument(updatedDocument);

    const target = dailyTarget(updatedDocument.totalWords, updatedDocument.wordsReadTotal, updatedDocument.deadline, today);
    const wordsToday = await getTotalWordsReadForDate(db, today);
    if (wordsToday >= target) {
      const streak = await getStreak(db);
      if (streak) await saveStreak(db, applyGoalMet(streak, today));
    }
  }

  if (!document) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ReaderView
      sections={sections}
      totalWords={document.totalWords}
      wordsReadTotal={document.wordsReadTotal}
      onSaveProgress={handleSaveProgress}
    />
  );
}
