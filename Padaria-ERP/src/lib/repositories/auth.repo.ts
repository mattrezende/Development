// Autenticação local mock — sem backend real. Serve apenas para ter a tela de
// login pedida e travar o acesso ao painel. Será substituída por Supabase Auth
// (login único, sem cadastro público) quando o projeto for para produção.

const SESSION_KEY = "padaria_erp:session"

function isBrowser() {
  return typeof window !== "undefined"
}

export interface Session {
  email: string
  loginAt: string
}

function getExpectedCredentials() {
  return {
    email: process.env.NEXT_PUBLIC_APP_USER ?? "admin@padaria.com",
    password: process.env.NEXT_PUBLIC_APP_PASSWORD ?? "padaria123",
  }
}

async function login(email: string, password: string): Promise<Session> {
  const expected = getExpectedCredentials()
  if (email.trim().toLowerCase() !== expected.email.toLowerCase() || password !== expected.password) {
    throw new Error("E-mail ou senha inválidos")
  }
  const session: Session = { email: expected.email, loginAt: new Date().toISOString() }
  if (isBrowser()) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  return session
}

function logout(): void {
  if (isBrowser()) {
    window.localStorage.removeItem(SESSION_KEY)
  }
}

function getSession(): Session | null {
  if (!isBrowser()) return null
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export const authRepo = { login, logout, getSession }
