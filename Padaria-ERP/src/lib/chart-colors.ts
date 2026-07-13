// Paleta e-bakery: creme, espresso, terracota e azeitona.
export const chartColors = {
  // Terracota — acento principal para séries únicas (faturamento, ranking de produtos).
  seriesAccent: "#d0602e",
  // Azeitona/mostarda — usada na curva de produção para diferenciar do faturamento.
  seriesOlive: "#b39b3c",
  // Azul/vermelho mantidos para o par divergente entradas × saídas (fluxo de caixa),
  // onde a identidade semântica importa mais do que o tema visual.
  seriesBlue: "#2a78d6",
  seriesRed: "#e34948",
  textPrimary: "#2e2521",
  textSecondary: "#7a716a",
  textMuted: "#a49c92",
  gridline: "#e8ded0",
  baseline: "#d3c6b3",
  surface: "#ffffff",
  good: "#1f6b32",
  warning: "#7a4a1c",
  critical: "#c9432c",
} as const
