import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrateDbIfNeeded } from '../src/db/schema';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="reading-quest.db" onInit={migrateDbIfNeeded}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-document"
            options={{ presentation: 'modal', title: 'Novo documento' }}
          />
          <Stack.Screen name="reader/[id]" options={{ title: '' }} />
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
