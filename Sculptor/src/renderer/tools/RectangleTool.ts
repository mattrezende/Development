import * as THREE from "three";
import { Tool } from "./Tool";
import { SceneManager } from "../viewport/SceneManager";
import { intersectGroundPlane } from "../geometry/picking";
import { groundPointToProfile, isValidProfile, Profile2D } from "../geometry/profileToShape";
import { snapPointToGrid } from "../geometry/snapping";

export class RectangleTool implements Tool {
  readonly id = "rectangle";
  readonly label = "Retângulo";

  private sceneManager: SceneManager;
  private onProfileComplete: (profile: Profile2D) => void;
  private onInvalidProfile: (reason: string) => void;

  private firstCorner: THREE.Vector3 | null = null;
  private lastOppositeCorner: THREE.Vector3 | null = null;
  private previewLine: THREE.LineLoop | null = null;

  constructor(
    sceneManager: SceneManager,
    onProfileComplete: (profile: Profile2D) => void,
    onInvalidProfile: (reason: string) => void
  ) {
    this.sceneManager = sceneManager;
    this.onProfileComplete = onProfileComplete;
    this.onInvalidProfile = onInvalidProfile;
  }

  activate(): void {
    this.reset();
  }

  deactivate(): void {
    this.reset();
  }

  private reset(): void {
    this.firstCorner = null;
    this.lastOppositeCorner = null;
    if (this.previewLine) {
      this.sceneManager.scene.remove(this.previewLine);
      this.previewLine.geometry.dispose();
      this.previewLine = null;
    }
  }

  onPointerDown(event: PointerEvent): void {
    const raw = intersectGroundPlane(event, this.sceneManager.renderer.domElement, this.sceneManager.camera);
    if (!raw) return;
    const ground = snapPointToGrid(raw);

    if (!this.firstCorner) {
      this.firstCorner = ground;
      return;
    }

    this.commitRectangle(this.firstCorner, ground);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.firstCorner) return;
    const raw = intersectGroundPlane(event, this.sceneManager.renderer.domElement, this.sceneManager.camera);
    if (!raw) return;
    const ground = snapPointToGrid(raw);

    this.lastOppositeCorner = ground;
    this.updatePreview(this.rectangleCorners(this.firstCorner, ground));
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") this.reset();
  }

  /** Confirma largura,profundidade exatas (digitadas na VCB) a partir do primeiro canto. */
  onValueCommit(raw: string): void {
    if (!this.firstCorner) return;

    const parts = raw.split(",").map((p) => parseFloat(p.replace(",", ".")));
    if (parts.length !== 2 || parts.some((n) => !isFinite(n) || n <= 0)) {
      this.onInvalidProfile("Use o formato largura,profundidade (ex: 3,2)");
      return;
    }
    const [width, depth] = parts;

    // Mantém o sentido (direção) em que o usuário já estava mirando o retângulo.
    const signX = this.lastOppositeCorner && this.lastOppositeCorner.x < this.firstCorner.x ? -1 : 1;
    const signZ = this.lastOppositeCorner && this.lastOppositeCorner.z < this.firstCorner.z ? -1 : 1;

    const opposite = new THREE.Vector3(
      this.firstCorner.x + signX * width,
      0,
      this.firstCorner.z + signZ * depth
    );
    this.commitRectangle(this.firstCorner, opposite);
  }

  private commitRectangle(a: THREE.Vector3, b: THREE.Vector3): void {
    const corners = this.rectangleCorners(a, b);
    const profile = corners.map(groundPointToProfile);
    this.reset();

    if (!isValidProfile(profile)) {
      this.onInvalidProfile("Retângulo inválido (largura ou profundidade zero).");
      return;
    }
    this.onProfileComplete(profile);
  }

  private rectangleCorners(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3[] {
    return [
      new THREE.Vector3(a.x, 0, a.z),
      new THREE.Vector3(b.x, 0, a.z),
      new THREE.Vector3(b.x, 0, b.z),
      new THREE.Vector3(a.x, 0, b.z)
    ];
  }

  private updatePreview(points: THREE.Vector3[]): void {
    if (this.previewLine) {
      this.sceneManager.scene.remove(this.previewLine);
      this.previewLine.geometry.dispose();
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.previewLine = new THREE.LineLoop(
      geometry,
      new THREE.LineBasicMaterial({ color: 0xffaa00 })
    );
    this.sceneManager.scene.add(this.previewLine);
  }
}
