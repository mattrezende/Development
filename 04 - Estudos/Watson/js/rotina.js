const blocks = document.querySelectorAll('.time-block');
const header = document.querySelector('.content-header');

const STORAGE_KEY = 'rotina-semanal';

/* ---------- UTIL ---------- */
function getBlockData(block) {
  const day = block.closest('.day').dataset.day;
  const time = block.querySelector('.time').textContent;
  const label = block.querySelector('.label').textContent;
  const hours = Number(block.dataset.hours);
  const active = block.classList.contains('active');

  return { day, time, label, hours, active };
}

/* ---------- SALVAR ---------- */
function saveRoutine() {
  const data = Array.from(blocks).map(getBlockData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ---------- CARREGAR ---------- */
function loadRoutine() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!saved) return;

  blocks.forEach(block => {
    const day = block.closest('.day').dataset.day;
    const time = block.querySelector('.time').textContent;

    const match = saved.find(
      item => item.day === day && item.time === time
    );

    if (match) {
      block.querySelector('.label').textContent = match.label;
      block.classList.toggle('active', match.active);
    }
  });
}

/* ---------- TOTAL DE HORAS ---------- */
function updateTotalHours() {
  let total = 0;

  blocks.forEach(block => {
    if (block.classList.contains('active')) {
      total += Number(block.dataset.hours);
    }
  });

  let counter = document.querySelector('.total-hours');

  if (!counter) {
    counter = document.createElement('p');
    counter.classList.add('total-hours');
    header.appendChild(counter);
  }

  counter.textContent = `Total disponível: ${total}h por semana`;
}

/* ---------- EVENTOS ---------- */
blocks.forEach(block => {
  // Ativar / desativar
 block.addEventListener('click', () => {
  const label = block.querySelector('.label');

  block.classList.toggle('active');

  if (block.classList.contains('active')) {
    label.textContent = 'Estudo';
  } else {
    label.textContent = 'Livre';
  }

  saveRoutine();
  updateTotalHours();
});

  // Editar atividade
  block.addEventListener('dblclick', () => {
    const label = block.querySelector('.label');
    const novoTexto = prompt('Qual atividade neste horário?', label.textContent);

    if (novoTexto !== null && novoTexto.trim() !== '') {
      label.textContent = novoTexto;
      saveRoutine();
    }
  });
});



/* ---------- INIT ---------- */
loadRoutine();
updateTotalHours();
