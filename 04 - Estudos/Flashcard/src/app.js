import Sidebar from "./components/Sidebar.js";
import DeckList from "./components/DeckList.js";
import StudyArea from "./components/StudyArea.js";

const app = document.getElementById("app");

app.innerHTML = `
  <div class="layout">
      <div id="sidebar"></div>
      <div id="main"></div>
  </div>
`;

new Sidebar(document.getElementById("sidebar"));
new DeckList(document.getElementById("main"));