const select = document.getElementById('registroSelect');
    const card = document.getElementById('card');

    // Recupera dados do localStorage
    const registros = JSON.parse(
      localStorage.getItem('registrosGestacionais')
    ) || [];

    // Preenche a lista suspensa
    registros.forEach((registro, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${registro.nomeMae} – ${registro.nomeBebe || 'Sem nome'}`;
      select.appendChild(option);
    });

    // Renderiza o registro selecionado
    select.addEventListener('change', () => {
      const index = select.value;

      if (index === '') {
        card.style.display = 'none';
        card.innerHTML = '';
        return;
      }

      const r = registros[index];

      card.innerHTML = `
        <div class="field"><span class="label">Nome da mamãe:</span><span class="value">${r.nomeMae}</span></div>
        <div class="field"><span class="label">Nome do papai:</span><span class="value">${r.nomePai}</span></div>
        <div class="field"><span class="label">Idade da mamãe:</span><span class="value">${r.idadeMae}</span></div>
        <div class="field"><span class="label">Idade gestacional:</span><span class="value">${r.idadeGestacional} semanas</span></div>
        <div class="field"><span class="label">DPP:</span><span class="value">${r.dpp}</span></div>
        <div class="field"><span class="label">Hospital:</span><span class="value">${r.hospital}</span></div>
        <div class="field"><span class="label">Endereço:</span><span class="value">${r.endereco}</span></div>
        <div class="field"><span class="label">Parto desejado:</span><span class="value">${r.parto}</span></div>
        <div class="field"><span class="label">Histórico médico:</span><span class="value">${r.historico}</span></div>
        <div class="field"><span class="label">Outros filhos:</span><span class="value">${r.outrosFilhos}</span></div>
        <div class="field"><span class="label">Nome do bebê:</span><span class="value">${r.nomeBebe}</span></div>
      `;

      card.style.display = 'block';
    });