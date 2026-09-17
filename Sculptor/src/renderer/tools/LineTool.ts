import * as THREE from "three";
import { Tool } from "./Tool";
import { SceneManager } from "../viewport/SceneManager";
import { intersectGroundPlane } from "../geometry/picking";
import { groundPointToProfile, isValidProfile, Profile2D } from "../geometry/profileToShape";
import { snapToAxis, AxisLock } from "../geometry/snapping";

const CLOSE_SNAP_PIXELS = 12;

const COLOR_FREE = 0xffaa00;
const COLOR_X_LOCK = 0xff4444;
const COLOR_Z_LOCK = 0x4477ff;

function colorForAxis(axis: AxisLock): number {
  if (axis === "x") return COLOR_X_LOCK;
  if (axis === "z") return COLOR_Z_LOCK;
  return COLOR_FREE;
}

export class LineTool implements Tool {
  readonly id = "line";
  readonly label = "Linha";

  private sceneManager: SceneManager;
  private onProfileComplete: (profile: Profile2D) => void;
  private onInvalidProfile: (reason: string) => void;

  private points: THREE.Vector3[] = [];
  private previewLine: THREE.Line | null = null;
  private previewMaterial: THREE.LineBasicMaterial | null = null;
  private pointMarkers: THREE.Mesh[] = [];
  private lastPreviewPoint: THREE.Vector3 | null = null;

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
    this.points = [];
    this.lastPreviewPoint = null;
    if (this.previewLine) {
      this.sceneManager.scene.remove(this.previewLine);
      this.previewLine.geometry.dispose();
      this.previewLine = null;
      this.previewMaterial = null;
    }
    for (const marker of this.pointMarkers) {
      this.sceneManager.scene.remove(marker);
      marker.geometry.dispose();
    }
    this.pointMarkers = [];
  }

  onPointerDown(event: PointerEvent): void {
    const raw = intersectGroundPlane(event, this.sceneManager.renderer.domElement, this.sceneManager.camera);
    if (!raw) return;

    if (this.points.length >= 3 && this.isNearStart(event, raw)) {
      this.finish();
      return;
    }

    const reference = this.points.length > 0 ? this.points[this.points.length - 1] : null;
    const { point } = snapToAxis(reference, raw);
    this.commitPoint(point);
  }

  onPointerMove(event: PointerEvent): void {
    if (this.points.length === 0) return;
    const raw = intersectGroundPlane(event, this.sceneManager.renderer.domElement, this.sceneManager.camera);
    if (!raw) return;

    const reference = this.points[this.points.length - 1];
    const { point, axis } = snapToAxis(reference, raw);
    this.lastPreviewPoint = point;
    this.updatePreview([...this.points, point], axis);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter") this.finish();
    if (event.key === "Escape") this.reset();
  }

  /** Confirma um comprimento exato (digitado na VCB) na direção atualmente mirada. */
  onValueCommit(raw: string): void {
    if (this.points.length === 0 || !this.lastPreviewPoint) return;

    const length = parseFloat(raw.replace(",", "."));
    if (!isFinite(length) || length <= 0) {
      this.onInvalidProfile("Valor de comprimento inválido");
      return;
    }

    const reference = this.points[this.points.length - 1];
    const direction = this.lastPreviewPoint.clone().sub(reference);
    if (direction.lengthSq() < 1e-12) return;
    direction.normalize();

    const newPoint = reference.clone().add(direction.multiplyScalar(length));
    this.commitPoint(newPoint);
  }

  private commitPoint(point: THREE.Vector3): void {
    this.points.push(point);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    marker.position.copy(point);
    this.sceneManager.scene.add(marker);
    this.pointMarkers.push(marker);
  }

  private isNearStart(event: PointerEvent, groundPoint: THREE.Vector3): boolean {
    const start = this.points[0];
    const startScreen = start.clone().project(this.sceneManager.camera);
    const rect = this.sceneManager.renderer.domElement.getBoundingClientRect();
    const startPx = {
      x: ((startScreen.x + 1) / 2) * rect.width + rect.left,
      y: ((1 - startScreen.y) / 2) * rect.height + rect.top
    };
    const dx = event.clientX - startPx.x;
    const dy = event.clientY - startPx.y;
    return Math.sqrt(dx * dx + dy * dy) <= CLOSE_SNAP_PIXELS;
  }

  private updatePreview(points: THREE.Vector3[], axis: AxisLock): void {
    if (this.previewLine) {
      this.sceneManager.scene.remove(this.previewLine);
      this.previewLine.geometry.dispose();
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    if (!this.previewMaterial) {
      this.previewMaterial = new THREE.LineBasicMaterial({ color: colorForAxis(axis) });
    } else {
      this.previewMaterial.color.setHex(colorForAxis(axis));
    }
    this.previewLine = new THREE.Line(geometry, this.previewMaterial);
    this.sceneManager.scene.add(this.previewLine);
  }

  private finish(): void {
    const profile = this.points.map(groundPointToProfile);
    this.reset();

    if (!isValidProfile(profile)) {
      this.onInvalidProfile("Perfil inválido: precisa ser um polígono simples e não degenerado.");
      return;
    }
    this.onProfileComplete(profile);
  }
}
