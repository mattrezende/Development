import { state } from "./state.js";
import { gerarFilaHibrida } from "./queue.builder.js";

export function inicializarCiclo() {
  state.fila = gerarFilaHibrida(state.ciclo, state.cards);
  state.indiceAtual = 0;
}

export function sessaoAtual() {
  if (!state.fila.length) return null;
  return state.fila[state.indiceAtual];
}

export function avancarSessao() {
  state.indiceAtual++;

  if (state.indiceAtual >= state.fila.length) {
    inicializarCiclo(); // recalcula completamente
  }
}