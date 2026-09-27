import { dangerouslyDeleteByTag } from "@vercel/functions";
import { isProduction } from "../config/index.js";

/**
 * Adapter for Vercel's edge cache deletion.
 */
export async function purgeCache(tags: string[]): Promise<{ success: boolean; warning?: string }> {
  // Local development / non-Vercel environment
  if (!isProduction && process.env.NODE_ENV !== "test") {
    console.log("[CACHE] Local dev: mocking cache purge for tags", tags);
    return { success: true };
  }

  // Use a finite retry policy
  let lastError = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Vercel helper handles deletion without needing manual API tokens
      await dangerouslyDeleteByTag(tags);
      return { success: true };
    } catch (e: any) {
      lastError = e.message || "Unknown error";
      console.error(`[CACHE] Failed to purge tags on attempt ${attempt}:`, lastError);
    }
    // Short backoff
    await new Promise(resolve => setTimeout(resolve, 200 * attempt));
  }

  return { success: false, warning: "Saved, but public refresh delayed." };
}
