export const state = {
  ciclo: JSON.parse(localStorage.getItem("ciclo")) || [],
  cards: JSON.parse(localStorage.getItem("cards")) || [],
  fila: [],
  indiceAtual: 0,
  tempoSessao: 0,
  timerInterval: null
};