import { Download, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { ApiStatusBadge } from "../editor/ApiStatusBadge";
import { useEditorStore } from "../../app/editor-store";
import { APP_NAME } from "../../lib/constants";

interface TopBarProps {
  onOpenSettings: () => void;
}

export function TopBar({ onOpenSettings }: TopBarProps) {
  const settings = useEditorStore((state) => state.settings);
  const imageDocument = useEditorStore((state) => state.imageDocument);
  const exportCurrent = useEditorStore((state) => state.exportCurrent);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[rgb(var(--accent))] text-sm font-bold text-white">
          CP
        </div>
        <div>
          <div className="text-sm font-semibold text-[rgb(var(--text))]">{APP_NAME}</div>
          <div className="text-[11px] text-[rgb(var(--muted))]">Desktop AI photo editor</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ApiStatusBadge settings={settings} />
        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={15} />}
          disabled={!imageDocument}
          onClick={() => void exportCurrent()}
        >
          Export
        </Button>
        <Button variant="secondary" size="sm" icon={<Settings size={15} />} onClick={onOpenSettings}>
          Cài đặt
        </Button>
      </div>
    </header>
  );
}
