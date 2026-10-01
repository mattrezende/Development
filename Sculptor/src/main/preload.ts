import { contextBridge, ipcRenderer } from "electron";
import type {
  ProjectFile,
  SaveProjectResult,
  OpenProjectResult,
  ExportObjResult
} from "../shared/types";

// Constantes de canal duplicadas de shared/ipcChannels.ts (não importadas por valor):
// o preload roda em sandbox e seu `require` só resolve módulos nativos/do Electron,
// não arquivos locais do projeto via caminho relativo.
const Channels = {
  saveProject: "project:save",
  openProject: "project:open",
  exportObj: "project:export-obj"
} as const;

const sculptorApi = {
  saveProject: (project: ProjectFile): Promise<SaveProjectResult> =>
    ipcRenderer.invoke(Channels.saveProject, project),
  openProject: (): Promise<OpenProjectResult> =>
    ipcRenderer.invoke(Channels.openProject),
  exportObj: (objContent: string): Promise<ExportObjResult> =>
    ipcRenderer.invoke(Channels.exportObj, objContent),
  onMenu: (channel: "menu:new" | "menu:open" | "menu:save" | "menu:export-obj", listener: () => void) => {
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  }
};

contextBridge.exposeInMainWorld("sculptor", sculptorApi);

export type SculptorApi = typeof sculptorApi;
