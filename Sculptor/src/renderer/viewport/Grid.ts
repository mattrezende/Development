import * as THREE from "three";

export function createGroundReferences(scene: THREE.Scene): void {
  const grid = new THREE.GridHelper(20, 20, 0x666666, 0x333333);
  scene.add(grid);

  const axes = new THREE.AxesHelper(3);
  scene.add(axes);
}
