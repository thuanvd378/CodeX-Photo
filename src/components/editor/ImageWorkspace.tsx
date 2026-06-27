import { Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { UploadPanel } from "./UploadPanel";
import { BeforeAfterView } from "./BeforeAfterView";
import { useEditorStore } from "../../app/editor-store";
import type { ComparisonMode } from "../../types/editor";

const comparisonOptions: Array<{ value: ComparisonMode; label: string }> = [
  { value: "before", label: "Trước" },
  { value: "after", label: "Sau" },
  { value: "split", label: "So sánh" }
];

export function ImageWorkspace() {
  const imageDocument = useEditorStore((state) => state.imageDocument);
  const comparisonMode = useEditorStore((state) => state.comparisonMode);
  const setComparisonMode = useEditorStore((state) => state.setComparisonMode);
  const isGenerating = useEditorStore((state) => state.isGenerating);
  const modeNotice = useEditorStore((state) => state.modeNotice);
  const error = useEditorStore((state) => state.error);

  if (!imageDocument) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center border-r border-[rgb(var(--border))] p-8">
        <div className="flex w-full max-w-xl flex-col items-center rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-8 py-12 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] text-[rgb(var(--accent))]">
            <span className="text-2xl font-semibold">CP</span>
          </div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text))]">CodeX Photo</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-[rgb(var(--muted))]">
            Tải ảnh sản phẩm lên để tạo kế hoạch chỉnh sửa và xuất ảnh thương mại.
          </p>
          <div className="mt-6">
            <UploadPanel />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col border-r border-[rgb(var(--border))]">
      <div className="flex h-14 items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[rgb(var(--text))]">{imageDocument.fileName}</div>
          <div className="text-xs text-[rgb(var(--muted))]">
            {imageDocument.width}x{imageDocument.height} · {imageDocument.history.length} phiên bản
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UploadPanel compact />
          <div className="flex rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] p-0.5">
            {comparisonOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setComparisonMode(option.value)}
                className={
                  comparisonMode === option.value
                    ? "h-8 rounded px-3 text-xs font-medium text-white bg-[rgb(var(--accent))]"
                    : "h-8 rounded px-3 text-xs font-medium text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {modeNotice || error ? (
        <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] px-4 py-2">
          {modeNotice ? <Badge tone="warning">{modeNotice}</Badge> : null}
          {error ? <Badge tone="danger">{error}</Badge> : null}
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1 p-5">
        <BeforeAfterView
          originalDataUrl={imageDocument.originalDataUrl}
          currentDataUrl={imageDocument.currentDataUrl}
          mode={comparisonMode}
        />
        {isGenerating ? (
          <div className="absolute inset-5 flex items-center justify-center rounded-md bg-black/35">
            <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-black/70 px-4 py-3 text-sm font-medium text-white">
              <Loader2 size={18} className="animate-spin" />
              Đang lập kế hoạch và xử lý ảnh
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
