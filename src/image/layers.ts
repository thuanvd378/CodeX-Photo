export type BlendMode = "normal" | "multiply" | "screen" | "overlay";

export interface ImageLayer {
  id: string;
  name: string;
  kind: "raster" | "adjustment" | "mask" | "metadata";
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  dataUrl?: string;
  metadata?: Record<string, string | number | boolean>;
}

export function createRasterLayer(name: string, dataUrl: string): ImageLayer {
  return {
    id: crypto.randomUUID(),
    name,
    kind: "raster",
    visible: true,
    opacity: 1,
    blendMode: "normal",
    dataUrl
  };
}

export function createAdjustmentLayer(
  name: string,
  metadata: Record<string, string | number | boolean>
): ImageLayer {
  return {
    id: crypto.randomUUID(),
    name,
    kind: "adjustment",
    visible: true,
    opacity: 1,
    blendMode: "normal",
    metadata
  };
}
