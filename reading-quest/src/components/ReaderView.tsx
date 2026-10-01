import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SectionRow } from '../db/schema';

interface Props {
  sections: SectionRow[];
  totalWords: number;
  wordsReadTotal: number;
  onSaveProgress: (wordsReadDelta: number) => void;
}

export function ReaderView({ sections, totalWords, wordsReadTotal, onSaveProgress }: Props) {
  const maxScrollFraction = useRef(totalWords > 0 ? wordsReadTotal / totalWords : 0);
  const [canSave, setCanSave] = useState(false);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    const fraction = scrollable > 0 ? contentOffset.y / scrollable : 1;

    if (fraction > maxScrollFraction.current) {
      maxScrollFraction.current = Math.min(1, fraction);
      setCanSave(true);
    }
  }

  function handleSave() {
    const wordsAtPosition = Math.round(maxScrollFraction.current * totalWords);
    const delta = wordsAtPosition - wordsReadTotal;
    if (delta > 0) onSaveProgress(delta);
    setCanSave(false);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            {section.heading ? <Text style={styles.heading}>{section.heading}</Text> : null}
            {section.content.split('\n\n').map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
      {canSave ? (
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar progresso de hoje</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F4' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 28 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#1F2A24' },
  paragraph: {
    fontSize: 17,
    lineHeight: 27,
    marginBottom: 14,
    color: '#2B332E',
    fontFamily: 'serif',
  },
  saveButton: {
    backgroundColor: '#2E7D5B',
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontWeight: '600', fontSize: 15 },
});
