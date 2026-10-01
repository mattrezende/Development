export interface AppState {
  activeTool: string;
  statusText: string;
  dirty: boolean;
}

type Listener = (state: AppState) => void;

export class AppStore {
  private state: AppState = { activeTool: "select", statusText: "Pronto", dirty: false };
  private listeners = new Set<Listener>();

  getState(): AppState {
    return this.state;
  }

  update(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) listener(this.state);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
