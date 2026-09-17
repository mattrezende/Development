import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createSolidMesh, updateSolidDepth, getSolidMetadata, isSculptorSolid, applyViewMode } from "../../src/renderer/geometry/extrude";

const SQUARE: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1]
];

describe("extrude", () => {
  it("creates a solid mesh whose bounding box matches profile x/z and depth y", () => {
    const mesh = createSolidMesh(SQUARE, 2);
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;

    expect(box.max.y - box.min.y).toBeCloseTo(2);
    expect(box.max.x - box.min.x).toBeCloseTo(1);
    expect(box.max.z - box.min.z).toBeCloseTo(1);
  });

  it("flags the created mesh as a sculptor solid with matching metadata", () => {
    const mesh = createSolidMesh(SQUARE, 1.5);
    expect(isSculptorSolid(mesh)).toBe(true);
    expect(getSolidMetadata(mesh).depth).toBe(1.5);
    expect(getSolidMetadata(mesh).profile).toEqual(SQUARE);
  });

  it("regenerates geometry with a new depth on push/pull", () => {
    const mesh = createSolidMesh(SQUARE, 1);
    updateSolidDepth(mesh, 3);

    expect(getSolidMetadata(mesh).depth).toBe(3);
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    expect(box.max.y - box.min.y).toBeCloseTo(3);
  });

  it("supports negative depth (extrude downward) without error", () => {
    const mesh = createSolidMesh(SQUARE, 1);
    updateSolidDepth(mesh, -2);

    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    expect(box.min.y).toBeCloseTo(-2);
    expect(box.max.y).toBeCloseTo(0);
  });

  it("attaches a single edges overlay as a child, regenerated (not duplicated) on push/pull", () => {
    const mesh = createSolidMesh(SQUARE, 1);
    expect(mesh.children).toHaveLength(1);
    expect(mesh.children[0]).toBeInstanceOf(THREE.LineSegments);

    updateSolidDepth(mesh, 2);
    expect(mesh.children).toHaveLength(1);
    expect(mesh.children[0]).toBeInstanceOf(THREE.LineSegments);
  });

  it("applies view modes by toggling material transparency/opacity", () => {
    const mesh = createSolidMesh(SQUARE, 1);
    const material = mesh.material as THREE.MeshLambertMaterial;

    applyViewMode(mesh, "xray");
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBeGreaterThan(0);
    expect(material.opacity).toBeLessThan(1);

    applyViewMode(mesh, "wireframe");
    expect(material.opacity).toBe(0);

    applyViewMode(mesh, "solid");
    expect(material.transparent).toBe(false);
    expect(material.opacity).toBe(1);
  });
});
