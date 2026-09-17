import * as THREE from "three";

export type AxisLock = "x" | "z" | null;

const AXIS_LOCK_TOLERANCE_DEG = 5;
const GRID_SNAP_STEP = 0.01;

function angleDeg(dx: number, dz: number): number {
  let a = Math.atan2(dz, dx) * (180 / Math.PI);
  if (a < 0) a += 360;
  return a;
}

export function snapToGridValue(value: number, step = GRID_SNAP_STEP): number {
  return Math.round(value / step) * step;
}

export function snapPointToGrid(point: THREE.Vector3, step = GRID_SNAP_STEP): THREE.Vector3 {
  return new THREE.Vector3(snapToGridValue(point.x, step), 0, snapToGridValue(point.z, step));
}

/**
 * Trava a direção de `candidate` (relativa a `reference`) no eixo X ou Z quando o
 * ângulo estiver a poucos graus de um dos eixos — inferência similar à do
 * SketchUp para desenhar segmentos perfeitamente alinhados aos eixos.
 * Sem `reference` (primeiro ponto de um traçado), só aplica o snap de grade.
 */
export function snapToAxis(
  reference: THREE.Vector3 | null,
  candidate: THREE.Vector3
): { point: THREE.Vector3; axis: AxisLock } {
  if (!reference) {
    return { point: snapPointToGrid(candidate), axis: null };
  }

  const dx = candidate.x - reference.x;
  const dz = candidate.z - reference.z;
  if (Math.abs(dx) < 1e-6 && Math.abs(dz) < 1e-6) {
    return { point: snapPointToGrid(candidate), axis: null };
  }

  const angle = angleDeg(dx, dz);
  const nearestCardinal = Math.round(angle / 90) * 90;
  const delta = Math.abs(angle - nearestCardinal);

  if (delta <= AXIS_LOCK_TOLERANCE_DEG) {
    const isXAxis = nearestCardinal % 180 === 0;
    const locked = isXAxis
      ? new THREE.Vector3(candidate.x, 0, reference.z)
      : new THREE.Vector3(reference.x, 0, candidate.z);
    return { point: snapPointToGrid(locked), axis: isXAxis ? "x" : "z" };
  }

  return { point: snapPointToGrid(candidate), axis: null };
}
