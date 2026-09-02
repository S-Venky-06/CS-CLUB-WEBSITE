import { env } from "../config/index.js";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";

/**
 * Uploads a screenshot to ImgBB and makes it publicly viewable.
 * Returns the public image URL.
 */
export async function uploadScreenshot(
  fileBuffer: Buffer,
  fileName: string,
  _mimeType: string
): Promise<string> {
  if (!env.IMGBB_API_KEY) {
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "IMGBB_API_KEY is not configured in the environment."
    );
  }

  try {
    const base64Image = fileBuffer.toString("base64");
    
    const formData = new URLSearchParams();
    formData.append("key", env.IMGBB_API_KEY);
    formData.append("image", base64Image);
    formData.append("name", fileName);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error(`ImgBB API returned ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (!data.success) {
      throw new Error(data.error?.message || "Unknown error from ImgBB");
    }

    // Return the direct display URL
    return data.data.url;
  } catch (error) {
    console.error("ImgBB Upload Error:", error);
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Failed to upload screenshot to ImgBB."
    );
  }
}
