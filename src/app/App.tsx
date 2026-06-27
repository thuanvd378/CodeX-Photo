import { useEffect, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { SettingsDialog } from "../components/layout/SettingsDialog";
import { Toast } from "../components/ui/toast";
import { ACCENT_CLASS_MAP } from "../lib/constants";
import { useEditorStore } from "./editor-store";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settings = useEditorStore((state) => state.settings);
  const loadSettings = useEditorStore((state) => state.loadSettings);
  const toast = useEditorStore((state) => state.toast);
  const clearToast = useEditorStore((state) => state.clearToast);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-emerald", "theme-blue", "theme-violet", "theme-rose");

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (settings?.theme === "dark" || (settings?.theme === "system" && prefersDark)) {
      root.classList.add("dark");
    }

    root.classList.add(ACCENT_CLASS_MAP[settings?.accentColor ?? "emerald"]);
  }, [settings]);

  return (
    <>
      <AppShell onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Toast toast={toast} onDismiss={clearToast} />
    </>
  );
}
