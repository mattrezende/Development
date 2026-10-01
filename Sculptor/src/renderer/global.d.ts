import type { SculptorApi } from "../main/preload";

declare global {
  interface Window {
    sculptor: SculptorApi;
  }
}

export {};
