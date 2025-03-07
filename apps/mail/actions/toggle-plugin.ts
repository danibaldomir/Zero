"use server";

import { pluginSettings } from "@zero/db/schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@zero/db";

export async function togglePlugin(pluginId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const existingSetting = await db.query.pluginSettings.findFirst({
      where: and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)),
    });

    if (existingSetting) {
      await db
        .update(pluginSettings)
        .set({
          enabled: !existingSetting.enabled,
          updatedAt: new Date(),
        })
        .where(
          and(eq(pluginSettings.pluginId, pluginId), eq(pluginSettings.userId, session.user.id)),
        );
    } else {
      // Create new setting
      await db.insert(pluginSettings).values({
        pluginId,
        userId: session.user.id,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/plugins");
    revalidatePath("/settings/plugins");

    return { success: true };
  } catch (error) {
    console.error("Error toggling plugin:", error);
    throw error;
  }
}
