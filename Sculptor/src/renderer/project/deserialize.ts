import * as THREE from "three";
import type { ProjectFile, SolidRecord } from "../../shared/types";
import { createSolidMesh } from "../geometry/extrude";

export function deserializeSolid(record: SolidRecord): THREE.Mesh {
  const mesh = createSolidMesh(record.profile, record.depth);

  mesh.position.fromArray(record.transform.position);
  mesh.quaternion.fromArray(record.transform.rotation);
  mesh.scale.fromArray(record.transform.scale);
  mesh.userData.solidId = record.id;

  if (record.color) {
    (mesh.material as THREE.MeshLambertMaterial).color.set(record.color);
  }

  return mesh;
}

export function deserializeScene(project: ProjectFile): THREE.Mesh[] {
  return project.solids.map(deserializeSolid);
}
