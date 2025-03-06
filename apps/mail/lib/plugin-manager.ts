import { Plugin, PluginHook, UIExtensionPoint, EmailDriver, AuthProvider } from '../types/plugin';

class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin>;
  private hooks: Map<string, PluginHook[]>;
  private uiExtensions: Map<string, UIExtensionPoint[]>;
  private emailDrivers: Map<string, EmailDriver>;
  private authProviders: Map<string, AuthProvider>;
  private disabledPlugins: Set<string>;

  private constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.uiExtensions = new Map();
    this.emailDrivers = new Map();
    this.authProviders = new Map();
    this.disabledPlugins = new Set(this.loadDisabledPlugins());
  }

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  public async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.metadata.id)) {
      throw new Error(`Plugin with ID ${plugin.metadata.id} is already registered`);
    }

    // Register the plugin
    this.plugins.set(plugin.metadata.id, plugin);

    // Only register extensions if the plugin is enabled
    if (!this.disabledPlugins.has(plugin.metadata.id)) {
      await this.registerPluginExtensions(plugin);
      await plugin.onActivate?.();
    }
  }

  public async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin with ID ${pluginId} is not registered`);
    }

    // Deactivate the plugin
    await plugin.onDeactivate?.();

    // Remove hooks
    if (plugin.hooks) {
      plugin.hooks.forEach((hook) => {
        const existingHooks = this.hooks.get(hook.event) || [];
        this.hooks.set(
          hook.event,
          existingHooks.filter((h) => h !== hook)
        );
      });
    }

    // Remove UI extensions
    if (plugin.uiExtensions) {
      plugin.uiExtensions.forEach((extension) => {
        const existingExtensions = this.uiExtensions.get(extension.location) || [];
        this.uiExtensions.set(
          extension.location,
          existingExtensions.filter((e) => e !== extension)
        );
      });
    }

    // Remove email drivers
    if (plugin.emailDrivers) {
      plugin.emailDrivers.forEach((driver) => {
        this.emailDrivers.delete(driver.id);
      });
    }

    // Remove auth providers
    if (plugin.authProviders) {
      plugin.authProviders.forEach((provider) => {
        this.authProviders.delete(provider.id);
      });
    }

    // Remove the plugin
    this.plugins.delete(pluginId);
  }

  public async executeHook(event: string, ...args: any[]): Promise<void> {
    const hooks = this.hooks.get(event) || [];
    for (const hook of hooks) {
      await hook.handler(...args);
    }
  }

  public getUIExtensions(location: string): UIExtensionPoint[] {
    return this.uiExtensions.get(location) || [];
  }

  public getEmailDriver(id: string): EmailDriver | undefined {
    return this.emailDrivers.get(id);
  }

  public getAuthProvider(id: string): AuthProvider | undefined {
    return this.authProviders.get(id);
  }

  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public getAllEmailDrivers(): EmailDriver[] {
    return Array.from(this.emailDrivers.values());
  }

  public getAllAuthProviders(): AuthProvider[] {
    return Array.from(this.authProviders.values());
  }

  public isPluginEnabled(pluginId: string): boolean {
    return !this.disabledPlugins.has(pluginId);
  }

  public async setPluginEnabled(pluginId: string, enabled: boolean): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin with ID ${pluginId} is not registered`);
    }

    if (enabled && this.disabledPlugins.has(pluginId)) {
      this.disabledPlugins.delete(pluginId);
      await this.registerPluginExtensions(plugin);
      await plugin.onActivate?.();
    } else if (!enabled && !this.disabledPlugins.has(pluginId)) {
      await plugin.onDeactivate?.();
      await this.unregisterPluginExtensions(plugin);
      this.disabledPlugins.add(pluginId);
    }

    this.saveDisabledPlugins();
  }

  private async registerPluginExtensions(plugin: Plugin): Promise<void> {
    // Register hooks
    if (plugin.hooks) {
      plugin.hooks.forEach((hook) => {
        const existingHooks = this.hooks.get(hook.event) || [];
        existingHooks.push(hook);
        existingHooks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.hooks.set(hook.event, existingHooks);
      });
    }

    // Register UI extensions
    if (plugin.uiExtensions) {
      plugin.uiExtensions.forEach((extension) => {
        const existingExtensions = this.uiExtensions.get(extension.location) || [];
        existingExtensions.push(extension);
        existingExtensions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.uiExtensions.set(extension.location, existingExtensions);
      });
    }

    // Register email drivers
    if (plugin.emailDrivers) {
      plugin.emailDrivers.forEach((driver) => {
        this.emailDrivers.set(driver.id, driver);
      });
    }

    // Register auth providers
    if (plugin.authProviders) {
      plugin.authProviders.forEach((provider) => {
        this.authProviders.set(provider.id, provider);
      });
    }
  }

  private async unregisterPluginExtensions(plugin: Plugin): Promise<void> {
    // Remove hooks
    if (plugin.hooks) {
      plugin.hooks.forEach((hook) => {
        const existingHooks = this.hooks.get(hook.event) || [];
        this.hooks.set(
          hook.event,
          existingHooks.filter((h) => h !== hook)
        );
      });
    }

    // Remove UI extensions
    if (plugin.uiExtensions) {
      plugin.uiExtensions.forEach((extension) => {
        const existingExtensions = this.uiExtensions.get(extension.location) || [];
        this.uiExtensions.set(
          extension.location,
          existingExtensions.filter((e) => e !== extension)
        );
      });
    }

    // Remove email drivers
    if (plugin.emailDrivers) {
      plugin.emailDrivers.forEach((driver) => {
        this.emailDrivers.delete(driver.id);
      });
    }

    // Remove auth providers
    if (plugin.authProviders) {
      plugin.authProviders.forEach((provider) => {
        this.authProviders.delete(provider.id);
      });
    }
  }

  private loadDisabledPlugins(): string[] {
    try {
      const stored = localStorage.getItem('disabledPlugins');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveDisabledPlugins(): void {
    try {
      localStorage.setItem('disabledPlugins', JSON.stringify(Array.from(this.disabledPlugins)));
    } catch {
      console.error('Failed to save disabled plugins state');
    }
  }
}

export const pluginManager = PluginManager.getInstance();
