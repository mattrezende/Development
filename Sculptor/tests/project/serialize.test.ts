import { describe, it, expect } from "vitest";
import { createSolidMesh } from "../../src/renderer/geometry/extrude";
import { serializeScene } from "../../src/renderer/project/serialize";
import { deserializeScene } from "../../src/renderer/project/deserialize";
import { isValidProjectFile, createEmptyProject } from "../../src/renderer/project/ProjectSchema";
import { getSolidMetadata } from "../../src/renderer/geometry/extrude";

const SQUARE: [number, number][] = [
  [0, 0],
  [2, 0],
  [2, 1],
  [0, 1]
];

describe("serialize/deserialize round-trip", () => {
  it("round-trips a scene through JSON and back to equivalent solids", () => {
    const mesh = createSolidMesh(SQUARE, 2.5);
    mesh.position.set(1, 0, -3);

    const project = serializeScene([mesh]);
    const json = JSON.parse(JSON.stringify(project));

    expect(isValidProjectFile(json)).toBe(true);

    const [rebuilt] = deserializeScene(json);
    const metadata = getSolidMetadata(rebuilt);

    expect(metadata.profile).toEqual(SQUARE);
    expect(metadata.depth).toBe(2.5);
    expect(rebuilt.position.toArray()).toEqual(mesh.position.toArray());
  });

  it("produces an empty project with no solids", () => {
    const project = serializeScene([]);
    expect(project).toEqual(createEmptyProject());
  });

  it("rejects malformed or future-versioned project files", () => {
    expect(isValidProjectFile({ formatVersion: 2, units: "meters", solids: [] })).toBe(false);
    expect(isValidProjectFile({ formatVersion: 1, units: "feet", solids: [] })).toBe(false);
    expect(isValidProjectFile(null)).toBe(false);
    expect(isValidProjectFile({ formatVersion: 1, units: "meters", solids: [{ id: "x" }] })).toBe(false);
  });
});
