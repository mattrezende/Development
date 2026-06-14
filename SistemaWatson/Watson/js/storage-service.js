export function salvarCiclo(ciclo) {
  localStorage.setItem("ciclo", JSON.stringify(ciclo));
}

export function salvarIndice(indice) {
  localStorage.setItem("indiceAtual", indice);
}

export function carregarIndice() {
  return Number(localStorage.getItem("indiceAtual")) || 0;
}