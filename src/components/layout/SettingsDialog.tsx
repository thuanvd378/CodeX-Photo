import { useEffect, useState } from "react";
import { KeyRound, Palette, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Switch } from "../ui/switch";
import { useEditorStore } from "../../app/editor-store";
import type { AccentColor, ApiProvider, SettingsSaveRequest, ThemeMode } from "../../types/settings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const accentOptions: Array<{ value: AccentColor; label: string; className: string }> = [
  { value: "emerald", label: "Emerald", className: "bg-emerald-600" },
  { value: "blue", label: "Blue", className: "bg-blue-600" },
  { value: "violet", label: "Violet", className: "bg-violet-600" },
  { value: "rose", label: "Rose", className: "bg-rose-600" }
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = useEditorStore((state) => state.settings);
  const saveSettings = useEditorStore((state) => state.saveSettings);
  const clearApiKey = useEditorStore((state) => state.clearApiKey);
  const [draft, setDraft] = useState<SettingsSaveRequest>({ ...settings });
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (open) {
      setDraft({ ...settings, apiKey: "" });
      setApiKey("");
    }
  }, [open, settings]);

  const updateDraft = (patch: Partial<SettingsSaveRequest>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const handleSave = async () => {
    const ok = await saveSettings({ ...draft, apiKey: apiKey.trim() || undefined });
    if (ok) {
      setApiKey("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      title="Cài đặt CodeX Photo"
      description="Cấu hình API, giao diện và chế độ demo."
      onOpenChange={onOpenChange}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={() => void handleSave()}>
            Lưu
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] p-4">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound size={18} className="text-[rgb(var(--accent))]" />
            <h3 className="text-sm font-semibold text-[rgb(var(--text))]">API</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-[rgb(var(--muted))]">Nhà cung cấp</span>
              <Select
                value={draft.provider}
                onChange={(event) => updateDraft({ provider: event.target.value as ApiProvider })}
              >
                <option value="openai">OpenAI</option>
                <option value="openai-compatible">OpenAI compatible</option>
                <option value="custom">Custom</option>
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-[rgb(var(--muted))]">Model</span>
              <Input value={draft.model} onChange={(event) => updateDraft({ model: event.target.value })} />
            </label>
          </div>
          <label className="mt-4 block space-y-1.5">
            <span className="text-xs font-medium text-[rgb(var(--muted))]">API Key</span>
            <Input
              type="password"
              value={apiKey}
              placeholder={settings.hasApiKey ? "API key đã được thiết lập" : "Dán API key"}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs text-[rgb(var(--muted))]">
              {settings.hasApiKey ? "API key đã được thiết lập." : "Chưa có API key."}
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              disabled={!settings.hasApiKey}
              onClick={() => void clearApiKey()}
            >
              Xóa key
            </Button>
          </div>
        </section>

        <section className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] p-4">
          <div className="mb-4 flex items-center gap-2">
            <Palette size={18} className="text-[rgb(var(--accent))]" />
            <h3 className="text-sm font-semibold text-[rgb(var(--text))]">Giao diện</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-[rgb(var(--muted))]">Theme</span>
              <Select value={draft.theme} onChange={(event) => updateDraft({ theme: event.target.value as ThemeMode })}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </label>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[rgb(var(--muted))]">Accent</span>
              <div className="grid grid-cols-4 gap-2">
                {accentOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateDraft({ accentColor: option.value })}
                    className={
                      draft.accentColor === option.value
                        ? "flex h-10 items-center justify-center rounded-md border-2 border-[rgb(var(--accent))] bg-[rgb(var(--panel))]"
                        : "flex h-10 items-center justify-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))]"
                    }
                    title={option.label}
                  >
                    <span className={`h-5 w-5 rounded-full ${option.className}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[rgb(var(--text))]">Dùng chế độ demo nếu chưa có API key</div>
              <p className="mt-1 text-sm leading-6 text-[rgb(var(--muted))]">
                Demo mode dùng các phép chỉnh sửa cục bộ để mô phỏng kết quả, không phải đầu ra AI.
              </p>
            </div>
            <Switch checked={draft.demoMode} onCheckedChange={(checked) => updateDraft({ demoMode: checked })} />
          </div>
        </section>

        <section className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel-subtle))] p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[rgb(var(--accent))]" />
            <h3 className="text-sm font-semibold text-[rgb(var(--text))]">Quyền riêng tư</h3>
          </div>
          <div className="space-y-2 text-sm leading-6 text-[rgb(var(--muted))]">
            <p>Ảnh chỉ được gửi tới AI khi bạn bấm Tạo ảnh.</p>
            <p>API key được lưu cục bộ trên máy của bạn.</p>
            <p>Không có tài khoản, không có cơ sở dữ liệu từ xa trong prototype này.</p>
          </div>
        </section>
      </div>
    </Dialog>
  );
}
