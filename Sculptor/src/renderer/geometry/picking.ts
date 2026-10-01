import * as THREE from "three";

export function pointerToNDC(
  event: PointerEvent,
  domElement: HTMLElement
): THREE.Vector2 {
  const rect = domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  return new THREE.Vector2(x, y);
}

export function raycastFromPointer(
  event: PointerEvent,
  domElement: HTMLElement,
  camera: THREE.Camera,
  targets: THREE.Object3D[]
): THREE.Intersection[] {
  const ndc = pointerToNDC(event, domElement);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);
  return raycaster.intersectObjects(targets, false);
}

export function intersectGroundPlane(
  event: PointerEvent,
  domElement: HTMLElement,
  camera: THREE.Camera,
  planeY = 0
): THREE.Vector3 | null {
  const ndc = pointerToNDC(event, domElement);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(ndc, camera);

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
  const point = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(plane, point);
  return hit ? point : null;
}

const CAP_NORMAL_TOLERANCE = 0.05;

/** Só permite push/pull nas faces de topo/base originais do sólido (ver limitação do MVP). */
export function isCapFaceNormal(worldNormal: THREE.Vector3, solidNormal: [number, number, number]): boolean {
  const axis = new THREE.Vector3(...solidNormal).normalize();
  const dot = Math.abs(worldNormal.dot(axis));
  return dot > 1 - CAP_NORMAL_TOLERANCE;
}
