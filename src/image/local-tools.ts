import { EXPORT_PRESETS, type ExportPresetId } from "../lib/constants";

export interface AdjustmentOptions {
  brightness?: number;
  contrast?: number;
  exposure?: number;
  saturation?: number;
  temperature?: number;
}

export interface RasterResult {
  currentDataUrl: string;
  width: number;
  height: number;
}

export interface CenterOnPresetOptions {
  preset: string;
  background?: string;
  paddingRatio?: number;
}

export function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function applyLinearAdjustmentsToPixels(
  input: Uint8ClampedArray,
  options: AdjustmentOptions
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(input.length);
  const brightness = options.brightness ?? 0;
  const contrast = options.contrast ?? 0;
  const exposure = Math.pow(2, (options.exposure ?? 0) / 50);
  const saturation = (options.saturation ?? 0) / 100;
  const temperature = options.temperature ?? 0;
  const contrastValue = Math.max(-254, Math.min(254, contrast * 2.2));
  const contrastFactor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));

  for (let index = 0; index < input.length; index += 4) {
    let red = contrastFactor * (input[index] * exposure - 128) + 128 + brightness + temperature * 0.9;
    let green = contrastFactor * (input[index + 1] * exposure - 128) + 128 + brightness;
    let blue = contrastFactor * (input[index + 2] * exposure - 128) + 128 + brightness - temperature * 0.9;

    if (saturation !== 0) {
      const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      red = luminance + (red - luminance) * (1 + saturation);
      green = luminance + (green - luminance) * (1 + saturation);
      blue = luminance + (blue - luminance) * (1 + saturation);
    }

    output[index] = clampByte(red);
    output[index + 1] = clampByte(green);
    output[index + 2] = clampByte(blue);
    output[index + 3] = input[index + 3];
  }

  return output;
}

export async function getImageSizeFromDataUrl(dataUrl: string): Promise<{ width: number; height: number }> {
  const image = await loadImageElement(dataUrl);
  return { width: image.naturalWidth, height: image.naturalHeight };
}

export async function adjustBrightnessContrastDataUrl(
  dataUrl: string,
  options: AdjustmentOptions
): Promise<string> {
  return mutatePixels(dataUrl, (pixels) => applyLinearAdjustmentsToPixels(pixels, options));
}

export async function adjustSaturationDataUrl(dataUrl: string, amount: number): Promise<string> {
  return adjustBrightnessContrastDataUrl(dataUrl, { saturation: amount });
}

export async function sharpenDataUrl(dataUrl: string, amount: number): Promise<string> {
  const image = await loadImageElement(dataUrl);
  const canvas = imageToCanvas(image);
  const context = get2d(canvas);
  const source = context.getImageData(0, 0, canvas.width, canvas.height);
  const output = context.createImageData(canvas.width, canvas.height);
  const strength = Math.max(0, Math.min(1, amount));
  const center = 1 + 4 * strength;
  const side = -strength;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      for (let channel = 0; channel < 4; channel += 1) {
        const index = (y * canvas.width + x) * 4 + channel;
        if (channel === 3) {
          output.data[index] = source.data[index];
          continue;
        }

        const value =
          getPixel(source.data, canvas.width, canvas.height, x, y, channel) * center +
          getPixel(source.data, canvas.width, canvas.height, x - 1, y, channel) * side +
          getPixel(source.data, canvas.width, canvas.height, x + 1, y, channel) * side +
          getPixel(source.data, canvas.width, canvas.height, x, y - 1, channel) * side +
          getPixel(source.data, canvas.width, canvas.height, x, y + 1, channel) * side;
        output.data[index] = clampByte(value);
      }
    }
  }

  context.putImageData(output, 0, 0);
  return canvas.toDataURL("image/png");
}

export async function blurDataUrl(dataUrl: string, radius: number): Promise<string> {
  const image = await loadImageElement(dataUrl);
  const canvas = createCanvas(image.naturalWidth, image.naturalHeight);
  const context = get2d(canvas);
  context.filter = `blur(${Math.max(0, radius)}px)`;
  context.drawImage(image, 0, 0);
  context.filter = "none";
  return canvas.toDataURL("image/png");
}

export async function recolorDataUrl(dataUrl: string, tint: string, strength: number): Promise<string> {
  const image = await loadImageElement(dataUrl);
  const canvas = imageToCanvas(image);
  const context = get2d(canvas);
  context.globalCompositeOperation = "source-atop";
  context.globalAlpha = Math.max(0, Math.min(0.55, strength));
  context.fillStyle = tint;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  return canvas.toDataURL("image/png");
}

