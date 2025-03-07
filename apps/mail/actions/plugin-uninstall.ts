"use server";

import { pluginSettings } from "@zero/db/schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@zero/db";

export async function uninstallPlugin(pluginId: string) {
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
      .delete(pluginSettings)
      .where(
        and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)),
      );

    revalidatePath("/plugins");
    revalidatePath("/settings/plugins");

    return { success: true };
  } catch (error) {
    console.error("Failed to uninstall plugin:", error);
    throw error;
  }
}
