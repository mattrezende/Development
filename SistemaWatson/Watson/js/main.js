import { state } from "./state.js";
import { inicializarCiclo } from "./ciclo.engine.js";
import { iniciarTimer, pararTimer } from "./timer.service.js";
import { atualizarUI } from "./ui.controller.js";

inicializarCiclo();
atualizarUI();

document.getElementById("start").addEventListener("click", iniciarTimer);
document.getElementById("stop").addEventListener("click", pararTimer);