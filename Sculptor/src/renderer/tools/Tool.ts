export interface ToolContext {
  domElement: HTMLElement;
}

export interface Tool {
  readonly id: string;
  readonly label: string;
  activate(): void;
  deactivate(): void;
  onPointerDown?(event: PointerEvent): void;
  onPointerMove?(event: PointerEvent): void;
  onPointerUp?(event: PointerEvent): void;
  onKeyDown?(event: KeyboardEvent): void;
  /** Chamado pelo ToolManager quando o usuário digita um valor (VCB) e pressiona Enter. */
  onValueCommit?(raw: string): void;
}
