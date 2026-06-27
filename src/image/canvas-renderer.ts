import { getImageSizeFromDataUrl } from "./local-tools";

export async function renderDataUrlToCanvas(dataUrl: string, canvas: HTMLCanvasElement): Promise<void> {
  const image = await loadImage(dataUrl);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas renderer could not acquire a 2D context.");
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
}

export async function readRenderedSize(dataUrl: string): Promise<string> {
  const size = await getImageSizeFromDataUrl(dataUrl);
  return `${size.width}x${size.height}`;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render image preview."));
    image.src = dataUrl;
  });
}
