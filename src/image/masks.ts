export interface MaskRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  feather: number;
}

export interface ImageMask {
  id: string;
  name: string;
  targetLayerId?: string;
  regions: MaskRegion[];
  inverted: boolean;
}

export function createRectMask(name: string, region: MaskRegion, targetLayerId?: string): ImageMask {
  return {
    id: crypto.randomUUID(),
    name,
    targetLayerId,
    regions: [region],
    inverted: false
  };
}

export function emptyMask(name: string): ImageMask {
  return {
    id: crypto.randomUUID(),
    name,
    regions: [],
    inverted: false
  };
}
