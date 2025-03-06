"use server";

import { pluginSettings } from "@zero/db/schema";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@zero/db";

export async function getPluginSettings(pluginId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) return true; // Default to enabled if no user

  const settings = await db
    .select()
    .from(pluginSettings)
    .where(and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)))
    .execute();

  return settings[0]?.enabled ?? true;
}

export async function setPluginSettings(pluginId: string, enabled: boolean) {
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

  return { success: true };
}

export async function getAllPluginSettings() {
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
