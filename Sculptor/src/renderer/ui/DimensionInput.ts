import { ToolManager } from "../tools/ToolManager";

/** Mostra a "VCB" (caixa de valor, estilo SketchUp) com o número sendo digitado. */
export function mountDimensionInput(container: HTMLElement, toolManager: ToolManager): void {
  toolManager.onBufferChanged((text) => {
    container.textContent = text;
    container.classList.toggle("hidden", text.length === 0);
  });
}
