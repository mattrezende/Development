    const form = document.getElementById('formGestacional');
    const checkboxes = document.querySelectorAll('input[name="parto"]');

    // Garante apenas um checkbox selecionado
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        checkboxes.forEach(cb => {
          if (cb !== checkbox) cb.checked = false;
        });
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let partoSelecionado = '';
      checkboxes.forEach(cb => {
        if (cb.checked) partoSelecionado = cb.value;
      });

      const novaFicha = {
        id: Date.now(),
        nomeMae: document.getElementById('nomeMae').value,
        nomePai: document.getElementById('nomePai').value,
        idadeMae: document.getElementById('idadeMae').value,
        idadeGestacional: document.getElementById('idadeGestacional').value,
        dpp: document.getElementById('dpp').value,
        hospital: document.getElementById('hospital').value,
        endereco: document.getElementById('endereco').value,
        parto: partoSelecionado,
        historico: document.getElementById('historico').value,
        outrosFilhos: document.getElementById('outrosFilhos').value,
        nomeBebe: document.getElementById('nomeBebe').value
      };

      // Recupera registros existentes
      const registros = JSON.parse(
        localStorage.getItem('registrosGestacionais')
      ) || [];

      // Adiciona novo registro
      registros.push(novaFicha);

      // Salva novamente no localStorage
      localStorage.setItem(
        'registrosGestacionais',
        JSON.stringify(registros)
      );

      alert('Ficha salva com sucesso!');

      // Limpa formulário
      form.reset();
    });

