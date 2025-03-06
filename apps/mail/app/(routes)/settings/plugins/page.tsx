"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsCard } from "@/components/settings/settings-card";
import { useCallback, useEffect, useState } from "react";
import { pluginManager } from "@/lib/plugin-manager";
import { usePlugins } from "@/hooks/use-plugins";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PluginsPage() {
  const { plugins } = usePlugins();
  const [enabledStates, setEnabledStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const states: Record<string, boolean> = {};
    plugins.forEach((plugin) => {
      states[plugin.metadata.id] = pluginManager.isPluginEnabled(plugin.metadata.id);
    });
    setEnabledStates(states);
  }, [plugins]);

  const handleTogglePlugin = useCallback(async (pluginId: string, enabled: boolean) => {
    try {
      await pluginManager.setPluginEnabled(pluginId, enabled);
      setEnabledStates((prev) => ({ ...prev, [pluginId]: enabled }));
      toast.success(`Plugin ${enabled ? "enabled" : "disabled"} successfully`, { duration: 2000 });
    } catch (error) {
      console.error("Failed to toggle plugin:", error);
      toast.error("Failed to toggle plugin", { duration: 2000 });
      setEnabledStates((prev) => ({ ...prev, [pluginId]: !enabled }));
    }
  }, []);

  return (
    <div className="grid gap-6">
      <SettingsCard
        title="Plugins"
        description=" Manage your installed plugins and their settings."
      >
        <div className="space-y-6">
          <div className="grid gap-4">
            {plugins.map((plugin) => (
              <Card key={plugin.metadata.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{plugin.metadata.name}</CardTitle>
                  <CardDescription>{plugin.metadata.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`plugin-${plugin.metadata.id}`}
                      checked={enabledStates[plugin.metadata.id] ?? true}
                      onCheckedChange={(checked) => handleTogglePlugin(plugin.metadata.id, checked)}
                    />
                    <Label htmlFor={`plugin-${plugin.metadata.id}`}>Enabled</Label>
                  </div>
                  <div className="text-muted-foreground mt-2 text-sm">
                    Version {plugin.metadata.version} • By {plugin.metadata.author}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
