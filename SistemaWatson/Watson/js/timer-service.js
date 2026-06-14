import { state } from "./state.js";
import { sessaoAtual, avancarSessao } from "./ciclo.engine.js";
import { atualizarUI } from "./ui.controller.js";

export function iniciarTimer() {
  if (state.timerInterval) return;

  state.timerInterval = setInterval(() => {
    state.tempoSessao++;
    atualizarUI();
  }, 1000);
}

export function pararTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;

  const sessao = sessaoAtual();
  if (!sessao) return;

  if (sessao.tipo === "teoria") {
    const materia = state.ciclo.find(m => m.id === sessao.materiaId);
    materia.tempoExecutado += state.tempoSessao;
    localStorage.setItem("ciclo", JSON.stringify(state.ciclo));
  }

  state.tempoSessao = 0;

  avancarSessao();
  atualizarUI();
}