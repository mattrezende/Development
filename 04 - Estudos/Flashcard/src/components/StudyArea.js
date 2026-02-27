import ProgressBar from "./ProgressBar.js";

export default class StudyArea {
  constructor(container) {
    this.container = container;
    this.index = 0;

    this.cards = [
      {
        front: "O que é Habeas Corpus?",
        back: "Remédio constitucional para proteger liberdade de locomoção."
      },
      {
        front: "O que é Mandado de Segurança?",
        back: "Protege direito líquido e certo."
      }
    ];

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="study fade">

          <div id="progress"></div>

          <div class="card" id="card">
              <div class="card-inner">
                  <div class="card-front">
                      ${this.cards[this.index].front}
                  </div>
                  <div class="card-back">
                      ${this.cards[this.index].back}
                  </div>
              </div>
          </div>

          <button id="flip">Mostrar Resposta</button>

          <div class="answers hidden" id="answers">
              <button data-grade="0">Again</button>
              <button data-grade="3">Hard</button>
              <button data-grade="4">Good</button>
              <button data-grade="5">Easy</button>
          </div>

      </div>
    `;

    new ProgressBar(
      document.getElementById("progress"),
      this.index,
      this.cards.length
    );

    this.bindEvents();
  }

  bindEvents() {
    const card = document.getElementById("card");
    const flipBtn = document.getElementById("flip");
    const answers = document.getElementById("answers");

    flipBtn.onclick = () => {
      card.classList.toggle("flipped");
      answers.classList.remove("hidden");
      flipBtn.style.display = "none";
    };

    answers.onclick = (e) => {
      if (!e.target.dataset.grade) return;

      this.index++;

      if (this.index >= this.cards.length) {
        this.container.innerHTML = `<h2>Revisão concluída 🎉</h2>`;
        return;
      }

      this.render();
    };
  }
}