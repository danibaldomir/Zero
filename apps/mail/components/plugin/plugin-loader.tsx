import EmailAnalyticsPlugin from "@/plugins/email-analytics";
import { pluginManager } from "@/lib/plugin-manager";
import { useEffect } from "react";

export function PluginLoader() {
  useEffect(() => {
    const loadPlugins = async () => {
      try {
        await pluginManager.registerPlugin(EmailAnalyticsPlugin);
        console.log("Email Analytics plugin loaded successfully");
      } catch (error) {
        console.error("Failed to load plugins:", error);
      }
    };

    loadPlugins();
  }, []);

  return null;
}
