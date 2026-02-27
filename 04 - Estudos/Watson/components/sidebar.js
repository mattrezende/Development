class AppSidebar extends HTMLElement {
  connectedCallback() {

    const currentPage = window.location.pathname.split('/').pop();

    this.innerHTML = `
   
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1>WATSON</h1>
        </div>

        <nav class="sidebar-menu">
          <a href="index.html">Dashboard</a>
          <a href="rotina.html">Rotina</a>
          <a href="ciclos.html">Ciclos</a>
          <a href="flashcard.html">Flashcards</a>
          <a href="executar.html">Estudar</a>
          <a href="tutorial.html">Tutorial</a>
          <a href="agente.html">Agente de IA</a>
        </nav>
      </aside>
    `;

    this.highlightActive(currentPage);
  }

  highlightActive(currentPage) {
    const links = this.querySelectorAll('.sidebar-menu a');

    links.forEach(link => {
      const href = link.getAttribute('href');

      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
}

customElements.define('app-sidebar', AppSidebar);
