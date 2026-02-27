const pagesList = document.getElementById("pagesList");
const newPageBtn = document.getElementById("newPageBtn");

const titleInput = document.getElementById("pageTitle");
const contentInput = document.getElementById("pageContent");
const deleteBtn = document.getElementById("deleteBtn");

let pages = JSON.parse(localStorage.getItem("cadernoPages")) || [];
let currentPageId = null;



function saveStorage() {
    localStorage.setItem("cadernoPages", JSON.stringify(pages));
}



function renderPages() {

    pagesList.innerHTML = "";

    pages.forEach(page => {

        const li = document.createElement("li");
        li.textContent = page.title || "Sem título";

        if (page.id === currentPageId) {
            li.classList.add("active");
        }

        li.onclick = () => loadPage(page.id);

        pagesList.appendChild(li);
    });
}



function createPage() {

    const newPage = {
        id: Date.now(),
        title: "Nova Página",
        content: ""
    };

    pages.push(newPage);
    currentPageId = newPage.id;

    saveStorage();
    renderPages();
    loadPage(currentPageId);
}



function loadPage(id) {

    const page = pages.find(p => p.id === id);
    if (!page) return;

    currentPageId = id;

    titleInput.value = page.title;
    contentInput.value = page.content;

    renderPages();
}



function updatePage() {

    const page = pages.find(p => p.id === currentPageId);
    if (!page) return;

    page.title = titleInput.value;
    page.content = contentInput.value;

    saveStorage();
    renderPages();
}



function deletePage() {

    if (!currentPageId) return;

    pages = pages.filter(p => p.id !== currentPageId);

    currentPageId = pages.length ? pages[0].id : null;

    saveStorage();
    renderPages();

    if (currentPageId) {
        loadPage(currentPageId);
    } else {
        titleInput.value = "";
        contentInput.value = "";
    }
}



/* EVENTOS */

newPageBtn.onclick = createPage;

titleInput.oninput = updatePage;
contentInput.oninput = updatePage;

deleteBtn.onclick = deletePage;



/* INIT */

if (pages.length) {
    loadPage(pages[0].id);
}

renderPages();
