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
    
    // Add variations based on retry count so the user gets different results
    const styleModifiers = [
      "cinematic lighting, minimalist, very dark, deep navy and indigo tones",
      "ethereal, misty landscape, dark moody atmosphere, soft glow",
      "abstract geometric islamic patterns blending with nature, dark aesthetic, peaceful"
    ];
    const modifier = styleModifiers[retryCount % styleModifiers.length];
    
    const prompt = `Abstract nature background inspired by the meaning: "${ayahText}". ${modifier}. CRITICAL RULES: NO humans, NO animals, NO faces, NO prophets, NO angels, NO text, NO watermarks. Beautiful composition, suitable for vertical video background, 4k resolution.`;

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
