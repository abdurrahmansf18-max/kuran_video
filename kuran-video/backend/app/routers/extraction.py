from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
import sys
from pathlib import Path
import shutil
import hashlib
import subprocess
import yt_dlp

scripts_path = str(Path("/app/scripts"))
if scripts_path not in sys.path:
    sys.path.append(scripts_path)

from extract_precise_clip import extract_clip, extract_custom_clip

router = APIRouter(
    tags=["extract"],
)

class ExtractRequest(BaseModel):
    surah: int
    start: int
    end: int
    reciter: str
    pad_seconds: float = 0.0

class UrlExtractRequest(BaseModel):
    url: str

class VideoUrlExtractRequest(BaseModel):
    url: str
    remove_audio: bool = False

@router.post("/from-url")
def fetch_audio_from_url(req: UrlExtractRequest):
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
        
    try:
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        output_dir = Path("/app/data/extracted_clips")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        target_filename = f"yt_{url_hash}.mp3"
        target_mp3_path = output_dir / target_filename
        
        title = "Audio"
        duration = 0
        
        if target_mp3_path.exists():
            cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(target_mp3_path)]
            try:
                res = subprocess.check_output(cmd).decode().strip()
                duration = float(res)
            except Exception:
                duration = 0
            title = f"Downloaded Audio ({url_hash})"
        else:
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': str(output_dir / f"yt_{url_hash}.%(ext)s"),
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'quiet': True,
                'no_warnings': True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                title = info.get("title", "Audio")
                duration = info.get("duration", 0)
        
        return {
            "success": True,
            "filename": target_filename,
            "title": title,
            "duration": duration,
            "audio_url": f"/backend/extraction/download/{target_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch audio from URL: {str(e)}")

@router.post("/video-from-url")
def fetch_video_from_url(req: VideoUrlExtractRequest):
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
        
    try:
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        output_dir = Path("/app/data/extracted_clips")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        prefix = "silent_video" if req.remove_audio else "bg_video"
        target_filename = f"{prefix}_{url_hash}.mp4"
        target_path = output_dir / target_filename
        
        title = "Background Video"
        duration = 0
        
        if target_path.exists():
            cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(target_path)]
            try:
                res = subprocess.check_output(cmd).decode().strip()
                duration = float(res)
            except Exception:
                duration = 0
            title = f"Downloaded Video ({url_hash})"
        else:
            raw_temp_prefix = output_dir / f"raw_video_{url_hash}"
            ydl_opts = {
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                'outtmpl': f"{raw_temp_prefix}.%(ext)s",
                'quiet': True,
                'no_warnings': True,
            }
            downloaded_file = None
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                title = info.get("title", "Background Video")
                duration = info.get("duration", 0)
                downloaded_file = ydl.prepare_filename(info)
            
            # Find the actual downloaded file if extension differed
            if not downloaded_file or not os.path.exists(downloaded_file):
                matching_files = list(output_dir.glob(f"raw_video_{url_hash}.*"))
                if matching_files:
                    downloaded_file = str(matching_files[0])
            
            if not downloaded_file or not os.path.exists(downloaded_file):
                raise Exception("Could not find downloaded video file")

            if req.remove_audio:
                # Remove audio completely using ffmpeg (-an) to make it 100% silent
                try:
                    copy_cmd = [
                        "ffmpeg", "-y", "-i", str(downloaded_file),
                        "-an", "-c:v", "copy",
                        str(target_path)
                    ]
                    subprocess.check_call(copy_cmd)
                except Exception:
                    reencode_cmd = [
                        "ffmpeg", "-y", "-i", str(downloaded_file),
                        "-an", "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
                        str(target_path)
                    ]
                    subprocess.check_call(reencode_cmd)
            else:
                # Keep audio, ensure standardized mp4 format (h264 + aac)
                try:
                    copy_cmd = [
                        "ffmpeg", "-y", "-i", str(downloaded_file),
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
                        str(target_path)
                    ]
                    subprocess.check_call(copy_cmd)
                except Exception:
                    reencode_cmd = [
                        "ffmpeg", "-y", "-i", str(downloaded_file),
                        "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "128k",
                        str(target_path)
                    ]
                    subprocess.check_call(reencode_cmd)
            
            if downloaded_file and os.path.exists(downloaded_file) and str(downloaded_file) != str(target_path):
                try:
                    os.remove(downloaded_file)
                except Exception:
                    pass

            try:
                probe_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(target_path)]
                res = subprocess.check_output(probe_cmd).decode().strip()
                duration = float(res)
            except Exception:
                pass
        
        return {
            "success": True,
            "filename": target_filename,
            "title": title,
            "duration": duration,
            "video_url": f"/backend/extraction/download/{target_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch video from URL: {str(e)}")

