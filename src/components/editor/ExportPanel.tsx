import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Slider } from "../ui/slider";
import { EXPORT_PRESETS, type ExportPresetId } from "../../lib/constants";
import { useEditorStore } from "../../app/editor-store";
import type { ExportOptions } from "../../types/editor";

export function ExportPanel() {
  const exportOptions = useEditorStore((state) => state.exportOptions);
  const setExportOptions = useEditorStore((state) => state.setExportOptions);
  const exportCurrent = useEditorStore((state) => state.exportCurrent);
  const hasImage = Boolean(useEditorStore((state) => state.imageDocument));

  return (
    <section className="border-b border-[rgb(var(--border))] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Download size={17} className="text-[rgb(var(--accent))]" />
        <h2 className="text-sm font-semibold text-[rgb(var(--text))]">Xuất ảnh</h2>
      </div>
      <div className="space-y-3">
        <Select
          value={exportOptions.preset}
          onChange={(event) => setExportOptions({ preset: event.target.value as ExportPresetId })}
        >
          {EXPORT_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-[1fr_96px] gap-2">
          <Select
            value={exportOptions.format}
            onChange={(event) => setExportOptions({ format: event.target.value as ExportOptions["format"] })}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="webp">WebP</option>
          </Select>
          <Button variant="secondary" icon={<Download size={16} />} disabled={!hasImage} onClick={() => void exportCurrent()}>
            Xuất
          </Button>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-[rgb(var(--muted))]">
            <span>Chất lượng</span>
            <span>{Math.round(exportOptions.quality * 100)}%</span>
          </div>
          <Slider
            min={0.5}
            max={1}
            step={0.01}
            value={exportOptions.quality}
            onChange={(event) => setExportOptions({ quality: Number(event.target.value) })}
          />
        </div>
      </div>
    </section>
  );
}
