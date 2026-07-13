import * as THREE from "three";

export type Profile2D = [number, number][];

const EPSILON = 1e-9;

function segmentsIntersect(
  a: [number, number],
  b: [number, number],
  c: [number, number],
  d: [number, number]
): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
}

function cross(o: [number, number], a: [number, number], b: [number, number]): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

/** Rejeita loops com menos de 3 pontos ou com arestas não adjacentes que se cruzam. */
export function isSimplePolygon(points: Profile2D): boolean {
  if (points.length < 3) return false;

  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a1 = points[i];
    const a2 = points[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      if (j === i) continue;
      const isAdjacent = j === i || (j + 1) % n === i || (i + 1) % n === j;
      if (isAdjacent) continue;
      const b1 = points[j];
      const b2 = points[(j + 1) % n];
      if (segmentsIntersect(a1, a2, b1, b2)) return false;
    }
  }
  return true;
}

/** Área com sinal (positiva = sentido anti-horário). Usada para descartar loops degenerados. */
export function signedArea(points: Profile2D): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

export function profileToShape(points: Profile2D): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  shape.closePath();
  return shape;
}

export function isValidProfile(points: Profile2D): boolean {
  return (
    points.length >= 3 &&
    Math.abs(signedArea(points)) > EPSILON &&
    isSimplePolygon(points)
  );
}

/**
 * Converte um ponto do plano do chão (mundo, y=0) para o espaço 2D do perfil.
 * Consistente com a rotação aplicada em buildExtrudeGeometry (extrude.ts):
 * perfil (x, y) -> forma XY -> extrusão em +Z -> rotateX(-90°) -> mundo (x, z, -y).
 */
export function groundPointToProfile(point: THREE.Vector3): [number, number] {
  return [point.x, -point.z];
}

export function profilePointToGround(point: [number, number]): THREE.Vector3 {
  return new THREE.Vector3(point[0], 0, -point[1]);
}
