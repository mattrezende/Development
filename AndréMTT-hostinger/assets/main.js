// Menu mobile (header)
(function () {
  var burger = document.querySelector('[data-burger]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (!burger || !nav) return;
  burger.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
})();

// Formulário de contato -> WhatsApp
(function () {
  var form = document.getElementById('contato-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var nome = (f.nome.value || '').trim();
    var tel = (f.telefone.value || '').trim();
    var modelo = f.modelo.value;
    var checked = Array.from(f.querySelectorAll('input[name="objetivo"]:checked')).map(function (c) { return c.value; });
    var outros = (f.outros.value || '').trim();
    var objs = checked.filter(function (c) { return c !== 'Outros'; });
    if (checked.includes('Outros') && outros) objs.push('Outros: ' + outros);
    var msg = 'Olá André! Estava no seu site e quero agendar minha aula experimental.\n\n';
    msg += 'Nome: ' + nome + '\n';
    msg += 'Telefone: ' + tel + '\n';
    msg += 'Plano de interesse: ' + modelo + '\n';
    if (objs.length) msg += 'Objetivos: ' + objs.join(', ') + '\n';
    var url = 'https://wa.me/5561996085008?text=' + encodeURIComponent(msg);
    if (window.pfTrack) window.pfTrack('formulario-contato');
    var sentMsg = f.querySelector('[data-sent-msg]');
    if (sentMsg) sentMsg.style.display = 'flex';
    window.open(url, '_blank', 'noopener');
  });
})();

// Calculadora de preço do Personal Individual (modelos)
(function () {
  var calc = document.querySelector('[data-ind-calc]');
  if (!calc) return;

  var INTEGRAL = { 1: 319, 2: 639, 3: 899, 4: 1199, 5: 1399 };
  var freqLabels = { 1: '1x', 2: '2x', 3: '3x', 4: '4x', 5: '5x' };
  var state = { freq: 2 };

  function fmt(v) {
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }

  var btnBase = "font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;font-size:16px;cursor:pointer;padding:11px 18px;border-radius:8px;transition:all .15s;";
  var activeStyle = "background:linear-gradient(180deg,#E8127C,#A8095A);color:#fff;border:1px solid transparent;box-shadow:0 6px 18px rgba(232,18,124,0.35);";
  var inactiveStyle = "background:#0e0e10;color:#c7c7cc;border:1px solid rgba(255,255,255,0.14);";

  function render() {
    var f = state.freq;

    calc.querySelectorAll('[data-ind-freq]').forEach(function (btn) {
      var v = Number(btn.getAttribute('data-ind-freq'));
      btn.style.cssText = btnBase + (v === f ? activeStyle : inactiveStyle);
    });

    calc.querySelector('[data-ind-price]').textContent = fmt(INTEGRAL[f]);
    calc.querySelector('[data-ind-summary]').textContent = 'Treino individual, ' + freqLabels[f] + ' por semana';
    calc.querySelector('[data-ind-per-class]').textContent = fmt(INTEGRAL[f] / (f * 4)) + ' /aula';
  }

  calc.querySelectorAll('[data-ind-freq]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.freq = Number(btn.getAttribute('data-ind-freq'));
      render();
    });
  });

  render();
})();

// Calculadora de preço do Personal Group (modelos)
(function () {
  var calc = document.querySelector('[data-pg-calc]');
  if (!calc) return;

  var INTEGRAL = { 1: 319, 2: 639, 3: 899, 4: 1199, 5: 1399 };
  var freqLabels = { 1: '1x', 2: '2x', 3: '3x', 4: '4x', 5: '5x' };
  var state = { freq: 1, students: 2 };

  function fmt(v) {
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }

  var btnBase = "font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;font-size:16px;cursor:pointer;padding:11px 18px;border-radius:8px;transition:all .15s;";
  var activeStyle = "background:linear-gradient(180deg,#E8127C,#A8095A);color:#fff;border:1px solid transparent;box-shadow:0 6px 18px rgba(232,18,124,0.35);";
  var inactiveStyle = "background:#0e0e10;color:#c7c7cc;border:1px solid rgba(255,255,255,0.14);";

  function render() {
    var n = state.students;
    var pgMult = 1.5 + 0.4 * (n - 2);
    var perPerson = Math.round((INTEGRAL[state.freq] * pgMult) / n);
    var total = perPerson * n;

    calc.querySelectorAll('[data-freq]').forEach(function (btn) {
      var f = Number(btn.getAttribute('data-freq'));
      btn.style.cssText = btnBase + (f === state.freq ? activeStyle : inactiveStyle);
    });
    calc.querySelectorAll('[data-students]').forEach(function (btn) {
      var s = Number(btn.getAttribute('data-students'));
      btn.style.cssText = btnBase + (s === state.students ? activeStyle : inactiveStyle);
    });

    calc.querySelector('[data-pg-per-person]').textContent = fmt(perPerson);
    calc.querySelector('[data-pg-summary]').textContent = n + (n === 1 ? ' aluno, ' : ' alunos, ') + freqLabels[state.freq] + ' por semana';
    calc.querySelector('[data-pg-total]').textContent = fmt(total) + '/mês';
  }

  calc.querySelectorAll('[data-freq]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.freq = Number(btn.getAttribute('data-freq'));
      render();
    });
  });
  calc.querySelectorAll('[data-students]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.students = Number(btn.getAttribute('data-students'));
      render();
    });
  });

  render();
})();

