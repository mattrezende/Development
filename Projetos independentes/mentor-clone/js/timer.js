let ciclo = JSON.parse(localStorage.getItem("ciclo")) || [];
const select = document.getElementById("materiaSelect");

ciclo.forEach(item => {
  const opt = document.createElement("option");
  opt.value = item.id;
  opt.textContent = item.materia;
  select.appendChild(opt);
});

let segundos = 0;
let intervalo = null;

function atualizarTela() {
  const min = String(Math.floor(segundos / 60)).padStart(2, "0");
  const sec = String(segundos % 60).padStart(2, "0");
  document.getElementById("timer").innerText = `${min}:${sec}`;
}

function iniciar() {
  if (intervalo) return;
  intervalo = setInterval(() => {
    segundos++;
    atualizarTela();
  }, 1000);
}

function pausar() {
  clearInterval(intervalo);
  intervalo = null;
}

function finalizar() {
  pausar();

  const id = Number(select.value);
  const item = ciclo.find(m => m.id === id);
  item.tempoExecutado += segundos;

  localStorage.setItem("ciclo", JSON.stringify(ciclo));

  segundos = 0;
  atualizarTela();

  alert("Tempo registrado no ciclo!");
}
