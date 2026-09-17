import { AppStore } from "../state/appStore";

export function mountStatusBar(container: HTMLElement, store: AppStore): void {
  const render = () => {
    const { activeTool, statusText, dirty } = store.getState();
    container.textContent = `Ferramenta: ${activeTool} — ${statusText}${dirty ? " *" : ""}`;
  };
  store.subscribe(render);
  render();
}
