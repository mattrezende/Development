import { Tool } from "./Tool";

type ToolChangedListener = (toolId: string) => void;
type BufferChangedListener = (text: string) => void;

const BUFFER_KEYS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", ",", "-"]);

export class ToolManager {
  private tools = new Map<string, Tool>();
  private active: Tool | null = null;
  private domElement: HTMLElement;
  private listeners = new Set<ToolChangedListener>();
  private bufferListeners = new Set<BufferChangedListener>();
  private valueBuffer = "";

  constructor(domElement: HTMLElement, onToolChanged?: ToolChangedListener) {
    this.domElement = domElement;
    if (onToolChanged) this.listeners.add(onToolChanged);

    // Só a ferramenta ativa reage ao botão esquerdo; direito/meio ficam livres
    // para o OrbitControls (rotacionar/panorâmica), evitando conflito de arraste.
    this.domElement.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      this.active?.onPointerDown?.(e);
    });
    this.domElement.addEventListener("pointermove", (e) => {
      this.active?.onPointerMove?.(e);
    });
    this.domElement.addEventListener("pointerup", (e) => {
      if (e.button !== 0) return;
      this.active?.onPointerUp?.(e);
    });
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  // Dígitos/ponto/vírgula/traço alimentam a "VCB" (caixa de valor, estilo SketchUp)
  // em vez de irem para a ferramenta; Enter/Escape decidem entre confirmar/limpar
  // o valor digitado ou seguir o comportamento normal da ferramenta.
  private handleKeyDown(event: KeyboardEvent): void {
    if (BUFFER_KEYS.has(event.key)) {
      event.preventDefault();
      this.valueBuffer += event.key;
      this.notifyBufferChanged();
      return;
    }

    if (event.key === "Backspace" && this.valueBuffer.length > 0) {
      event.preventDefault();
      this.valueBuffer = this.valueBuffer.slice(0, -1);
      this.notifyBufferChanged();
      return;
    }

    if (event.key === "Enter" && this.valueBuffer.length > 0) {
      event.preventDefault();
      const value = this.valueBuffer;
      this.clearBuffer();
      this.active?.onValueCommit?.(value);
      return;
    }

    if (event.key === "Escape" && this.valueBuffer.length > 0) {
      event.preventDefault();
      this.clearBuffer();
      return;
    }

    this.active?.onKeyDown?.(event);
  }

  private clearBuffer(): void {
    this.valueBuffer = "";
    this.notifyBufferChanged();
  }

  private notifyBufferChanged(): void {
    for (const listener of this.bufferListeners) listener(this.valueBuffer);
  }

  onBufferChanged(listener: BufferChangedListener): () => void {
    this.bufferListeners.add(listener);
    return () => this.bufferListeners.delete(listener);
  }

  register(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }

  onToolChanged(listener: ToolChangedListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  activate(toolId: string): void {
    if (this.active?.id === toolId) return;
    const next = this.tools.get(toolId);
    if (!next) throw new Error(`Ferramenta desconhecida: ${toolId}`);

    this.active?.deactivate();
    this.clearBuffer();
    this.active = next;
    this.active.activate();
    for (const listener of this.listeners) listener(toolId);
  }

  getActiveId(): string | undefined {
    return this.active?.id;
  }
}
