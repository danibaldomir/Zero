"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PluginOptionsForm } from "@/components/plugin/plugin-options-form";
import { SettingsCard } from "@/components/settings/settings-card";
import { useCallback, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { pluginManager } from "@/lib/plugin-manager";
import { usePlugins } from "@/hooks/use-plugins";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PluginsPage() {
  const { plugins } = usePlugins();
  const { data: session } = useSession();
  const [enabledStates, setEnabledStates] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadPluginStates = async () => {
      if (!session?.user?.id || plugins.length === 0) {
        return;
      }

      try {
        const states: Record<string, boolean> = {};
        for (const plugin of plugins) {
          states[plugin.metadata.id] = await pluginManager.isPluginEnabled(plugin.metadata.id);
        }
        setEnabledStates(states);
      } catch (error) {
        console.error("Failed to load plugin states:", error);
        toast.error("Failed to load plugin settings");
      }
    };

    loadPluginStates();
  }, [plugins, session?.user?.id]);

  const handleTogglePlugin = useCallback(
    async (pluginId: string, enabled: boolean) => {
      if (!session?.user?.id) {
        toast.error("Please sign in to manage plugins");
        return;
      }

      setLoadingStates((prev) => ({ ...prev, [pluginId]: true }));

      try {
        await pluginManager.setPluginEnabled(pluginId, enabled);
        setEnabledStates((prev) => ({ ...prev, [pluginId]: enabled }));
        toast.success(`Plugin ${enabled ? "enabled" : "disabled"} successfully`, {
          duration: 2000,
        });
      } catch (error) {
        console.error("Failed to toggle plugin:", error);
        toast.error("Failed to toggle plugin", { duration: 2000 });
        setEnabledStates((prev) => ({ ...prev, [pluginId]: !enabled }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, [pluginId]: false }));
      }
    },
    [session?.user?.id],
  );

  return (
    <div className="grid gap-6">
      <SettingsCard title="Plugins" description="Manage your installed plugins and their settings.">
        <div className="space-y-6">
          <div className="grid gap-4">
            {plugins.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No plugins installed</div>
            ) : (
              plugins.map((plugin) => (
                <Card key={plugin.metadata.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{plugin.metadata.name}</CardTitle>
                    <CardDescription>{plugin.metadata.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`plugin-${plugin.metadata.id}`}
                          checked={enabledStates[plugin.metadata.id] ?? true}
                          onCheckedChange={(checked) =>
                            handleTogglePlugin(plugin.metadata.id, checked)
                          }
                          disabled={loadingStates[plugin.metadata.id]}
                        />
                        <Label htmlFor={`plugin-${plugin.metadata.id}`}>
                          {loadingStates[plugin.metadata.id] ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Updating...
                            </span>
                          ) : (
                            "Enabled"
                          )}
                        </Label>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Version {plugin.metadata.version} • By {plugin.metadata.author}
                      </div>
                    </div>

                    {plugin.options && Object.keys(plugin.options).length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="font-medium">Plugin Settings</h3>
                          <PluginOptionsForm
                            pluginId={plugin.metadata.id}
                            options={plugin.options}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
