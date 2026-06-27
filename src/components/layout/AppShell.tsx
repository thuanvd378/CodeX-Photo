import { CommandBox } from "../editor/CommandBox";
import { EditPlanPanel } from "../editor/EditPlanPanel";
import { ExportPanel } from "../editor/ExportPanel";
import { HistoryPanel } from "../editor/HistoryPanel";
import { ImageWorkspace } from "../editor/ImageWorkspace";
import { TopBar } from "./TopBar";

interface AppShellProps {
  onOpenSettings: () => void;
}

export function AppShell({ onOpenSettings }: AppShellProps) {
  return (
    <div className="desktop-frame flex h-full flex-col">
      <TopBar onOpenSettings={onOpenSettings} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_380px]">
        <ImageWorkspace />
        <aside className="min-h-0 overflow-y-auto bg-[rgb(var(--panel))] scrollbar-thin">
          <CommandBox />
          <ExportPanel />
          <EditPlanPanel />
          <HistoryPanel />
        </aside>
      </div>
    </div>
  );
}
