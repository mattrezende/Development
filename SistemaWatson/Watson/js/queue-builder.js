import { calcularProporcao } from "./priority.service.js";

export function gerarFilaHibrida(ciclo, cards) {
  let blocos = [];

  ciclo.forEach(materia => {

    const proporcao = calcularProporcao(materia, cards);

    const totalBlocos = materia.peso;

    const blocosRevisao = Math.round(totalBlocos * proporcao.revisao);
    const blocosTeoria = totalBlocos - blocosRevisao;

    for (let i = 0; i < blocosRevisao; i++) {
      blocos.push({ tipo: "revisao", materiaId: materia.id });
    }

    for (let i = 0; i < blocosTeoria; i++) {
      blocos.push({ tipo: "teoria", materiaId: materia.id });
    }

  });

  return distribuirSuavemente(blocos);
}

function distribuirSuavemente(lista) {
  const resultado = [];
  const grupos = {};

  lista.forEach(item => {
    if (!grupos[item.materiaId]) {
      grupos[item.materiaId] = [];
    }
    grupos[item.materiaId].push(item);
  });

  let adicionou = true;

  while (adicionou) {
    adicionou = false;

    for (let materiaId in grupos) {
      if (grupos[materiaId].length > 0) {
        resultado.push(grupos[materiaId].shift());
        adicionou = true;
      }
    }
  }

  return resultado;
}