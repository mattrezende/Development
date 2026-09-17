export interface SolidRecord {
  id: string;
  profile: [number, number][];
  normal: [number, number, number];
  depth: number;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number, number];
    scale: [number, number, number];
  };
  color?: string;
}

export interface ProjectFile {
  formatVersion: 1;
  units: "meters";
  solids: SolidRecord[];
}

export interface SaveProjectResult {
  canceled: boolean;
  filePath?: string;
}

export interface OpenProjectResult {
  canceled: boolean;
  filePath?: string;
  project?: ProjectFile;
}

export interface ExportObjResult {
  canceled: boolean;
  filePath?: string;
}
