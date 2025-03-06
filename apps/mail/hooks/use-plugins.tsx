import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Plugin, UIExtensionPoint } from "../types/plugin";
import { pluginManager } from "../lib/plugin-manager";

interface PluginContextType {
  plugins: Plugin[];
  getUIExtensions: (location: string) => UIExtensionPoint[];
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export function PluginProvider({ children }: { children: ReactNode }) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [enabledPlugins, setEnabledPlugins] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initial plugin load
    const loadPlugins = () => {
      const allPlugins = pluginManager.getAllPlugins();
      setPlugins(allPlugins);

      // Update enabled states
      const enabled = new Set(
        allPlugins
          .filter((plugin) => pluginManager.isPluginEnabled(plugin.metadata.id))
          .map((plugin) => plugin.metadata.id),
      );
      setEnabledPlugins(enabled);
    };

    loadPlugins();
    const interval = setInterval(loadPlugins, 1000);
    return () => clearInterval(interval);
  }, []);

  const getUIExtensions = useCallback(
    (location: string) => {
      const extensions = pluginManager.getUIExtensions(location);
      return extensions.filter((ext) => {
        // Find the plugin that owns this extension
        const plugin = plugins.find((p) => p.uiExtensions?.some((e) => e === ext));
        return plugin && enabledPlugins.has(plugin.metadata.id);
      });
    },
    [plugins, enabledPlugins],
  );

  const value = {
    plugins,
    getUIExtensions,
  };

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}

export function usePlugins() {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error("usePlugins must be used within a PluginProvider");
  }
  return context;
}
