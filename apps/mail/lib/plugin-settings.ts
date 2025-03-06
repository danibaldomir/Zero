import { pluginSettings } from "@zero/db/schema";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db } from "@zero/db";

export class PluginSettingsManager {
  private static instance: PluginSettingsManager;

  private constructor() {}

  public static getInstance(): PluginSettingsManager {
    if (!PluginSettingsManager.instance) {
      PluginSettingsManager.instance = new PluginSettingsManager();
    }
    return PluginSettingsManager.instance;
  }

  public async getPluginSettings(pluginId: string): Promise<boolean> {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) return true; // Default to enabled if no user

    const settings = await db
      .select()
      .from(pluginSettings)
      .where(eq(pluginSettings.pluginId, pluginId))
      .where(eq(pluginSettings.userId, session.user.id))
      .execute();

    return settings[0]?.enabled ?? true;
  }

  public async setPluginSettings(pluginId: string, enabled: boolean): Promise<void> {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) throw new Error("User not authenticated");

    await db
      .insert(pluginSettings)
      .values({
        pluginId,
        enabled,
        userId: session.user.id,
      })
      .onConflictDoUpdate({
        target: [pluginSettings.pluginId, pluginSettings.userId],
        set: {
          enabled,
          updatedAt: new Date(),
        },
      })
      .execute();
  }

  public async getAllPluginSettings(): Promise<Record<string, boolean>> {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) return {};

    const settings = await db
      .select()
      .from(pluginSettings)
      .where(eq(pluginSettings.userId, session.user.id))
      .execute();

    return Object.fromEntries(settings.map((s) => [s.pluginId, s.enabled]));
  }
}

export const pluginSettingsManager = PluginSettingsManager.getInstance();
