export function contarCardsMateria(cards, materiaId) {
  return cards.filter(c => c.materiaId === materiaId).length;
}

export function contarAtrasados(cards, materiaId) {
  const agora = Date.now();

  return cards.filter(c =>
    c.materiaId === materiaId &&
    c.nextReview <= agora
  ).length;
}