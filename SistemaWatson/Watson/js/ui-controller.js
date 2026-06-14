import { state } from "./state.js";
import { sessaoAtual } from "./ciclo.engine.js";

export function atualizarUI() {
  const materiaDiv = document.getElementById("materia-atual");
  const tipoDiv = document.getElementById("tipo-sessao");
  const timerDiv = document.getElementById("timer");

  const sessao = sessaoAtual();

  if (!sessao) {
    materiaDiv.innerText = "Sem matérias cadastradas";
    return;
  }

  const materia = state.ciclo.find(m => m.id === sessao.materiaId);

  materiaDiv.innerText = materia.nome;
  tipoDiv.innerText = sessao.tipo === "revisao"
    ? "Modo: Revisão"
    : "Modo: Teoria";

  const min = String(Math.floor(state.tempoSessao / 60)).padStart(2, "0");
  const sec = String(state.tempoSessao % 60).padStart(2, "0");

  timerDiv.innerText = `${min}:${sec}`;
}