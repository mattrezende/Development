import StudyArea from "./StudyArea.js";

export default class DeckList {
  constructor(container) {
    this.container = container;
    this.render();

    document.addEventListener("navigate", (e) => {
      if (e.detail === "study") {
        new StudyArea(this.container);
      }
      if (e.detail === "decks") {
        this.render();
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="deck-list fade">
        <h2>Seus Decks</h2>

        <div class="deck">
            <h3>Direito Constitucional</h3>
            <p>23 cards para hoje</p>
            <button id="startStudy">Estudar</button>
        </div>

        <div class="deck">
            <h3>Português</h3>
            <p>12 cards para hoje</p>
            <button>Estudar</button>
        </div>
      </div>
    `;

    document.getElementById("startStudy").onclick = () => {
      new StudyArea(this.container);
    };
  }
}