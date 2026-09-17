import { ToolManager } from "../tools/ToolManager";
import { ViewMode } from "../geometry/extrude";

export interface ToolbarActions {
  onSave: () => void;
  onOpen: () => void;
  onExportObj: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const TOOL_BUTTONS: Array<{ id: string; label: string }> = [
  { id: "select", label: "Selecionar" },
  { id: "line", label: "Linha" },
  { id: "rectangle", label: "Retângulo" },
  { id: "pushpull", label: "Puxar/Empurrar" }
];

const VIEW_MODE_OPTIONS: Array<{ value: ViewMode; label: string }> = [
  { value: "solid", label: "Sólido" },
  { value: "xray", label: "Raio-X" },
  { value: "wireframe", label: "Aramado" }
];

function addSeparator(container: HTMLElement): void {
  const separator = document.createElement("span");
  separator.style.width = "12px";
  container.appendChild(separator);
}

export function mountToolbar(
  container: HTMLElement,
  toolManager: ToolManager,
  actions: ToolbarActions
): void {
  const buttons = new Map<string, HTMLButtonElement>();

  const setActiveButton = (toolId: string) => {
    for (const [id, btn] of buttons) {
      btn.classList.toggle("active", id === toolId);
    }
  };

  for (const { id, label } of TOOL_BUTTONS) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.addEventListener("click", () => toolManager.activate(id));
    buttons.set(id, btn);
    container.appendChild(btn);
  }
  toolManager.onToolChanged(setActiveButton);

  addSeparator(container);

  const viewModeSelect = document.createElement("select");
  viewModeSelect.title = "Modo de visualização";
  for (const { value, label } of VIEW_MODE_OPTIONS) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    viewModeSelect.appendChild(option);
  }
  viewModeSelect.addEventListener("change", () => {
    actions.onViewModeChange(viewModeSelect.value as ViewMode);
  });
  container.appendChild(viewModeSelect);

  addSeparator(container);

  const addActionButton = (label: string, onClick: () => void) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    container.appendChild(btn);
  };

  addActionButton("Abrir", actions.onOpen);
  addActionButton("Salvar", actions.onSave);
  addActionButton("Exportar OBJ", actions.onExportObj);

  setActiveButton(toolManager.getActiveId() ?? "select");
}
