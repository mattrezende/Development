const PREFIX = "padaria_erp:"

function isBrowser() {
  return typeof window !== "undefined"
}

export function uuid(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function getTable<T>(key: string): T[] {
  if (!isBrowser()) return []
  const raw = window.localStorage.getItem(PREFIX + key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

export function setTable<T>(key: string, rows: T[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(PREFIX + key, JSON.stringify(rows))
}

export function seedIfEmpty<T>(key: string, seedRows: T[]): void {
  if (!isBrowser()) return
  const raw = window.localStorage.getItem(PREFIX + key)
  if (raw === null) {
    setTable(key, seedRows)
  }
}

export function clearAllTables(): void {
  if (!isBrowser()) return
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k))
}

// Pequeno atraso artificial para simular latência assíncrona (facilita a
// futura troca por chamadas reais ao Supabase, sem mudar quem consome).
export function asAsync<T>(value: T): Promise<T> {
  return Promise.resolve(value)
}
