class AppFooter extends HTMLElement {

  connectedCallback() {

    const year = new Date().getFullYear();

    this.innerHTML = `
      <footer class="app-footer">

        <div class="ciclos-widget">
          <h1>Seu ciclo atual é de ${localStorage.getItem("cicloAtual") || "***********"}</h1>
          </div>

          <div class="footer-right">

          <div class="cronometro-widget">

            <div id="cronometroTime" class="cronometro-time">
              00:00:00
            </div>

            <div class="cronometro-controls">
              <button id="btnStart">▶</button>
              <button id="btnPause">⏸</button>
              <button id="btnReset">⟲</button>
              <button id="btnFinish">✓</button>
            </div>

          </div>

          <div class="clock-widget">
            <div id="clockTime" class="clock-time"></div>
            <div id="clockDate" class="clock-date"></div>
          </div>
        </div>

      </footer>
    `;

    this.startClock();
    this.startCronometro();

  }

  /* ================= CLOCK ================= */

  startClock() {

    const updateClock = () => {

      const now = new Date();

      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      this.querySelector("#clockTime").textContent = `${hours}:${minutes}`;

      const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      };

      const date = now.toLocaleDateString('pt-BR', options);

      this.querySelector("#clockDate").textContent = date;

    };

    updateClock();
    setInterval(updateClock, 1000);

  }

  /* ================= CRONOMETRO ================= */

  startCronometro() {

    this.tempoSegundos = parseInt(localStorage.getItem("cronometroTempo")) || 0;
    this.intervalo = null;

    const atualizarCronometro = () => {

      const horas = Math.floor(this.tempoSegundos / 3600);
      const minutos = Math.floor((this.tempoSegundos % 3600) / 60);
      const segundos = this.tempoSegundos % 60;

      const formatado =
        String(horas).padStart(2, '0') + ":" +
        String(minutos).padStart(2, '0') + ":" +
        String(segundos).padStart(2, '0');

      this.querySelector("#cronometroTime").textContent = formatado;

      localStorage.setItem("cronometroTempo", this.tempoSegundos);

    };

    const iniciar = () => {

      if (this.intervalo) return;

      localStorage.setItem("cronometroRodando", "true");

      this.intervalo = setInterval(() => {

        this.tempoSegundos++;
        atualizarCronometro();

      }, 1000);

    };

    const pausar = () => {

      clearInterval(this.intervalo);
      this.intervalo = null;

      localStorage.setItem("cronometroRodando", "false");

    };

    const resetar = () => {

      pausar();
      this.tempoSegundos = 0;
      atualizarCronometro();

    };

    const finalizar = () => {

      pausar();

      const tempoFinal = this.tempoSegundos;

      const historico = JSON.parse(localStorage.getItem("historicoEstudo")) || [];

      historico.push({
        data: new Date().toISOString(),
        tempo: tempoFinal
      });

      localStorage.setItem("historicoEstudo", JSON.stringify(historico));

      this.tempoSegundos = 0;

      localStorage.setItem("cronometroTempo", 0);
      localStorage.setItem("cronometroRodando", "false");

      atualizarCronometro();

    };

    this.querySelector("#btnStart").addEventListener("click", iniciar);
    this.querySelector("#btnPause").addEventListener("click", pausar);
    this.querySelector("#btnReset").addEventListener("click", resetar);
    this.querySelector("#btnFinish").addEventListener("click", finalizar);

    atualizarCronometro();

    if (localStorage.getItem("cronometroRodando") === "true") {
      iniciar();
    }

  }

}

customElements.define("app-footer", AppFooter);