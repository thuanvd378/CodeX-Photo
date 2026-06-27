import { Badge } from "../ui/badge";
import type { SettingsView } from "../../types/settings";

interface ApiStatusBadgeProps {
  settings: SettingsView;
}

export function ApiStatusBadge({ settings }: ApiStatusBadgeProps) {
  if (settings.demoMode) {
    return <Badge tone="warning">Demo mode</Badge>;
  }

  if (settings.hasApiKey) {
    return <Badge tone="success">API ready</Badge>;
  }

  return <Badge tone="danger">No API key</Badge>;
}
