export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export function todayString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function previousDayString(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return todayString(d);
}

/**
 * Meta diária recalculada a cada dia: palavras que faltam / dias que faltam até o prazo.
 * Se o prazo já passou ou é hoje, joga tudo o que resta para hoje.
 */
export function dailyTarget(
  totalWords: number,
  wordsReadTotal: number,
  deadline: string,
  today: string = todayString(),
): number {
  const remainingWords = Math.max(0, totalWords - wordsReadTotal);
  if (remainingWords === 0) return 0;

  const remainingDays = Math.max(1, daysBetween(today, deadline) + 1);
  return Math.ceil(remainingWords / remainingDays);
}

export function sumProgressForDate(
  rows: Array<{ date: string; wordsRead: number }>,
  date: string,
): number {
  return rows.filter((r) => r.date === date).reduce((acc, r) => acc + r.wordsRead, 0);
}

/**
 * Chamar sempre que o usuário registrar palavras lidas hoje.
 * Só incrementa o streak uma vez por dia, mesmo com múltiplas leituras.
 */
export function applyGoalMet(state: StreakState, today: string): StreakState {
  if (state.lastCompletedDate === today) return state;

  const wasYesterday = state.lastCompletedDate === previousDayString(today);
  const newStreak = wasYesterday ? state.currentStreak + 1 : 1;

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastCompletedDate: today,
  };
}

/**
 * Chamar ao abrir o app: se passou mais de um dia sem bater a meta, zera o streak atual.
 */
export function checkStreakBreak(state: StreakState, today: string): StreakState {
  if (!state.lastCompletedDate) return state;
  if (state.lastCompletedDate === today) return state;
  if (state.lastCompletedDate === previousDayString(today)) return state;

  return { ...state, currentStreak: 0 };
}
