import { contarCardsMateria, contarAtrasados } from "./flashcard.service.js";

export function calcularProporcao(materia, cards) {
  const total = contarCardsMateria(cards, materia.id);
  const atrasados = contarAtrasados(cards, materia.id);

  if (total === 0) {
    return { revisao: 0, teoria: 1 };
  }

  const taxa = atrasados / total;

  const proporcaoRevisao = Math.min(taxa * 2, 1);
  const proporcaoTeoria = 1 - proporcaoRevisao;

  return {
    revisao: proporcaoRevisao,
    teoria: proporcaoTeoria
  };
}