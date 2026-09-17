import * as THREE from "three";
import { profileToShape, Profile2D } from "./profileToShape";

/**
 * Metadados guardados em mesh.userData para permitir regenerar a geometria
 * ao invés de editar a malha incrementalmente (ver limitação de push/pull no plano).
 */
export interface SolidMetadata {
  kind: "sculptor-solid";
  profile: Profile2D;
  normal: [number, number, number];
  depth: number;
}

export type ViewMode = "solid" | "xray" | "wireframe";

const DEFAULT_MATERIAL = () =>
  new THREE.MeshLambertMaterial({ color: 0x8fb4d9, side: THREE.DoubleSide });

const EDGE_COLOR = 0x1a1a1a;
const EDGE_THRESHOLD_ANGLE_DEG = 1;

function buildExtrudeGeometry(profile: Profile2D, depth: number): THREE.ExtrudeGeometry {
  const shape = profileToShape(profile);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(Math.abs(depth), 0.001),
    bevelEnabled: false
  });
  // ExtrudeGeometry extruda ao longo de +Z; rotacionamos para que a extrusão
  // aconteça ao longo de +Y (normal do plano do chão) e o perfil fique no plano XZ.
  geometry.rotateX(-Math.PI / 2);
  if (depth < 0) {
    geometry.translate(0, depth, 0);
  }
  return geometry;
}

/** (Re)cria as arestas destacadas do sólido — visual "projetista" com contorno nítido. */
function attachEdgesOverlay(mesh: THREE.Mesh): void {
  const old = mesh.userData.edgesOverlay as THREE.LineSegments | undefined;
  if (old) {
    mesh.remove(old);
    old.geometry.dispose();
    (old.material as THREE.Material).dispose();
  }

  const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry, EDGE_THRESHOLD_ANGLE_DEG);
  const edges = new THREE.LineSegments(edgesGeometry, new THREE.LineBasicMaterial({ color: EDGE_COLOR }));
  mesh.add(edges);
  mesh.userData.edgesOverlay = edges;
}

export function createSolidMesh(profile: Profile2D, depth: number): THREE.Mesh {
  const geometry = buildExtrudeGeometry(profile, depth);
  const mesh = new THREE.Mesh(geometry, DEFAULT_MATERIAL());
  const metadata: SolidMetadata = {
    kind: "sculptor-solid",
    profile,
    normal: [0, 1, 0],
    depth
  };
  mesh.userData.sculptorSolid = metadata;
  attachEdgesOverlay(mesh);
  return mesh;
}

/** Regenera a geometria do sólido com uma nova profundidade (push/pull). */
export function updateSolidDepth(mesh: THREE.Mesh, newDepth: number): void {
  const metadata = mesh.userData.sculptorSolid as SolidMetadata | undefined;
  if (!metadata) throw new Error("Mesh não é um sólido do Sculptor");

  mesh.geometry.dispose();
  mesh.geometry = buildExtrudeGeometry(metadata.profile, newDepth);
  metadata.depth = newDepth;
  attachEdgesOverlay(mesh);
}

export function isSculptorSolid(mesh: THREE.Object3D): mesh is THREE.Mesh {
  return (mesh as THREE.Mesh).isMesh === true && mesh.userData.sculptorSolid !== undefined;
}

export function getSolidMetadata(mesh: THREE.Mesh): SolidMetadata {
  return mesh.userData.sculptorSolid as SolidMetadata;
}

/**
 * Alterna entre Sólido, Raio-X (faces translúcidas, arestas sempre opacas — dá
 * para ver o desenho por trás do sólido) e Aramado (só as arestas, sem faces).
 */
export function applyViewMode(mesh: THREE.Mesh, mode: ViewMode): void {
  const material = mesh.material as THREE.MeshLambertMaterial;

  if (mode === "solid") {
    material.transparent = false;
    material.opacity = 1;
    material.depthWrite = true;
  } else if (mode === "xray") {
    material.transparent = true;
    material.opacity = 0.25;
    material.depthWrite = false;
  } else {
    material.transparent = true;
    material.opacity = 0;
    material.depthWrite = false;
  }
}
