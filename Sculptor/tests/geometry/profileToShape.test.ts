import { describe, it, expect } from "vitest";
import {
  isValidProfile,
  isSimplePolygon,
  signedArea,
  groundPointToProfile,
  profilePointToGround
} from "../../src/renderer/geometry/profileToShape";
import * as THREE from "three";

describe("profileToShape", () => {
  it("accepts a simple square profile", () => {
    const square: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ];
    expect(isValidProfile(square)).toBe(true);
    expect(isSimplePolygon(square)).toBe(true);
  });

  it("rejects a self-intersecting (bowtie) profile", () => {
    const bowtie: [number, number][] = [
      [0, 0],
      [1, 1],
      [1, 0],
      [0, 1]
    ];
    expect(isSimplePolygon(bowtie)).toBe(false);
    expect(isValidProfile(bowtie)).toBe(false);
  });

  it("rejects degenerate (zero-area) profiles", () => {
    const collinear: [number, number][] = [
      [0, 0],
      [1, 0],
      [2, 0]
    ];
    expect(isValidProfile(collinear)).toBe(false);
  });

  it("rejects loops with fewer than 3 points", () => {
    expect(isValidProfile([[0, 0], [1, 1]])).toBe(false);
  });

  it("computes signed area with correct sign for CCW/CW loops", () => {
    const ccw: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ];
    const cw = [...ccw].reverse() as [number, number][];
    expect(signedArea(ccw)).toBeGreaterThan(0);
    expect(signedArea(cw)).toBeLessThan(0);
  });

  it("round-trips ground point <-> profile point", () => {
    const ground = new THREE.Vector3(3, 0, -5);
    const profile = groundPointToProfile(ground);
    const back = profilePointToGround(profile);
    expect(back.x).toBeCloseTo(ground.x);
    expect(back.z).toBeCloseTo(ground.z);
  });
});
