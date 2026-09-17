import type { ProjectFile, SolidRecord } from "../../shared/types";

function isNumberTriple(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every((v) => typeof v === "number");
}

function isNumberQuad(value: unknown): value is [number, number, number, number] {
  return Array.isArray(value) && value.length === 4 && value.every((v) => typeof v === "number");
}

function isProfile(value: unknown): value is [number, number][] {
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    value.every((p) => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === "number"))
  );
}

function isSolidRecord(value: unknown): value is SolidRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;

  if (typeof record.id !== "string") return false;
  if (!isProfile(record.profile)) return false;
  if (!isNumberTriple(record.normal)) return false;
  if (typeof record.depth !== "number") return false;

  const transform = record.transform as Record<string, unknown> | undefined;
  if (typeof transform !== "object" || transform === null) return false;
  if (!isNumberTriple(transform.position)) return false;
  if (!isNumberQuad(transform.rotation)) return false;
  if (!isNumberTriple(transform.scale)) return false;

  if (record.color !== undefined && typeof record.color !== "string") return false;

  return true;
}

/** Valida um documento carregado do disco antes de reconstruir a cena. */
export function isValidProjectFile(value: unknown): value is ProjectFile {
  if (typeof value !== "object" || value === null) return false;
  const project = value as Record<string, unknown>;

  if (project.formatVersion !== 1) return false;
  if (project.units !== "meters") return false;
  if (!Array.isArray(project.solids)) return false;

  return project.solids.every(isSolidRecord);
}

export function createEmptyProject(): ProjectFile {
  return { formatVersion: 1, units: "meters", solids: [] };
}
