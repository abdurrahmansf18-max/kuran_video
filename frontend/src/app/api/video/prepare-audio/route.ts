import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import axios from "axios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadAudioToPublic(audioUrl: string, audioPath: string) {
  const absolutePath = path.join(process.cwd(), "public", audioPath);

  // Removed fileExists check to ensure we always fetch the latest audio 
  // (e.g. if padSeconds changed, the backend generates a new file with the same name)

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(audioUrl, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "KuranNuruVideoRenderer/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download audio ${audioUrl}: HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);
    return absolutePath;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const surahId = Number(formData.get("surahId"));
    const startVerse = Number(formData.get("startVerse"));
    const endVerse = Number(formData.get("endVerse"));
    const reciterId = formData.get("reciterId") as string || "mishary_alafasy";
    const customAudio = formData.get("customAudio") as File | null;
    const preTrimStartStr = formData.get("preTrimStart") as string | null;
    const preTrimEndStr = formData.get("preTrimEnd") as string | null;
    const padSeconds = Number(formData.get("padSeconds")) || 2.0;

    if (!Number.isInteger(surahId) || !Number.isInteger(startVerse) || !Number.isInteger(endVerse)) {
      return NextResponse.json({ error: "Invalid video options" }, { status: 400 });
    }

    const RECITER_KEYS: Record<string, string> = {
      mishary_alafasy: "mishary",
      maher_muaiqly: "maher",
      ahmed_ajmi: "ajmi",
      yasser_dosari: "yasser",
      abdullah_mousa: "mousa",
      raad_alkurdi: "raad_alkurdi"
    };
    const shortReciterKey = RECITER_KEYS[reciterId] || "mishary";

    const baseUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";
    let wordTimingsData: any = null;
    let globalAudioPath: string | null = null;
    let localMp3Path: string | null = null;

    if (customAudio && customAudio.size > 0) {
      const backendFormData = new FormData();
      backendFormData.append("surah", surahId.toString());
      backendFormData.append("start", startVerse.toString());
      backendFormData.append("end", endVerse.toString());
      backendFormData.append("pad_seconds", padSeconds.toString());
      
      let finalAudioBlob: Blob = customAudio;
      
      // If pre-trimming is requested, trim it using ffmpeg before sending to backend
      if (preTrimStartStr || preTrimEndStr) {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);
        const os = require('os');
        const fsSync = require('fs');
        
        const tempId = Date.now() + Math.random().toString(36).slice(2);
        const inputPath = path.join(os.tmpdir(), `input_${tempId}.tmp`);
        const outputPath = path.join(os.tmpdir(), `output_${tempId}.mp3`);
        
        try {
          const buffer = Buffer.from(await customAudio.arrayBuffer());
          await fs.writeFile(inputPath, buffer);
          
          let ffmpegCmd = `ffmpeg -y -i "${inputPath}"`;
          if (preTrimStartStr) ffmpegCmd += ` -ss ${preTrimStartStr}`;
          if (preTrimEndStr) ffmpegCmd += ` -to ${preTrimEndStr}`;
          ffmpegCmd += ` -c:v copy -c:a libmp3lame -q:a 2 "${outputPath}"`;
          
          console.log("[Pre-Trim] Running:", ffmpegCmd);
          await execAsync(ffmpegCmd);
          
          const trimmedBuffer = await fs.readFile(outputPath);
          finalAudioBlob = new Blob([trimmedBuffer], { type: "audio/mpeg" });
          console.log("[Pre-Trim] Success. Original size:", customAudio.size, "Trimmed size:", finalAudioBlob.size);
        } catch (err) {
          console.error("[Pre-Trim] FFmpeg error:", err);
          return NextResponse.json({ error: "Ön kesim işlemi başarısız oldu. Saat/Dakika formatını kontrol edin." }, { status: 400 });
        } finally {
          try { if (fsSync.existsSync(inputPath)) await fs.rm(inputPath); } catch (e) {}
          try { if (fsSync.existsSync(outputPath)) await fs.rm(outputPath); } catch (e) {}
        }
      }

      backendFormData.append("audio_file", finalAudioBlob, customAudio.name);

      const extractRes = await axios.post(`${baseUrl}/api/extraction/custom`, backendFormData, {
        timeout: 1800000, // 30 minutes timeout for heavy Whisper processing
        validateStatus: () => true, // Don't throw on non-200
      });

      if (extractRes.status === 200) {
        const extractionData = extractRes.data;
        if (extractionData.success) {
          if (extractionData.mp3_filename) {
            const mp3Url = `${baseUrl}/api/extraction/download/${extractionData.mp3_filename}`;
            const mp3RelPath = `renders/temp_audio/${extractionData.mp3_filename}`;
            localMp3Path = await downloadAudioToPublic(mp3Url, mp3RelPath);
            globalAudioPath = `/api/serve-audio?file=${mp3RelPath}&t=${Date.now()}`;
          }
          const jsonUrl = `${baseUrl}/api/extraction/download/${extractionData.json_filename}`;
          const jsonRes = await axios.get(jsonUrl, { timeout: 30000, validateStatus: () => true });
          if (jsonRes.status === 200) {
            wordTimingsData = jsonRes.data;
          }
        }
      } else {
        return NextResponse.json({ error: "Failed to align custom audio" }, { status: 400 });
      }
    } else {
      const extractRes = await axios.post(`${baseUrl}/api/extraction/`, {
        surah: surahId,
        start: startVerse,
        end: endVerse,
        reciter: shortReciterKey,
        pad_seconds: padSeconds
      }, {
        timeout: 900000, // 15 minutes
        validateStatus: () => true
      });

      if (extractRes.status === 200) {
        const extractionData = extractRes.data;
        if (extractionData.success) {
          const mp3Url = `${baseUrl}/api/extraction/download/${extractionData.mp3_filename}`;
          const mp3RelPath = `renders/temp_audio/${extractionData.mp3_filename}`;
          localMp3Path = await downloadAudioToPublic(mp3Url, mp3RelPath);
          globalAudioPath = `/api/serve-audio?file=${mp3RelPath}&t=${Date.now()}`;

          const jsonUrl = `${baseUrl}/api/extraction/download/${extractionData.json_filename}`;
          const jsonRes = await axios.get(jsonUrl, { timeout: 30000, validateStatus: () => true });
          if (jsonRes.status === 200) {
            wordTimingsData = jsonRes.data;
          }
        }
      } else {
        console.error("Backend extraction failed:", extractRes.status, extractRes.statusText);
        return NextResponse.json({ error: `فشل تجهيز الصوت: الخادم استغرق وقتاً طويلاً أو حدث خطأ. حاول مجدداً. (${extractRes.status})` }, { status: 400 });
      }
    }

    if (!globalAudioPath || !wordTimingsData) {
      return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      audioUrl: globalAudioPath,
      localAudioPath: localMp3Path,
      wordTimingsData,
      padSeconds
    });

  } catch (error: any) {
    console.error("[Prepare Audio] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
