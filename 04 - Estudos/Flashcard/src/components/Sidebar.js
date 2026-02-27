export default class Sidebar {
  constructor(container) {
    container.innerHTML = `
      <aside class="sidebar">
          <h1>WATSON</h1>
          <nav>
              <button data-page="decks">Decks</button>
              <button data-page="study">Estudar</button>
              <button data-page="stats">Estatísticas</button>
          </nav>
      </aside>
    `;

    container.addEventListener("click", (e) => {
      if (e.target.dataset.page) {
        document.dispatchEvent(
          new CustomEvent("navigate", {
            detail: e.target.dataset.page
          })
        );
      }
    });
  }
}