class DisciplinaTemaSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

this.data = {

  "Português": [
    "Interpretação de Texto",
    "Gramática",
    "Ortografia",
    "Pontuação",
    "Concordância",
    "Regência",
    "Crase",
    "Sintaxe",
    "Semântica"
  ],

  "Redação": [
    "Dissertação Argumentativa",
    "Coesão e Coerência",
    "Estrutura Textual",
    "Tipos Textuais",
    "Argumentação",
    "Temas Sociais"
  ],

  "Literatura": [
    "Escolas Literárias",
    "Autores Brasileiros",
    "Obras Literárias",
    "Análise de Texto",
    "Gêneros Literários"
  ],

  "Matemática": [
    "Aritmética",
    "Álgebra",
    "Geometria",
    "Trigonometria",
    "Funções",
    "Probabilidade",
    "Análise Combinatória",
    "Matemática Financeira"
  ],

  "Raciocínio Lógico": [
    "Proposições",
    "Conectivos",
    "Tabelas Verdade",
    "Equivalências",
    "Argumentação Lógica",
    "Sequências",
    "Problemas Lógicos"
  ],

  "Física": [
    "Mecânica",
    "Termologia",
    "Ondulatória",
    "Óptica",
    "Eletricidade",
    "Magnetismo"
  ],

  "Química": [
    "Química Geral",
    "Físico-Química",
    "Química Orgânica",
    "Estequiometria",
    "Soluções",
    "Eletroquímica"
  ],

  "Biologia": [
    "Citologia",
    "Genética",
    "Evolução",
    "Ecologia",
    "Anatomia",
    "Fisiologia",
    "Botânica",
    "Zoologia"
  ],

  "História": [
    "História do Brasil",
    "História Geral",
    "Idade Antiga",
    "Idade Média",
    "Idade Moderna",
    "Idade Contemporânea"
  ],

  "Geografia": [
    "Geografia Física",
    "Geografia Humana",
    "Geopolítica",
    "Cartografia",
    "Brasil",
    "Meio Ambiente"
  ],

  "Filosofia": [
    "Filosofia Antiga",
    "Filosofia Medieval",
    "Filosofia Moderna",
    "Filosofia Contemporânea",
    "Ética",
    "Lógica"
  ],

  "Sociologia": [
    "Teorias Sociológicas",
    "Cultura",
    "Sociedade",
    "Política",
    "Movimentos Sociais",
    "Cidadania"
  ],

  "Inglês": [
    "Interpretação de Texto",
    "Gramática",
    "Vocabulário",
    "Tempos Verbais",
    "Preposições"
  ],

  "Espanhol": [
    "Interpretação de Texto",
    "Gramática",
    "Vocabulário",
    "Tempos Verbais"
  ],

  "Informática": [
    "Windows",
    "Linux",
    "Pacote Office",
    "Internet",
    "Segurança da Informação",
    "Redes",
    "Banco de Dados"
  ],

  "Direito Constitucional": [
    "Princípios Fundamentais",
    "Direitos e Garantias Fundamentais",
    "Organização do Estado",
    "Organização dos Poderes",
    "Controle de Constitucionalidade",
    "Administração Pública"
  ],

  "Direito Administrativo": [
    "Princípios",
    "Atos Administrativos",
    "Poderes Administrativos",
    "Licitações",
    "Contratos",
    "Servidores Públicos",
    "Responsabilidade Civil do Estado"
  ],

  "Direito Penal": [
    "Teoria do Crime",
    "Aplicação da Lei Penal",
    "Penas",
    "Crime contra a Pessoa",
    "Crime contra o Patrimônio",
    "Crime contra a Administração Pública"
  ],

  "Direito Processual Penal": [
    "Inquérito Policial",
    "Ação Penal",
    "Competência",
    "Provas",
    "Prisões",
    "Procedimentos",
    "Recursos"
  ],

  "Direito Civil": [
    "Parte Geral",
    "Obrigações",
    "Contratos",
    "Responsabilidade Civil",
    "Direito das Coisas",
    "Família",
    "Sucessões"
  ],

  "Direito Processual Civil": [
    "Princípios",
    "Jurisdição",
    "Competência",
    "Processo de Conhecimento",
    "Execução",
    "Recursos"
  ],

  "Direito Tributário": [
    "Sistema Tributário Nacional",
    "Competência Tributária",
    "Tributos",
    "Obrigação Tributária",
    "Crédito Tributário"
  ],

  "Direito Previdenciário": [
    "Seguridade Social",
    "Regime Geral",
    "Benefícios",
    "Custeio"
  ],

  "Direitos Humanos": [
    "Teoria Geral",
    "Tratados Internacionais",
    "Sistema Interamericano",
    "Direitos Fundamentais"
  ],

  "Legislação Especial": [
    "Lei de Drogas",
    "Estatuto do Desarmamento",
    "Lei de Tortura",
    "Lei de Abuso de Autoridade",
    "Lei Maria da Penha"
  ],

  "Contabilidade": [
    "Contabilidade Geral",
    "Demonstrações Contábeis",
    "Custos",
    "Análise de Balanços"
  ],

  "Administração": [
    "Teorias da Administração",
    "Planejamento",
    "Organização",
    "Direção",
    "Controle",
    "Gestão de Pessoas"
  ],

  "Economia": [
    "Microeconomia",
    "Macroeconomia",
    "Política Econômica",
    "Mercado",
    "Inflação"
  ],

  "Estatística": [
    "Estatística Descritiva",
    "Probabilidade",
    "Distribuições",
    "Inferência",
    "Amostragem"
  ],

  "Arquivologia": [
    "Gestão de Documentos",
    "Classificação",
    "Avaliação",
    "Arquivos Correntes",
    "Arquivos Permanentes"
  ],

  "Atualidades": [
    "Política",
    "Economia",
    "Sociedade",
    "Tecnologia",
    "Meio Ambiente",
    "Relações Internacionais"
  ]

};


    this.disciplinaSelecionada = "";
    this.temaSelecionado = "";
  }

  connectedCallback() {
    this.render();
    this.addEvents();
  }

  render() {
    const disciplinas = Object.keys(this.data).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
        }

        select {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 14px;
        }
      </style>

      <select id="disciplina">
        <option value="">Selecione a disciplina</option>
        ${disciplinas
          .map(d => `<option value="${d}">${d}</option>`)
          .join("")}
      </select>

      <select id="tema" disabled>
        <option value="">Selecione o tema</option>
      </select>
    `;
  }

  addEvents() {
    const disciplinaEl = this.shadowRoot.getElementById("disciplina");
    const temaEl = this.shadowRoot.getElementById("tema");

    disciplinaEl.addEventListener("change", () => {
      this.disciplinaSelecionada = disciplinaEl.value;

      const temas = this.data[this.disciplinaSelecionada] || [];

      temaEl.innerHTML =
        `<option value="">Selecione o tema</option>` +
        temas
          .map(t => `<option value="${t}">${t}</option>`)
          .join("");

      temaEl.disabled = temas.length === 0;
    });

    temaEl.addEventListener("change", () => {
      this.temaSelecionado = temaEl.value;
    });
  }

  get value() {
    return {
      disciplina: this.disciplinaSelecionada,
      tema: this.temaSelecionado
    };
  }
}

customElements.define("disciplina-tema-select", DisciplinaTemaSelect);
