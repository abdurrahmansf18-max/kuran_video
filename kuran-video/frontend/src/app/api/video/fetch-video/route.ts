import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url, removeAudio } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Geçerli bir video URL'si gereklidir." }, { status: 400 });
    }

    const baseUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
    const res = await fetch(`${baseUrl}/api/extraction/video-from-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        url,
        remove_audio: Boolean(removeAudio)
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Video linki indirilemedi." }));
      return NextResponse.json({ error: err.detail || "Video linki indirilemedi." }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[Fetch Video Error]:", err);
    return NextResponse.json({ error: err.message || "Bağlantıdan video alınırken bir hata oluştu." }, { status: 500 });
  }
}
