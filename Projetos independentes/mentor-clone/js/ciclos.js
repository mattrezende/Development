let ciclo = JSON.parse(localStorage.getItem("ciclo")) || [];

function salvar() {
  localStorage.setItem("ciclo", JSON.stringify(ciclo));
}

function adicionarMateria() {
  const materia = document.getElementById("materia").value;
  const peso = Number(document.getElementById("peso").value);
  const tempo = Number(document.getElementById("tempo").value);

  if (!materia || !peso || !tempo) return alert("Preencha tudo");

  ciclo.push({
    id: Date.now(),
    materia,
    peso,
    tempoPlanejado: tempo * 60,
    tempoExecutado: 0
  });

  salvar();
  renderizar();
}

function renderizar() {
  const container = document.getElementById("ciclo-container");
  container.innerHTML = "";

  ciclo.forEach(item => {
    const div = document.createElement("div");
    div.className = "ciclo-bloco";

    const progresso = Math.min(
      (item.tempoExecutado / item.tempoPlanejado) * 100,
      100
    );

    div.innerHTML = `
      <h3>${item.materia}</h3>
      <p>Peso: ${"★".repeat(item.peso)}</p>
      <p>Planejado: ${item.tempoPlanejado / 60} min</p>
      <p>Executado: ${Math.floor(item.tempoExecutado / 60)} min</p>
      <progress value="${item.tempoExecutado}" max="${item.tempoPlanejado}"></progress>
      <p>${progresso.toFixed(0)}%</p>
    `;

    container.appendChild(div);
  });
}

renderizar();
