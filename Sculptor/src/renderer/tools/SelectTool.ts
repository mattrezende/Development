import * as THREE from "three";
import { Tool } from "./Tool";
import { SceneManager } from "../viewport/SceneManager";
import { raycastFromPointer } from "../geometry/picking";
import { isSculptorSolid } from "../geometry/extrude";

const HIGHLIGHT_COLOR = 0xff8800;

export class SelectTool implements Tool {
  readonly id = "select";
  readonly label = "Selecionar";

  private sceneManager: SceneManager;
  private getSolids: () => THREE.Object3D[];
  private onSelectionChanged: (mesh: THREE.Mesh | null) => void;

  private selected: THREE.Mesh | null = null;
  private originalEmissive: THREE.Color | null = null;

  constructor(
    sceneManager: SceneManager,
    getSolids: () => THREE.Object3D[],
    onSelectionChanged: (mesh: THREE.Mesh | null) => void
  ) {
    this.sceneManager = sceneManager;
    this.getSolids = getSolids;
    this.onSelectionChanged = onSelectionChanged;
  }

  activate(): void {}

  deactivate(): void {
    this.clearSelection();
  }

  onPointerDown(event: PointerEvent): void {
    const hits = raycastFromPointer(
      event,
      this.sceneManager.renderer.domElement,
      this.sceneManager.camera,
      this.getSolids()
    );
    const hit = hits.find((h) => isSculptorSolid(h.object));

    this.clearSelection();
    if (hit && isSculptorSolid(hit.object)) {
      this.select(hit.object as THREE.Mesh);
    } else {
      this.onSelectionChanged(null);
    }
  }

  private select(mesh: THREE.Mesh): void {
    this.selected = mesh;
    const material = mesh.material as THREE.MeshLambertMaterial;
    this.originalEmissive = material.emissive.clone();
    material.emissive.setHex(HIGHLIGHT_COLOR);
    this.onSelectionChanged(mesh);
  }

  private clearSelection(): void {
    if (this.selected && this.originalEmissive) {
      const material = this.selected.material as THREE.MeshStandardMaterial;
      material.emissive.copy(this.originalEmissive);
    }
    this.selected = null;
    this.originalEmissive = null;
  }
}
