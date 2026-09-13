import { StyleSheet, Text, View } from 'react-native';

interface Props {
  target: number;
  wordsReadToday: number;
  currentStreak: number;
}

export function DailyGoalCard({ target, wordsReadToday, currentStreak }: Props) {
  const progress = target > 0 ? Math.min(1, wordsReadToday / target) : 1;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Meta de hoje</Text>
        <Text style={styles.streak}>🔥 {currentStreak}</Text>
      </View>
      <Text style={styles.words}>
        {wordsReadToday} / {target} palavras
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, color: '#5B6660', fontWeight: '600' },
  streak: { fontSize: 16, fontWeight: '700' },
  words: { fontSize: 22, fontWeight: '700', marginTop: 8, color: '#1F2A24' },
  barTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E7EEE9',
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#2E7D5B' },
});
