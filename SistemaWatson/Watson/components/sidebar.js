class AppSidebar extends HTMLElement {

  connectedCallback() {

    const currentPage = window.location.pathname.split('/').pop();

    this.innerHTML = `
      <aside class="sidebar">

        <div class="sidebar-header"></div>

        <h1 class="black-ops-one-regular">WATSON</h1>
        <br><br><br>

        <nav class="sidebar-menu">

          <a href="index.html">Dashboard</a>
          <a href="rotina.html">Rotina</a>
          <a href="ciclos.html">Ciclos</a>
          <a href="executar-ciclo.html">Estudar</a>
          <a href="caderno.html">Anotações</a>
          <a href="agente.html">Agente de IA</a>
          <a href="tutorial.html">Tutorial</a>

          <div class="sidebar-bottom">
            <a href="settings.html">
              <span>&#9881;</span> User.name
            </a>
          </div>

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