@router.post("/")
def generate_clip(req: ExtractRequest):
    try:
        result = extract_clip(req.reciter, req.surah, req.start, req.end, pad_seconds=req.pad_seconds)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to extract clip. Check logs.")
        
        mp3_path, json_path = result
        mp3_filename = os.path.basename(mp3_path)
        json_filename = os.path.basename(json_path)
        
        return {
            "success": True,
            "mp3_filename": mp3_filename,
            "json_filename": json_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/custom")
async def generate_custom_clip(
    surah: int = Form(...),
    start: int = Form(...),
    end: int = Form(...),
    pad_seconds: float = Form(0.0),
    filename: Optional[str] = Form(None),
    trim_start: Optional[float] = Form(None),
    trim_end: Optional[float] = Form(None),
    audio_file: Optional[UploadFile] = File(None)
):
    source_audio_path = None
    temp_file_path = None
    trimmed_path = None
    try:
        temp_dir = Path("/app/data/temp_extraction")
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        if filename:
            candidate = Path("/app/data/extracted_clips") / filename
            if not candidate.exists():
                candidate = temp_dir / filename
            if not candidate.exists():
                raise HTTPException(status_code=404, detail=f"Audio file '{filename}' not found.")
            source_audio_path = candidate
        elif audio_file:
            temp_file_path = temp_dir / audio_file.filename
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(audio_file.file, buffer)
            source_audio_path = temp_file_path
        else:
            raise HTTPException(status_code=400, detail="Either filename or audio_file must be provided.")

        is_pretrimmed = False
        if trim_start is not None and trim_end is not None and trim_end > trim_start:
            is_pretrimmed = True
            import time
            trimmed_path = temp_dir / f"trimmed_{int(time.time()*1000)}.mp3"
            duration = trim_end - trim_start
            cmd = [
                "ffmpeg", "-y",
                "-i", str(source_audio_path),
                "-ss", str(trim_start),
                "-t", str(duration),
                "-c:a", "libmp3lame", "-q:a", "2",
                str(trimmed_path)
            ]
            subprocess.run(cmd, check=True)
            clip_input_path = trimmed_path
        else:
            clip_input_path = source_audio_path
            
        result = extract_custom_clip(str(clip_input_path), surah, start, end, pad_seconds=pad_seconds, is_pretrimmed=is_pretrimmed)
            
        if not result:
            raise HTTPException(status_code=400, detail="Failed to align custom clip. Check logs.")
            
        audio_path, json_path = result
        json_filename = os.path.basename(json_path)
        mp3_filename = os.path.basename(audio_path)
        
        return {
            "success": True,
            "mp3_filename": mp3_filename,
            "json_filename": json_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file_path and temp_file_path.exists():
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
        if trimmed_path and trimmed_path.exists():
            try:
                os.remove(trimmed_path)
            except Exception:
                pass

@router.get("/download/{filename}")
def download_extracted(filename: str):
    file_path = Path("/app/data/extracted_clips") / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    if filename.endswith(".mp4"):
        media_type = "video/mp4"
    elif filename.endswith(".webm"):
        media_type = "video/webm"
    elif filename.endswith(".mp3"):
        media_type = "audio/mpeg"
    else:
        media_type = "application/json"
    return FileResponse(str(file_path), media_type=media_type)

@router.delete("/{filename}")
def delete_clip(filename: str):
    file_path = Path("/app/data/extracted_clips") / filename
    if file_path.exists():
        os.remove(file_path)
        return {"success": True}
    return {"success": False, "message": "Not found"}

@router.delete("/cleanup/all")
def cleanup_all():
    """Clear all temporary audio/video files to free up space."""
    import shutil
    try:
        paths_to_clean = [
            Path("/app/data/temp_extraction"),
            Path("/app/data/extracted_clips")
        ]
        
        for path in paths_to_clean:
            if path.exists():
                for item in path.iterdir():
                    if item.is_file():
                        item.unlink()
                    elif item.is_dir():
                        shutil.rmtree(item)
        
        return {"success": True, "message": "Backend cleanup completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
