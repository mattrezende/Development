import * as THREE from "three";
import { Tool } from "./Tool";
import { SceneManager } from "../viewport/SceneManager";
import { raycastFromPointer, pointerToNDC, isCapFaceNormal } from "../geometry/picking";
import { isSculptorSolid, getSolidMetadata, updateSolidDepth } from "../geometry/extrude";

const ANCHOR_EPSILON = 1e-4;

interface DragState {
  mesh: THREE.Mesh;
  axis: THREE.Vector3;
  initialDepth: number;
  currentDepth: number;
  dragPlane: THREE.Plane;
  dragStartPoint: THREE.Vector3;
}

/**
 * Só permite push/pull nas faces de topo/base originais do sólido (não em
 * faces laterais nem em sólidos já modificados por outra operação) — ver
 * limitação de escopo do MVP aprovada no plano.
 */
export class PushPullTool implements Tool {
  readonly id = "pushpull";
  readonly label = "Puxar/Empurrar";

  private sceneManager: SceneManager;
  private getSolids: () => THREE.Object3D[];
  private onDepthChanged?: (mesh: THREE.Mesh, depth: number) => void;
  private onInvalidValue?: (reason: string) => void;

  private drag: DragState | null = null;

  constructor(
    sceneManager: SceneManager,
    getSolids: () => THREE.Object3D[],
    onDepthChanged?: (mesh: THREE.Mesh, depth: number) => void,
    onInvalidValue?: (reason: string) => void
  ) {
    this.sceneManager = sceneManager;
    this.getSolids = getSolids;
    this.onDepthChanged = onDepthChanged;
    this.onInvalidValue = onInvalidValue;
  }

  activate(): void {}

  deactivate(): void {
    this.drag = null;
  }

  onPointerDown(event: PointerEvent): void {
    const domElement = this.sceneManager.renderer.domElement;
    const hits = raycastFromPointer(event, domElement, this.sceneManager.camera, this.getSolids());
    const hit = hits.find((h) => isSculptorSolid(h.object) && h.face);
    if (!hit || !hit.face) return;

    const mesh = hit.object as THREE.Mesh;
    const metadata = getSolidMetadata(mesh);
    const axis = new THREE.Vector3(...metadata.normal);

    const worldNormal = hit.face.normal.clone().transformDirection(mesh.matrixWorld).normalize();
    if (!isCapFaceNormal(worldNormal, metadata.normal)) return;

    const localHit = mesh.worldToLocal(hit.point.clone());
    const distToFar = Math.abs(localHit.y - metadata.depth);
    const distToAnchor = Math.abs(localHit.y - 0);
    if (distToAnchor < distToFar + ANCHOR_EPSILON) {
      // Face ancorada ao plano de origem do perfil: não editável nesta versão.
      return;
    }

    const eye = new THREE.Vector3()
      .subVectors(this.sceneManager.camera.position, hit.point)
      .normalize();
    let planeAxis = axis.clone();
    if (Math.abs(planeAxis.dot(eye)) > 0.999) {
      planeAxis = new THREE.Vector3(1, 0, 0);
    }
    const tangent = new THREE.Vector3().crossVectors(planeAxis, eye);
    const planeNormal = new THREE.Vector3().crossVectors(tangent, planeAxis).normalize();
    const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, hit.point);

    this.drag = {
      mesh,
      axis,
      initialDepth: metadata.depth,
      currentDepth: metadata.depth,
      dragPlane,
      dragStartPoint: hit.point.clone()
    };
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.drag) return;
    const domElement = this.sceneManager.renderer.domElement;
    const ndc = pointerToNDC(event, domElement);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, this.sceneManager.camera);

    const hitPoint = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(this.drag.dragPlane, hitPoint)) return;

    const deltaAlongAxis = hitPoint.clone().sub(this.drag.dragStartPoint).dot(this.drag.axis);
    const newDepth = this.drag.initialDepth + deltaAlongAxis;

    this.drag.currentDepth = newDepth;
    updateSolidDepth(this.drag.mesh, newDepth);
    this.onDepthChanged?.(this.drag.mesh, newDepth);
  }

  onPointerUp(): void {
    this.drag = null;
  }

  /** Confirma uma profundidade exata (digitada na VCB), mantendo o sentido do arraste atual. */
  onValueCommit(raw: string): void {
    if (!this.drag) return;

    const value = parseFloat(raw.replace(",", "."));
    if (!isFinite(value) || value <= 0) {
      this.onInvalidValue?.("Valor de profundidade inválido");
      return;
    }

    const sign = Math.sign(this.drag.currentDepth - this.drag.initialDepth) || 1;
    const newDepth = this.drag.initialDepth + sign * value;

    updateSolidDepth(this.drag.mesh, newDepth);
    this.onDepthChanged?.(this.drag.mesh, newDepth);
    this.drag = null;
  }
}
