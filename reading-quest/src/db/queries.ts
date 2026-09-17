import type { SQLiteDatabase } from 'expo-sqlite';
import type { DocumentRow, ProgressRow, SectionRow, StreakRow } from './schema';
import type { ProcessedDocument } from '../services/processApi';

export async function insertDocument(
  db: SQLiteDatabase,
  params: { id: string; title: string; deadline: string },
) {
  await db.runAsync(
    `INSERT INTO documents (id, title, createdAt, deadline, totalWords, wordsReadTotal, status)
     VALUES (?, ?, ?, ?, 0, 0, 'processing')`,
    params.id,
    params.title,
    new Date().toISOString(),
    params.deadline,
  );
}

export async function saveProcessedDocument(
  db: SQLiteDatabase,
  documentId: string,
  processed: ProcessedDocument,
) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE documents SET title = ?, totalWords = ?, status = 'ready' WHERE id = ?`,
      processed.title,
      processed.totalWords,
      documentId,
    );
    await db.runAsync(`DELETE FROM sections WHERE documentId = ?`, documentId);
    for (let i = 0; i < processed.sections.length; i++) {
      const section = processed.sections[i];
      await db.runAsync(
        `INSERT INTO sections (documentId, orderIndex, heading, content) VALUES (?, ?, ?, ?)`,
        documentId,
        i,
        section.heading,
        section.paragraphs.join('\n\n'),
      );
    }
  });
}

export async function markDocumentError(db: SQLiteDatabase, documentId: string) {
  await db.runAsync(`UPDATE documents SET status = 'error' WHERE id = ?`, documentId);
}

export function getDocuments(db: SQLiteDatabase) {
  return db.getAllAsync<DocumentRow>(`SELECT * FROM documents ORDER BY createdAt DESC`);
}

export function getDocument(db: SQLiteDatabase, id: string) {
  return db.getFirstAsync<DocumentRow>(`SELECT * FROM documents WHERE id = ?`, id);
}

export function getSections(db: SQLiteDatabase, documentId: string) {
  return db.getAllAsync<SectionRow>(
    `SELECT * FROM sections WHERE documentId = ? ORDER BY orderIndex ASC`,
    documentId,
  );
}

export function getProgressForDocument(db: SQLiteDatabase, documentId: string) {
  return db.getAllAsync<ProgressRow>(
    `SELECT * FROM progress WHERE documentId = ? ORDER BY date ASC`,
    documentId,
  );
}

export async function recordWordsRead(
  db: SQLiteDatabase,
  documentId: string,
  date: string,
  words: number,
) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO progress (documentId, date, wordsRead) VALUES (?, ?, ?)`,
      documentId,
      date,
      words,
    );
    await db.runAsync(
      `UPDATE documents SET wordsReadTotal = wordsReadTotal + ? WHERE id = ?`,
      words,
      documentId,
    );
  });
}

export async function getTotalWordsReadForDate(db: SQLiteDatabase, date: string) {
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT SUM(wordsRead) as total FROM progress WHERE date = ?`,
    date,
  );
  return row?.total ?? 0;
}

export function getStreak(db: SQLiteDatabase) {
  return db.getFirstAsync<StreakRow>(`SELECT * FROM streak WHERE id = 1`);
}

export async function saveStreak(
  db: SQLiteDatabase,
  state: { currentStreak: number; longestStreak: number; lastCompletedDate: string | null },
) {
  await db.runAsync(
    `UPDATE streak SET currentStreak = ?, longestStreak = ?, lastCompletedDate = ? WHERE id = 1`,
    state.currentStreak,
    state.longestStreak,
    state.lastCompletedDate,
  );
}
