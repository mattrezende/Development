import * as THREE from "three";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";

export function exportSolidsToObj(solids: THREE.Object3D[]): string {
  const group = new THREE.Group();
  // Clona só a malha (sem o overlay de arestas, que é uma LineSegments filha
  // usada apenas para o desenho na tela) para manter o OBJ exportado limpo.
  for (const solid of solids) {
    if (!(solid instanceof THREE.Mesh)) continue;
    const mesh = new THREE.Mesh(solid.geometry, solid.material);
    mesh.position.copy(solid.position);
    mesh.quaternion.copy(solid.quaternion);
    mesh.scale.copy(solid.scale);
    group.add(mesh);
  }

  const exporter = new OBJExporter();
  return exporter.parse(group);
}
