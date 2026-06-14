let cards = JSON.parse(localStorage.getItem("cards")) || [];

let todayCards = [];
let currentIndex = 0;
let totalSessionCards = 0;
let activeDiscipline = "";

const dashboard = document.getElementById("dashboardArea");
const flashcardContainer = document.getElementById("flashcardContainer");
const flashcard = document.getElementById("flashcard");
const front = document.querySelector(".front");
const back = document.querySelector(".back");
const reviewButtons = document.getElementById("reviewButtons");


function saveCard(card) {
  const cards = JSON.parse(localStorage.getItem("flashcards")) || [];
  cards.push(card);
  localStorage.setItem("flashcards", JSON.stringify(cards));
}

function startTodayStudy(){

  dashboard.style.display = "none";
  flashcardContainer.classList.remove("hidden");

  const today = new Date().toISOString().split("T")[0];

  todayCards = cards.filter(c => c.nextReview <= today);

  currentIndex = 0;
  showCard();
}

function showCard(){

  if(todayCards.length === 0){
    alert("Sessão finalizada!");
    location.reload();
    return;
  }

  let card = todayCards[0];

  front.innerText = card.question;
  back.innerText = card.answer;

  flashcard.classList.remove("flipped");
  reviewButtons.classList.add("hidden");

  updateSessionInfo();
}

function reviewCard(quality){

  let card = todayCards.shift(); // remove da frente

  if(quality === 0){

    // ERROU → volta para o final da fila
    todayCards.push(card);

  } else {

    if(card.repetitions === 0){
      card.interval = 1;
    } else if(card.repetitions === 1){
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }

    card.repetitions++;

    card.easeFactor = card.easeFactor + 
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if(card.easeFactor < 1.3){
      card.easeFactor = 1.3;
    }

    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.interval);

    card.nextReview = nextDate.toISOString().split("T")[0];
  }

  localStorage.setItem("cards", JSON.stringify(cards));

  showCard();
}

function startCurrentStudy(){

  const selectedDiscipline = document.getElementById("materiaSelect").value;

  if(!selectedDiscipline){
    alert("Selecione uma disciplina.");
    return;
  }

  dashboard.style.display = "none";
  flashcardContainer.classList.remove("hidden");

  activeDiscipline = selectedDiscipline;

  todayCards = cards.filter(c =>
    c.discipline === selectedDiscipline
  );

  totalSessionCards = todayCards.length;

  document.getElementById("activeDiscipline").innerText =
    "Disciplina: " + activeDiscipline;

  showCard();
}

function updateSessionInfo(){

  document.getElementById("remainingCount").innerText =
    "Restantes: " + todayCards.length;

  let progress =
    ((totalSessionCards - todayCards.length) / totalSessionCards) * 100;

  document.getElementById("progressFill").style.width =
    progress + "%";
}

flashcard.addEventListener("click", () => {
  flashcard.classList.toggle("flipped");
  reviewButtons.classList.toggle("hidden");
});

document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("newCard");
  const openBtn = document.getElementById("openSidebar");
  const overlay = document.getElementById("overlay");

  if (openBtn && sidebar && overlay) {

    openBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });

  }

});

document.addEventListener("DOMContentLoaded", () => {

  const addBtn = document.getElementById("addBtn");

  if (!addBtn) return;

  addBtn.addEventListener("click", () => {

    const estudo = document.getElementById("estudo");
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer").value.trim();

    if (!question || !answer) {
      alert("Preencha pergunta e resposta!");
      return;
    }

    // Pegando disciplina e tema do seu componente
    const { disciplina, tema } = estudo.value;

    if (!disciplina || !tema) {
      alert("Selecione disciplina e tema.");
      return;
    }

    const newCard = {
      id: crypto.randomUUID(),
      disciplina,
      tema,
      question,
      answer,

      // SM-2
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      dueDate: Date.now()
    };

    saveCard(newCard);

    alert("Card salvo com sucesso!");

    // limpar campos
    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";
  });

});

JSON.parse(localStorage.getItem("flashcards"))
console.log("Flashcards JS carregado completamente");