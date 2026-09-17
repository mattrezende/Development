import * as THREE from "three";
import type { ProjectFile, SolidRecord } from "../../shared/types";
import { isSculptorSolid, getSolidMetadata } from "../geometry/extrude";

let nextId = 1;
export function generateSolidId(): string {
  return `solid-${nextId++}`;
}

export function serializeSolid(mesh: THREE.Mesh): SolidRecord {
  const metadata = getSolidMetadata(mesh);
  const material = mesh.material as THREE.MeshLambertMaterial;

  return {
    id: (mesh.userData.solidId as string | undefined) ?? generateSolidId(),
    profile: metadata.profile,
    normal: metadata.normal,
    depth: metadata.depth,
    transform: {
      position: mesh.position.toArray() as [number, number, number],
      rotation: mesh.quaternion.toArray() as [number, number, number, number],
      scale: mesh.scale.toArray() as [number, number, number]
    },
    color: material.color ? `#${material.color.getHexString()}` : undefined
  };
}

export function serializeScene(solids: THREE.Object3D[]): ProjectFile {
  const records = solids.filter(isSculptorSolid).map(serializeSolid);
  return { formatVersion: 1, units: "meters", solids: records };
}
