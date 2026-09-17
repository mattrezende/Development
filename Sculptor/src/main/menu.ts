import { Menu, BrowserWindow, MenuItemConstructorOptions } from "electron";

export function buildAppMenu(getWindow: () => BrowserWindow | null): void {
  const send = (channel: string) => () => {
    const win = getWindow();
    win?.webContents.send(channel);
  };

  const template: MenuItemConstructorOptions[] = [
    {
      label: "Arquivo",
      submenu: [
        { label: "Novo", accelerator: "CmdOrCtrl+N", click: send("menu:new") },
        { label: "Abrir...", accelerator: "CmdOrCtrl+O", click: send("menu:open") },
        { label: "Salvar", accelerator: "CmdOrCtrl+S", click: send("menu:save") },
        { type: "separator" },
        { label: "Exportar OBJ...", click: send("menu:export-obj") },
        { type: "separator" },
        { role: "quit", label: "Sair" }
      ]
    },
    {
      label: "Editar",
      submenu: [{ role: "undo", label: "Desfazer" }, { role: "redo", label: "Refazer" }]
    },
    {
      label: "Exibir",
      submenu: [
        { role: "reload", label: "Recarregar" },
        { role: "toggleDevTools", label: "Ferramentas do desenvolvedor" }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
