import { ipcMain, dialog, BrowserWindow } from "electron";
import { promises as fs } from "fs";
import { IpcChannels } from "../../shared/ipcChannels";
import type {
  ProjectFile,
  SaveProjectResult,
  OpenProjectResult,
  ExportObjResult
} from "../../shared/types";

export function registerFileHandlers(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle(
    IpcChannels.saveProject,
    async (_event, project: ProjectFile): Promise<SaveProjectResult> => {
      const win = getWindow();
      if (!win) return { canceled: true };

      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: "Salvar projeto Sculptor",
        defaultPath: "projeto.sculptor",
        filters: [{ name: "Projeto Sculptor", extensions: ["sculptor"] }]
      });
      if (canceled || !filePath) return { canceled: true };

      await fs.writeFile(filePath, JSON.stringify(project, null, 2), "utf-8");
      return { canceled: false, filePath };
    }
  );

  ipcMain.handle(IpcChannels.openProject, async (): Promise<OpenProjectResult> => {
    const win = getWindow();
    if (!win) return { canceled: true };

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: "Abrir projeto Sculptor",
      properties: ["openFile"],
      filters: [{ name: "Projeto Sculptor", extensions: ["sculptor"] }]
    });
    if (canceled || filePaths.length === 0) return { canceled: true };

    const filePath = filePaths[0];
    const raw = await fs.readFile(filePath, "utf-8");
    const project = JSON.parse(raw) as ProjectFile;
    return { canceled: false, filePath, project };
  });

  ipcMain.handle(
    IpcChannels.exportObj,
    async (_event, objContent: string): Promise<ExportObjResult> => {
      const win = getWindow();
      if (!win) return { canceled: true };

      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: "Exportar OBJ",
        defaultPath: "modelo.obj",
        filters: [{ name: "Wavefront OBJ", extensions: ["obj"] }]
      });
      if (canceled || !filePath) return { canceled: true };

      await fs.writeFile(filePath, objContent, "utf-8");
      return { canceled: false, filePath };
    }
  );
}