// Calculadora de preço do Small Group (modelos)
(function () {
  var calc = document.querySelector('[data-sg-calc]');
  if (!calc) return;

  var sgTable = {
    1: { 2: 190, 3: 170, 4: 150 },
    2: { 2: 360, 3: 320, 4: 285 },
    3: { 2: 515, 3: 460, 4: 405 },
    4: { 2: 685, 3: 615, 4: 540 },
    5: { 2: 800, 3: 715, 4: 630 },
  };
  var freqLabels = { 1: '1x', 2: '2x', 3: '3x', 4: '4x', 5: '5x' };
  var state = { freq: 1, students: 2 };

  function fmt(v) {
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }

  var btnBase = "font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;font-size:16px;cursor:pointer;padding:11px 18px;border-radius:8px;transition:all .15s;";
  var activeStyle = "background:linear-gradient(180deg,#E8127C,#A8095A);color:#fff;border:1px solid transparent;box-shadow:0 6px 18px rgba(232,18,124,0.35);";
  var inactiveStyle = "background:#0e0e10;color:#c7c7cc;border:1px solid rgba(255,255,255,0.14);";

  function render() {
    var n = state.students;
    var perPerson = sgTable[state.freq][n];
    var total = perPerson * n;

    calc.querySelectorAll('[data-sg-freq]').forEach(function (btn) {
      var f = Number(btn.getAttribute('data-sg-freq'));
      btn.style.cssText = btnBase + (f === state.freq ? activeStyle : inactiveStyle);
    });
    calc.querySelectorAll('[data-sg-students]').forEach(function (btn) {
      var s = Number(btn.getAttribute('data-sg-students'));
      btn.style.cssText = btnBase + (s === state.students ? activeStyle : inactiveStyle);
    });

    calc.querySelector('[data-sg-per-person]').textContent = fmt(perPerson);
    calc.querySelector('[data-sg-summary]').textContent = n + ' alunos, ' + freqLabels[state.freq] + ' por semana';
    calc.querySelector('[data-sg-total]').textContent = fmt(total) + '/mês';
  }

  calc.querySelectorAll('[data-sg-freq]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.freq = Number(btn.getAttribute('data-sg-freq'));
      render();
    });
  });
  calc.querySelectorAll('[data-sg-students]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.students = Number(btn.getAttribute('data-sg-students'));
      render();
    });
  });

  render();
})();

// Small Group — "abrir turma no meu bairro" (modelos)
(function () {
  var picker = document.querySelector('[data-bairro-picker]');
  var abrirBtn = document.querySelector('[data-abrir-btn]');
  if (!picker || !abrirBtn) return;

  var chipBase = "font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;font-size:15px;cursor:pointer;padding:10px 18px;border-radius:999px;transition:all .15s;";
  var chipActive = "background:linear-gradient(180deg,#E8127C,#A8095A);color:#fff;border:1px solid transparent;box-shadow:0 6px 18px rgba(232,18,124,0.35);";
  var chipInactive = "background:#0e0e10;color:#c7c7cc;border:1px solid rgba(255,255,255,0.14);";
  var abrirBase = "display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:17px;border:none;border-radius:8px;padding:15px 30px;transition:all .15s;";
  var abrirActive = "background:linear-gradient(180deg,#E8127C,#A8095A);color:#fff;cursor:pointer;box-shadow:0 10px 30px rgba(232,18,124,0.4);";
  var abrirInactive = "background:#0e0e10;color:#7a7a7e;cursor:not-allowed;border:1px solid rgba(255,255,255,0.1);";

  var selected = null;

  function render() {
    picker.querySelectorAll('[data-bairro]').forEach(function (btn) {
      var b = btn.getAttribute('data-bairro');
      btn.style.cssText = chipBase + (b === selected ? chipActive : chipInactive);
    });
    abrirBtn.disabled = !selected;
    abrirBtn.style.cssText = abrirBase + (selected ? abrirActive : abrirInactive);
    abrirBtn.textContent = selected ? ('Quero abrir uma turma em ' + selected) : 'Selecione um bairro acima';
  }

  picker.querySelectorAll('[data-bairro]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selected = btn.getAttribute('data-bairro');
      render();
    });
  });

  abrirBtn.addEventListener('click', function () {
    if (!selected) return;
    if (window.pfTrack) window.pfTrack('abrir-turma-' + selected);
    var url = 'https://wa.me/5561996085008?text=' + encodeURIComponent('Olá André! Estava no seu site e quero abrir um Small Group em ' + selected + '.');
    window.open(url, '_blank', 'noopener');
  });

  render();
})();
