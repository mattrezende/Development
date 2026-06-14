// ===============================
// ESTADO
// ===============================

let materiasTemp = []

let ciclos = JSON.parse(localStorage.getItem("ciclos")) || []


// ===============================
// ADICIONAR MATÉRIA (TAG)
// ===============================

function adicionarMateria(){

 const disciplina = document.getElementById("disciplina").value
 const peso = Number(document.getElementById("peso").value)

 if(!disciplina || !peso){
   alert("Preencha disciplina e peso")
   return
 }

 const materia = {
   id: Date.now(),
   nome: disciplina,
   peso: peso
 }

 materiasTemp.push(materia)

 renderizarTags()

 limparInputs()

}


// ===============================
// LIMPAR INPUT
// ===============================

function limparInputs(){

 document.getElementById("peso").value = ""

}


// ===============================
// RENDERIZAR TAGS
// ===============================

function renderizarTags(){

 const container = document.getElementById("tags-container")

 container.innerHTML = ""

 materiasTemp.forEach(m => {

   const tag = document.createElement("div")
   tag.className = "tag-materia"

   tag.innerHTML = `
      <span class="nome">${m.nome}</span>
      <span class="estrelas">${"★".repeat(m.peso)}</span>
      <button onclick="removerMateria(${m.id})">✖</button>
   `

   container.appendChild(tag)

 })

}
// ===============================
// REMOVER MATÉRIA
// ===============================

function removerMateria(id){

 materiasTemp = materiasTemp.filter(m => m.id !== id)

 renderizarTags()
 renderizarCiclos()

}


// ===============================
// CALCULAR TEMPO AUTOMÁTICO
// ===============================

function calcularTempos(materias){

 const tempoTotal = Number(localStorage.getItem("tempoTotalEstudo")) || 300

 const somaPesos = materias.reduce((s,m)=> s + m.peso , 0)

 return materias.map(m => {

   const proporcao = m.peso / somaPesos

   const tempo = Math.round(tempoTotal * proporcao)

   return {
     ...m,
     tempo
   }

 })

}


// ===============================
// SALVAR CICLO
// ===============================
function salvarCiclo(){

 if(materiasTemp.length === 0){
   alert("Adicione matérias primeiro")
   return
 }

 const materiasComTempo = calcularTempos(materiasTemp)

 const ciclo = {
   id: Date.now(),
   criadoEm: new Date(),
   materias: materiasComTempo
 }

 ciclos.push(ciclo)

 localStorage.setItem("ciclos", JSON.stringify(ciclos))

 materiasTemp = []

 renderizarTags()
 renderizarCiclos() // ← FALTAVA ISSO

}

// ===============================
// RENDERIZAR CICLOS SALVOS
// ===============================

function renderizarCiclos(){

 const container = document.getElementById("ciclo-container")

 container.innerHTML = ""

 ciclos.forEach(c => {

   const card = document.createElement("div")

   card.className = "card-ciclo"

   let html = `<h1 class="cicle-title"></h1><br>`

   c.materias.forEach(m => {

     html += ` <div class="current-card-ciclo">
     
  <h2>${m.nome}</h2>

  <div class="estrelas">${"★".repeat(m.peso)}</div>

  <div class="tempo" id="tempo-${m.id}">
  ${m.tempo} min
</div>

  <button id="remove-btn" onclick="removerMateriaDoCiclo(${c.id}, ${m.id})">✖</button>

</div>
     `

   })

   card.innerHTML = html

   container.appendChild(card)

 })

}

// ===============================
// APAGAR CICLOS SALVOS
// ===============================

function apagarCiclos(){

  const confirmar = confirm("Tem certeza que deseja apagar todos os ciclos?")

  if(!confirmar) return

  // limpa array em memória
  ciclos = []

  // remove do localStorage
  localStorage.removeItem("ciclos")

  // limpa HTML
  const container = document.getElementById("ciclo-container")
  container.innerHTML = ""

  alert("Ciclos apagados com sucesso!")

}

// ===============================
// REMOVER MATERIA DO CICLO
// ===============================
function removerMateriaDoCiclo(cicloId, materiaId){

 let temposAntigos = {}

 // guardar tempos atuais
 ciclos.forEach(c=>{
   c.materias.forEach(m=>{
     temposAntigos[m.id] = m.tempo
   })
 })

 ciclos = ciclos.map(c => {

   if(c.id !== cicloId) return c

   const materiasAtualizadas = c.materias.filter(m => m.id !== materiaId)

   const materiasRecalculadas = calcularTempos(materiasAtualizadas)

   return {
     ...c,
     materias: materiasRecalculadas
   }

 })

 localStorage.setItem("ciclos", JSON.stringify(ciclos))

 renderizarCiclos()

 // animar depois que o DOM for recriado
 setTimeout(()=>{

   ciclos.forEach(c=>{
     c.materias.forEach(m=>{

       const el = document.getElementById(`tempo-${m.id}`)

       if(!el) return

       const antigo = temposAntigos[m.id] ?? m.tempo

       animarTempo(el, antigo, m.tempo)

     })
   })

 },100)

}
// ===============================
// CONTADOR ANIMADO
// ===============================

function animarTempo(elemento, inicio, fim){

 let atual = inicio
 const passo = inicio < fim ? 1 : -1

 const intervalo = setInterval(()=>{

   atual += passo
   elemento.textContent = atual + " min"

   if(atual === fim){
     clearInterval(intervalo)
   }

 },15)

}

// ===============================
// Adicionar ao ciclo atual
// ===============================
function adicionarAoCicloAtual(){

 if(materiasTemp.length === 0){
   alert("Adicione matérias primeiro")
   return
 }

 // se não existir ciclo ainda, cria um
 if(ciclos.length === 0){
   salvarCiclo()
   return
 }

 const cicloAtual = ciclos[ciclos.length - 1]

 // juntar matérias antigas + novas
 const materiasAtualizadas = [
   ...cicloAtual.materias,
   ...materiasTemp
 ]

 // recalcular tempos
 const materiasComTempo = calcularTempos(materiasAtualizadas)

 cicloAtual.materias = materiasComTempo

 // salvar
 localStorage.setItem("ciclos", JSON.stringify(ciclos))

 materiasTemp = []

 renderizarTags()
 renderizarCiclos()

}
// ===============================
// INICIALIZAR
// ===============================

renderizarCiclos()
