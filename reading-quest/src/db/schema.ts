import type { SQLiteDatabase } from 'expo-sqlite';

export type DocumentStatus = 'processing' | 'ready' | 'error';

export interface DocumentRow {
  id: string;
  title: string;
  createdAt: string;
  deadline: string;
  totalWords: number;
  wordsReadTotal: number;
  status: DocumentStatus;
}

export interface SectionRow {
  id: number;
  documentId: string;
  orderIndex: number;
  heading: string;
  content: string;
}

export interface ProgressRow {
  id: number;
  documentId: string;
  date: string;
  wordsRead: number;
}

export interface StreakRow {
  id: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

const SCHEMA_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;
  if (currentVersion >= SCHEMA_VERSION) return;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      deadline TEXT NOT NULL,
      totalWords INTEGER NOT NULL DEFAULT 0,
      wordsReadTotal INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'processing'
    );

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId TEXT NOT NULL,
      orderIndex INTEGER NOT NULL,
      heading TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId TEXT NOT NULL,
      date TEXT NOT NULL,
      wordsRead INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS streak (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      currentStreak INTEGER NOT NULL DEFAULT 0,
      longestStreak INTEGER NOT NULL DEFAULT 0,
      lastCompletedDate TEXT
    );

    INSERT OR IGNORE INTO streak (id, currentStreak, longestStreak, lastCompletedDate)
    VALUES (1, 0, 0, NULL);

    PRAGMA user_version = ${SCHEMA_VERSION};
  `);
}
