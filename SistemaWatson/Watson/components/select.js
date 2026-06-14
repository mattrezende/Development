class DisciplinasSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.disciplinas = [
      "Português",
      "Redação",
      "Literatura",
      "Matemática",
      "Raciocínio Lógico",
      "Física",
      "Química",
      "Biologia",
      "História",
      "Geografia",
      "Filosofia",
      "Sociologia",
      "Inglês",
      "Espanhol",
      "Informática",
      "Direito Constitucional",
      "Direito Administrativo",
      "Direito Penal",
      "Direito Processual Penal",
      "Direito Civil",
      "Direito Processual Civil",
      "Direito Tributário",
      "Direito Previdenciário",
      "Direitos Humanos",
      "Legislação Especial",
      "Contabilidade",
      "Administração",
      "Economia",
      "Estatística",
      "Arquivologia",

    ];

    this.disciplinas.sort((a, b) => a.localeCompare(b, 'pt-BR'));

    this.selectedValue = "";
  }

  connectedCallback() {
    this.render();
    this.addEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
          position: relative;
        }

        .container {
          position: relative;
          width: 100%;
        }

        input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 14px;
          box-sizing: border-box;
          background: #18181f;
          color: var(--text);
        }

        input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
        }

        .dropdown {
          position: absolute;
          width: 100%;
          background: #18181f;
          border: 1px solid #ccc;
          border-radius: 8px;
          margin-top: 4px;
          max-height: 200px;
          overflow-y: auto;
          display: none;
          z-index: 999;
        }

        .item {
          padding: 8px 10px;
          cursor: pointer;
        }

        .item:hover {
          background: #f0f0f0;
        }
      </style>

      <div class="container">
        <input type="text" placeholder="Selecione uma disciplina..." />
        <div class="dropdown"></div>
      </div>
    `;
  }

  addEvents() {
    const input = this.shadowRoot.querySelector("input");
    const dropdown = this.shadowRoot.querySelector(".dropdown");

    const renderList = (filter = "") => {
      const lista = this.disciplinas.filter(d =>
        d.toLowerCase().includes(filter.toLowerCase())
      );

      dropdown.innerHTML = lista
        .map(d => `<div class="item">${d}</div>`)
        .join("");

      dropdown.style.display = lista.length ? "block" : "none";

      dropdown.querySelectorAll(".item").forEach(item => {
        item.addEventListener("click", () => {
          input.value = item.textContent;
          this.selectedValue = item.textContent;
          dropdown.style.display = "none";
        });
      });
    };

    input.addEventListener("focus", () => renderList());

    input.addEventListener("input", e => {
      renderList(e.target.value);
    });

    document.addEventListener("click", e => {
      if (!this.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  get value() {
    return this.selectedValue;
  }
}

customElements.define("disciplinas-select", DisciplinasSelect);