export async function resizeDataUrl(dataUrl: string, width: number, height: number): Promise<RasterResult> {
  const image = await loadImageElement(dataUrl);
  const targetWidth = Math.max(1, Math.round(width));
  const targetHeight = Math.max(1, Math.round(height));
  const canvas = createCanvas(targetWidth, targetHeight);
  const context = get2d(canvas);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, targetWidth, targetHeight);
  return { currentDataUrl: canvas.toDataURL("image/png"), width: targetWidth, height: targetHeight };
}

export async function rotateDataUrl(dataUrl: string, degrees: number): Promise<RasterResult> {
  const image = await loadImageElement(dataUrl);
  const radians = (degrees * Math.PI) / 180;
  const sine = Math.abs(Math.sin(radians));
  const cosine = Math.abs(Math.cos(radians));
  const width = Math.round(image.naturalWidth * cosine + image.naturalHeight * sine);
  const height = Math.round(image.naturalWidth * sine + image.naturalHeight * cosine);
  const canvas = createCanvas(width, height);
  const context = get2d(canvas);
  context.translate(width / 2, height / 2);
  context.rotate(radians);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return { currentDataUrl: canvas.toDataURL("image/png"), width, height };
}

export async function addPaddingDataUrl(dataUrl: string, padding: number, background: string): Promise<RasterResult> {
  const image = await loadImageElement(dataUrl);
  const pad = Math.max(0, Math.round(padding));
  const width = image.naturalWidth + pad * 2;
  const height = image.naturalHeight + pad * 2;
  const canvas = createCanvas(width, height);
  const context = get2d(canvas);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.drawImage(image, pad, pad);
  return { currentDataUrl: canvas.toDataURL("image/png"), width, height };
}

export async function centerOnPresetDataUrl(dataUrl: string, options: CenterOnPresetOptions): Promise<string> {
  const image = await loadImageElement(dataUrl);
  const preset = EXPORT_PRESETS.find((item) => item.id === options.preset);
  const width = preset?.width ?? image.naturalWidth;
  const height = preset?.height ?? image.naturalHeight;
  const background = options.background ?? preset?.background ?? "#ffffff";
  const paddingRatio = options.paddingRatio ?? 0.08;
  const availableWidth = width * (1 - paddingRatio * 2);
  const availableHeight = height * (1 - paddingRatio * 2);
  const scale = Math.min(availableWidth / image.naturalWidth, availableHeight / image.naturalHeight, 1);
  const drawWidth = Math.round(image.naturalWidth * scale);
  const drawHeight = Math.round(image.naturalHeight * scale);
  const x = Math.round((width - drawWidth) / 2);
  const y = Math.round((height - drawHeight) / 2);
  const canvas = createCanvas(width, height);
  const context = get2d(canvas);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, x, y, drawWidth, drawHeight);
  return canvas.toDataURL("image/png");
}

export async function cropDataUrl(
  dataUrl: string,
  crop: { x: number; y: number; width: number; height: number }
): Promise<RasterResult> {
  const image = await loadImageElement(dataUrl);
  const canvas = createCanvas(crop.width, crop.height);
  const context = get2d(canvas);
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return { currentDataUrl: canvas.toDataURL("image/png"), width: crop.width, height: crop.height };
}

export async function exportDataUrlWithFormat(
  dataUrl: string,
  format: "png" | "jpeg" | "webp",
  quality: number
): Promise<string> {
  const image = await loadImageElement(dataUrl);
  const canvas = imageToCanvas(image);
  const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  return canvas.toDataURL(mime, quality);
}

export function dataUrlExtension(format: "png" | "jpeg" | "webp"): string {
  return format === "jpeg" ? "jpg" : format;
}

export function normalizeExportPreset(value: string): ExportPresetId {
  return EXPORT_PRESETS.some((preset) => preset.id === value) ? (value as ExportPresetId) : "original";
}

async function mutatePixels(
  dataUrl: string,
  transform: (pixels: Uint8ClampedArray) => Uint8ClampedArray
): Promise<string> {
  const image = await loadImageElement(dataUrl);
  const canvas = imageToCanvas(image);
  const context = get2d(canvas);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData.data.set(transform(imageData.data));
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function getPixel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  channel: number
): number {
  const safeX = Math.max(0, Math.min(width - 1, x));
  const safeY = Math.max(0, Math.min(height - 1, y));
  return data[(safeY * width + safeX) * 4 + channel];
}

function imageToCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = createCanvas(image.naturalWidth, image.naturalHeight);
  const context = get2d(canvas);
  context.drawImage(image, 0, 0);
  return canvas;
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function get2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas 2D context is not available.");
  }
  return context;
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not decode image."));
    image.src = dataUrl;
  });
}
