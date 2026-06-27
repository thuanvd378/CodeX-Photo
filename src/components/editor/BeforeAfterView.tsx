import type { ComparisonMode } from "../../types/editor";

interface BeforeAfterViewProps {
  originalDataUrl: string;
  currentDataUrl: string;
  mode: ComparisonMode;
}

export function BeforeAfterView({ originalDataUrl, currentDataUrl, mode }: BeforeAfterViewProps) {
  if (mode === "before") {
    return <PreviewImage dataUrl={originalDataUrl} label="Trước" />;
  }

  if (mode === "after") {
    return <PreviewImage dataUrl={currentDataUrl} label="Sau" />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md checkerboard">
      <img src={originalDataUrl} alt="Anh goc" className="absolute inset-0 h-full w-full object-contain" />
      <img
        src={currentDataUrl}
        alt="Anh sau chinh sua"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ clipPath: "inset(0 0 0 50%)" }}
      />
      <div className="absolute left-1/2 top-0 h-full w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
      <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">Trước</div>
      <div className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">Sau</div>
    </div>
  );
}

function PreviewImage({ dataUrl, label }: { dataUrl: string; label: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-md checkerboard">
      <img src={dataUrl} alt={label} className="h-full w-full object-contain" />
      <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">{label}</div>
    </div>
  );
}
