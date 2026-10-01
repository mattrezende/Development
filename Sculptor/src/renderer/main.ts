import * as THREE from "three";
import { SceneManager } from "./viewport/SceneManager";
import { createGroundReferences } from "./viewport/Grid";
import { createOrbitControls } from "./viewport/controls";
import { ToolManager } from "./tools/ToolManager";
import { LineTool } from "./tools/LineTool";
import { RectangleTool } from "./tools/RectangleTool";
import { PushPullTool } from "./tools/PushPullTool";
import { SelectTool } from "./tools/SelectTool";
import { createSolidMesh, applyViewMode, ViewMode } from "./geometry/extrude";
import { Profile2D } from "./geometry/profileToShape";
import { serializeScene, generateSolidId } from "./project/serialize";
import { deserializeScene } from "./project/deserialize";
import { isValidProjectFile } from "./project/ProjectSchema";
import { exportSolidsToObj } from "./project/exportObj";
import { mountToolbar } from "./ui/Toolbar";
import { mountStatusBar } from "./ui/StatusBar";
import { mountDimensionInput } from "./ui/DimensionInput";
import { AppStore } from "./state/appStore";

const DEFAULT_EXTRUDE_DEPTH = 1;

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  solid: "Sólido",
  xray: "Raio-X",
  wireframe: "Aramado"
};

const viewportContainer = document.getElementById("viewport-container")!;
const toolbarContainer = document.getElementById("toolbar")!;
const statusBarContainer = document.getElementById("status-bar")!;
const dimensionInputContainer = document.getElementById("dimension-input")!;

const store = new AppStore();
const sceneManager = new SceneManager(viewportContainer);
createGroundReferences(sceneManager.scene);
const orbitControls = createOrbitControls(sceneManager.camera, sceneManager.renderer.domElement);
sceneManager.onBeforeRender(() => orbitControls.update());

let solids: THREE.Mesh[] = [];
let currentViewMode: ViewMode = "solid";

function addSolid(mesh: THREE.Mesh): void {
  mesh.userData.solidId = mesh.userData.solidId ?? generateSolidId();
  applyViewMode(mesh, currentViewMode);
  solids.push(mesh);
  sceneManager.scene.add(mesh);
}

function handleViewModeChange(mode: ViewMode): void {
  currentViewMode = mode;
  for (const mesh of solids) applyViewMode(mesh, mode);
  store.update({ statusText: `Modo de visualização: ${VIEW_MODE_LABELS[mode]}` });
}

function clearSolids(): void {
  for (const mesh of solids) {
    sceneManager.scene.remove(mesh);
    mesh.geometry.dispose();
  }
  solids = [];
}

function handleProfileComplete(profile: Profile2D): void {
  const mesh = createSolidMesh(profile, DEFAULT_EXTRUDE_DEPTH);
  addSolid(mesh);
  store.update({ statusText: "Sólido criado — use Puxar/Empurrar para ajustar a altura", dirty: true });
  toolManager.activate("pushpull");
}

function handleInvalidProfile(reason: string): void {
  store.update({ statusText: reason });
}

const toolManager = new ToolManager(sceneManager.renderer.domElement, (toolId) => {
  store.update({ activeTool: toolId });
});

const lineTool = new LineTool(sceneManager, handleProfileComplete, handleInvalidProfile);
const rectangleTool = new RectangleTool(sceneManager, handleProfileComplete, handleInvalidProfile);
const pushPullTool = new PushPullTool(
  sceneManager,
  () => solids,
  (_mesh, depth) => {
    store.update({ statusText: `Profundidade: ${depth.toFixed(2)} m`, dirty: true });
  },
  handleInvalidProfile
);
const selectTool = new SelectTool(sceneManager, () => solids, (mesh) => {
  store.update({
    statusText: mesh ? `Selecionado: ${mesh.userData.solidId}` : "Nenhuma seleção"
  });
});

toolManager.register(selectTool);
toolManager.register(lineTool);
toolManager.register(rectangleTool);
toolManager.register(pushPullTool);
toolManager.activate("select");

mountToolbar(toolbarContainer, toolManager, {
  onSave: () => void saveProject(),
  onOpen: () => void openProject(),
  onExportObj: () => void doExportObj(),
  onViewModeChange: handleViewModeChange
});
mountStatusBar(statusBarContainer, store);
mountDimensionInput(dimensionInputContainer, toolManager);

async function saveProject(): Promise<void> {
  const project = serializeScene(solids);
  const result = await window.sculptor.saveProject(project);
  if (result.canceled) return;
  store.update({ statusText: `Projeto salvo em ${result.filePath}`, dirty: false });
}

async function openProject(): Promise<void> {
  const result = await window.sculptor.openProject();
  if (result.canceled) return;

  if (!isValidProjectFile(result.project)) {
    store.update({ statusText: "Arquivo de projeto inválido ou de versão incompatível" });
    return;
  }

  clearSolids();
  const meshes = deserializeScene(result.project);
  for (const mesh of meshes) addSolid(mesh);
  store.update({ statusText: `Projeto carregado de ${result.filePath}`, dirty: false });
}

async function doExportObj(): Promise<void> {
  const objContent = exportSolidsToObj(solids);
  const result = await window.sculptor.exportObj(objContent);
  if (result.canceled) return;
  store.update({ statusText: `Exportado para ${result.filePath}` });
}

function newProject(): void {
  clearSolids();
  store.update({ statusText: "Novo projeto", dirty: false });
}

window.sculptor.onMenu("menu:new", newProject);
window.sculptor.onMenu("menu:save", () => void saveProject());
window.sculptor.onMenu("menu:open", () => void openProject());
window.sculptor.onMenu("menu:export-obj", () => void doExportObj());
