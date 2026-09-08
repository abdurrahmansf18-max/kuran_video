import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { ayahText, retryCount = 0 } = await req.json();
    if (!ayahText) {
      return NextResponse.json({ error: "ayahText is required." }, { status: 400 });
    }

    console.log(`[AI Background] Generating image for Ayah: "${ayahText.substring(0, 50)}..." (Retry: ${retryCount})`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    let response: Response | null = null;
    
    // Beautiful, vibrant nature themes
    const natureThemes = [
      "Breathtaking tropical beach with crystal clear turquoise water, gentle waves, and white sand, sunny day",
      "Lush green magical forest with sunlight filtering through the canopy, vibrant ferns and moss, peaceful",
      "Stunning mountain river flowing rapidly, crystal clear water, surrounded by vibrant autumn colored trees",
      "Milky way night sky over a calm mirror-like lake, millions of stars, deep space, glowing, tranquil",
      "Serene winter landscape with snow-covered pine trees, gentle snowfall, golden hour sunset lighting",
      "Beautiful spring meadow filled with colorful blooming wildflowers, rolling green hills, bright blue sky",
      "Majestic waterfall cascading down a rocky cliff in a dense vibrant tropical jungle",
      "Peaceful sunset over the ocean, sky painted in vibrant orange, pink, and purple hues, gentle waves",
      "Misty morning in a dense redwood forest, ethereal lighting, tranquil and calming atmosphere, vibrant nature"
    ];
    
    // Pick a completely random theme, disregarding the ayah text
    const randomTheme = natureThemes[Math.floor(Math.random() * natureThemes.length)];
    
    const prompt = `${randomTheme}. CRITICAL RULES: NO humans, NO animals, NO faces, NO architecture, NO text, NO watermarks. National geographic photography, 8k resolution, photorealistic, highly detailed, vibrant colors, stunning cinematic lighting, vertical composition.`;

    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 1000000);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&model=flux-realism&nologo=true&enhance=true&seed=${randomSeed}`;
      
      let fetchRetries = 3;
      let delay = 1000;
      
      while (fetchRetries > 0) {
        response = await fetch(url, { method: "GET", signal: controller.signal });
        if (response.status === 429) {
          await new Promise(r => setTimeout(r, delay));
          fetchRetries--;
          delay += 1500;
          continue;
        }
        break;
      }
    } finally {
      clearTimeout(timeout);
    }

    if (!response || !response.ok) {
      return NextResponse.json({ error: "Failed to generate image from API." }, { status: 500 });
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
       return NextResponse.json({ error: "API did not return an image." }, { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public", "render-assets", "generated-bg");
    await fs.mkdir(uploadsDir, { recursive: true });

    const extension = contentType === "image/png" ? ".png" : contentType === "image/webp" ? ".webp" : ".jpg";
    const filename = `bg-ai-${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
    const absolutePath = path.join(uploadsDir, filename);
    await fs.writeFile(absolutePath, buffer);

    const imageUrl = `/render-assets/generated-bg/${filename}`;
    
    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("[AI Background] Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
