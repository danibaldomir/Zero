"use server";

import { getPluginSettings } from "@/actions/plugin-settings";
import { getPluginData } from "@/actions/plugin-data";
import { Resend } from "resend";

export async function getAudiences() {
  try {
    const settings = await getPluginSettings("resend");
    if (!settings.enabled) {
      return {
        data: [],
        error: "Resend plugin is not enabled. Please enable it in plugin settings.",
      };
    }

    const apiKeyData = await getPluginData("resend", "option:apiKey");
    const apiKey = typeof apiKeyData === "string" ? apiKeyData : "";

    if (!apiKey) {
      return {
        data: [],
        error: "Resend API key not found. Please configure the plugin settings.",
      };
    }

    const resend = new Resend(apiKey);
    const result = await resend.audiences.list();
    return { data: result.data?.data || [], error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to fetch audiences",
    };
  }
}
