  const select = registroSelect;
  const card = document.getElementById('card');
  const btnEditar = btnEditarEl = document.getElementById('btnEditar');
  const btnSalvar = btnSalvarEl = document.getElementById('btnSalvar');
  const checkboxes = document.querySelectorAll('input[name="parto"]');

  let indiceAtual = null;

  function getRegistros() {
    return JSON.parse(localStorage.getItem('registrosGestacionais')) || [];
  }

  function setRegistros(arr) {
    localStorage.setItem('registrosGestacionais', JSON.stringify(arr));
  }

  function carregarSelect() {
    select.innerHTML = '<option value="">-- Selecione --</option>';
    getRegistros().forEach((r, i) => {
      const o = document.createElement('option');
      o.value = i;
      o.textContent = `${r.nomeMae} – ${r.nomeBebe || 'Sem nome'}`;
      select.appendChild(o);
    });
  }

  carregarSelect();

  select.addEventListener('change', () => {
    if (select.value === '') return card.style.display = 'none';

    indiceAtual = select.value;
    const r = getRegistros()[indiceAtual];

    Object.keys(r).forEach(k => {
      const out = document.getElementById('out' + k.charAt(0).toUpperCase() + k.slice(1));
      if (out) out.textContent = r[k];
    });

    card.style.display = 'block';
  });

  btnEditar.addEventListener('click', () => {
    const r = getRegistros()[indiceAtual];
    Object.keys(r).forEach(k => {
      const out = document.getElementById('out' + k.charAt(0).toUpperCase() + k.slice(1));
      const input = document.getElementById('in' + k.charAt(0).toUpperCase() + k.slice(1));
      if (out && input) {
        input.value = r[k];
        out.style.display = 'none';
        input.style.display = 'block';
      }
    });
    btnEditar.style.display = 'none';
    btnSalvar.style.display = 'inline-block';
  });

  btnSalvar.addEventListener('click', () => {
    const registros = getRegistros();
    const r = registros[indiceAtual];

    Object.keys(r).forEach(k => {
      const input = document.getElementById('in' + k.charAt(0).toUpperCase() + k.slice(1));
      if (input) r[k] = input.value;
    });

    registros[indiceAtual] = r;
    setRegistros(registros);
    carregarSelect();
    select.value = indiceAtual;
    select.dispatchEvent(new Event('change'));

    btnSalvar.style.display = 'none';
    btnEditar.style.display = 'inline-block';
    alert('Registro atualizado com sucesso!');
  });

  checkboxes.forEach(c =>
    c.addEventListener('change', () =>
      checkboxes.forEach(o => o !== c && (o.checked = false))
    )
  );

formGestacional.addEventListener('submit', e => {
  e.preventDefault();

  let parto = '';
  checkboxes.forEach(c => {
    if (c.checked) parto = c.value;
  });

  const novaFicha = {
    nomeMae: nomeMae.value.trim(),
    nomePai: nomePai.value.trim(),
    idadeMae: idadeMae.value,
    idadeGestacional: idadeGestacional.value,
    dpp: dpp.value,
    hospital: hospital.value.trim(),
    endereco: endereco.value.trim(),
    parto,
    historico: historico.value.trim(),
    outrosFilhos: outrosFilhos.value.trim(),
    nomeBebe: nomeBebe.value.trim()
  };

  const registros = getRegistros();
  registros.push(novaFicha); // ✅ SEMPRE CRIA NOVO REGISTRO
  setRegistros(registros);

  // 🔄 RESET TOTAL DE ESTADO
  formGestacional.reset();
  indiceAtual = null;
  select.value = '';
  card.style.display = 'none';

  carregarSelect();
  alert('Nova ficha salva com sucesso!');
});


    