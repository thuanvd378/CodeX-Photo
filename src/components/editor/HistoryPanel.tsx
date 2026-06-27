import { History } from "lucide-react";
import { useEditorStore } from "../../app/editor-store";

export function HistoryPanel() {
  const imageDocument = useEditorStore((state) => state.imageDocument);
  const restoreHistory = useEditorStore((state) => state.restoreHistory);

  return (
    <section className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <History size={17} className="text-[rgb(var(--accent))]" />
        <h2 className="text-sm font-semibold text-[rgb(var(--text))]">Lịch sử</h2>
      </div>
      {!imageDocument ? (
        <div className="text-sm text-[rgb(var(--muted))]">Chưa có ảnh.</div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {imageDocument.history.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => void restoreHistory(entry.id)}
              className="group overflow-hidden rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] text-left transition hover:border-[rgb(var(--accent))]"
              title={entry.label}
            >
              <div className="aspect-square checkerboard">
                <img src={entry.dataUrl} alt={entry.label} className="h-full w-full object-cover" />
              </div>
              <div className="truncate px-2 py-1 text-[11px] text-[rgb(var(--muted))] group-hover:text-[rgb(var(--text))]">
                {entry.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
