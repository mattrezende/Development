// =============================
// STORAGE
// =============================

const STORAGE_KEY = "watson_flashcards";

let cards = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentCard = null;


// =============================
// UTIL
// =============================

function saveCards() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function uuid() {
    return crypto.randomUUID();
}

function today() {
    return new Date().setHours(0,0,0,0);
}


// =============================
// ADD CARD
// =============================

document.getElementById("addBtn").addEventListener("click", () => {

    const comp = document.getElementById("estudo");
    const value = comp.value;

    if (!value.disciplina || !value.tema) {
        alert("Selecione disciplina e tema");
        return;
    }

    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer").value.trim();

    if (!question || !answer) {
        alert("Preencha pergunta e resposta");
        return;
    }

    const card = {
        id: uuid(),

        deck: value.disciplina,
        topic: value.tema,

        question,
        answer,

        createdAt: Date.now(),
        lastReview: null,

        ease: 2.5,
        interval: 0,
        repetitions: 0,
        dueDate: today()
    };

    cards.push(card);
    saveCards();

    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";

    alert("Card criado com sucesso!");

    loadNextCard();
});


// =============================
// FLIP
// =============================

const flashcard = document.getElementById("flashcard");

flashcard.addEventListener("click", () => {
    flashcard.classList.toggle("flipped");
});


// =============================
// SM-2
// =============================

function updateSM2(card, quality) {

    if (quality < 3) {
        card.repetitions = 0;
        card.interval = 1;
    } else {

        card.repetitions++;

        if (card.repetitions === 1) card.interval = 1;
        else if (card.repetitions === 2) card.interval = 6;
        else card.interval = Math.round(card.interval * card.ease);

    }

    card.ease = Math.max(
        1.3,
        card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const next = new Date();
    next.setDate(next.getDate() + card.interval);

    card.dueDate = next.getTime();
    card.lastReview = Date.now();
}

loadFilteredCard();
// =============================
// BOTÕES DIFICULDADE
// =============================

document.querySelectorAll(".diff").forEach(btn => {

    btn.addEventListener("click", (e) => {

        e.stopPropagation();

        if (!currentCard) return;

        const level = btn.dataset.level;

        let quality = 3;

        if (level === "easy") quality = 5;
        if (level === "medium") quality = 4;
        if (level === "hard") quality = 2;

        updateSM2(currentCard, quality);

        saveCards();

        loadNextCard();
    });

});


// =============================
// FILTRO CARDS VENCIDOS
// =============================

function getDueCards() {

    const now = today();

    return cards.filter(c => c.dueDate <= now);
}


// =============================
// LOAD NEXT
// =============================

function loadNextCard() {

    const due = getDueCards();

    if (due.length === 0) {
        showFinished();
        return;
    }

    currentCard = due[Math.floor(Math.random() * due.length)];

    renderCard(currentCard);
}


// =============================
// RENDER
// =============================

function renderCard(card) {

    flashcard.dataset.id = card.id;

    const title = `${card.deck} • ${card.topic}`;

    document.getElementById("cardDiscipline").innerText = title;
    document.getElementById("cardQuestion").innerText = card.question;

    document.getElementById("cardDisciplineBack").innerText = title;
    document.getElementById("cardAnswer").innerText = card.answer;

    flashcard.classList.remove("flipped");
}


// =============================
// FINALIZADO
// =============================

function showFinished() {

    document.getElementById("cardDiscipline").innerText = "🎉 Revisão concluída";
    document.getElementById("cardQuestion").innerText = "Você terminou os cards de hoje";

    document.getElementById("cardDisciplineBack").innerText = "";
    document.getElementById("cardAnswer").innerText = "Volte amanhã 🚀";

    flashcard.classList.remove("flipped");
}


// =============================
// INIT
// =============================

loadNextCard();


function getTodayCards() {
    const now = new Date().setHours(0,0,0,0);
    return cards.filter(c => c.dueDate <= now);
}

function countToday() {
    return getTodayCards().length;
}

function renderTodayCounter() {
    document.getElementById("todayCounter").innerText =
        `Cards para hoje: ${countToday()}`;

        //preciso dar um display none no main quando abrir os cards do dia
}

function startTodayStudy() {
    filteredStudyCards = getTodayCards();
    loadFilteredCard();
}



function groupCards() {

    const map = {};

    cards.forEach(card => {

        if (!map[card.deck]) map[card.deck] = {};
        if (!map[card.deck][card.topic]) map[card.deck][card.topic] = [];

        map[card.deck][card.topic].push(card);

    });

    return map;
}

function renderLibrary() {

    const container = document.getElementById("library");
    const grouped = groupCards();

    container.innerHTML = "";

    Object.keys(grouped).forEach(deck => {

        const deckDiv = document.createElement("div");
        deckDiv.className = "deck";

        deckDiv.innerHTML = `<h3>${deck}</h3>`;

        Object.keys(grouped[deck]).forEach(topic => {

            const topicDiv = document.createElement("div");
            topicDiv.className = "topic";

            topicDiv.innerHTML =
                `<strong>${topic}</strong> (${grouped[deck][topic].length})`;

            topicDiv.onclick = () => startFilteredStudy(deck, topic);

            deckDiv.appendChild(topicDiv);
        });

        container.appendChild(deckDiv);
    });
}


let filteredStudyCards = [];

function startFilteredStudy(deck = null, topic = null) {

    const now = new Date().setHours(0,0,0,0);

    filteredStudyCards = cards.filter(card => {

        if (deck && card.deck !== deck) return false;
        if (topic && card.topic !== topic) return false;

        return card.dueDate <= now;

    });

    loadFilteredCard();
}

function loadFilteredCard() {

    if (filteredStudyCards.length === 0) {
        showFinished();
        return;
    }

    currentCard = filteredStudyCards.pop();
    renderCard(currentCard);
}

renderTodayCounter();
renderLibrary();
loadNextCard();