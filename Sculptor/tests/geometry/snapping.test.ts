import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { snapToAxis, snapToGridValue, snapPointToGrid } from "../../src/renderer/geometry/snapping";

describe("snapping", () => {
  it("has no axis lock without a reference point (just grid-snaps)", () => {
    const { point, axis } = snapToAxis(null, new THREE.Vector3(1.2345, 0, 3.4567));
    expect(axis).toBeNull();
    expect(point.x).toBeCloseTo(1.23);
    expect(point.z).toBeCloseTo(3.46);
  });

  it("locks to the X axis when the candidate is nearly aligned with it", () => {
    const reference = new THREE.Vector3(0, 0, 0);
    const candidate = new THREE.Vector3(5, 0, 0.1); // ~1.1 degrees off X
    const { point, axis } = snapToAxis(reference, candidate);
    expect(axis).toBe("x");
    expect(point.z).toBeCloseTo(0);
    expect(point.x).toBeCloseTo(5);
  });

  it("locks to the Z axis when the candidate is nearly aligned with it", () => {
    const reference = new THREE.Vector3(2, 0, 2);
    const candidate = new THREE.Vector3(2.1, 0, 6);
    const { point, axis } = snapToAxis(reference, candidate);
    expect(axis).toBe("z");
    expect(point.x).toBeCloseTo(2);
    expect(point.z).toBeCloseTo(6);
  });

  it("does not lock when the direction is a free diagonal", () => {
    const reference = new THREE.Vector3(0, 0, 0);
    const candidate = new THREE.Vector3(3, 0, 3);
    const { axis } = snapToAxis(reference, candidate);
    expect(axis).toBeNull();
  });

  it("snaps individual values and points to the grid step", () => {
    expect(snapToGridValue(1.2345, 0.01)).toBeCloseTo(1.23);
    const p = snapPointToGrid(new THREE.Vector3(0.126, 0, 0.124), 0.01);
    expect(p.x).toBeCloseTo(0.13);
    expect(p.z).toBeCloseTo(0.12);
  });
});
