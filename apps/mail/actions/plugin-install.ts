"use server";

import { pluginSettings } from "@zero/db/schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@zero/db";

export async function installPlugin(pluginId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!pluginId) {
      throw new Error("Plugin ID is required");
    }

    await db
      .insert(pluginSettings)
      .values({
        pluginId,
        userId: session.user.id,
        enabled: true,
        added: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [pluginSettings.pluginId, pluginSettings.userId],
        set: {
          enabled: true,
          added: true,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/plugins");
    revalidatePath("/settings/plugins");

    return { success: true };
  } catch (error) {
    console.error("Failed to install plugin:", error);
    throw error;
  }
}
