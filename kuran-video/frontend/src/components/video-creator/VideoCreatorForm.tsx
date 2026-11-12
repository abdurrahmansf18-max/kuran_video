"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  MusicalNoteIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import DropdownSelect from "@/components/ui/DropdownSelect";
import { useLanguage } from "@/lib/LanguageContext";
import { fixMojibake } from "@/lib/textEncoding";
import quranData from "@/data/quran.json";
import quranUthmaniDataRaw from "@/data/quran_uthmani.json";
const quranUthmaniMap = quranUthmaniDataRaw as Record<string, Record<string, string>>;

import TranslationSelector from "@/components/quran/TranslationSelector";
import { useTranslationContext } from "@/lib/TranslationContext";
import ManualSegmentationEditor from "./ManualSegmentationEditor";
import AyahSearch from "./../quran/AyahSearch";

const RECITER_OPTIONS = [
  { id: "mishary_alafasy", name: "Mishary Rashed Alafasy", arName: "مشاري راشد العفاسي" },
  { id: "maher_muaiqly", name: "Maher Al-Muaiqly", arName: "ماهر المعيقلي" },
  { id: "ahmed_ajmi", name: "Ahmed Al-Ajmi", arName: "أحمد العجمي" },
  { id: "yasser_dosari", name: "Yasser Al-Dosari", arName: "ياسر الدوسري" },
  { id: "abdullah_mousa", name: "Abdullah Al-Mousa", arName: "عبدالله الموسى" },
  { id: "raad_alkurdi", name: "Raad Mohammad Al Kurdi", arName: "رعد محمد الكردي" },
];

const EXTENDED_RECITER_LIST = [
  ...RECITER_OPTIONS,
  { id: "islam_sobhi", name: "İslam Sobhi", arName: "إسلام صبحي" },
  { id: "mohammed_dibirov", name: "Mohammed Dibirov", arName: "محمد ديبيروف" },
  { id: "abdurrahman_sudais", name: "Abdurrahman es-Sudeys", arName: "عبد الرحمن السديس" },
  { id: "saud_shuraim", name: "Saud eş-Şureym", arName: "سعود الشريم" },
  { id: "abu_bakr_shatri", name: "Ebubekir Şatıri", arName: "أبو بكر الشاطري" },
  { id: "saad_ghamidi", name: "Saad el-Ghamidi", arName: "سعد الغامدي" },
  { id: "nasser_qatami", name: "Nasser Al Qatami", arName: "ناصر القطامي" },
  { id: "fatih_collak", name: "Fatih Çollak", arName: "فاتح تشولاك" },
  { id: "ishak_danis", name: "İshak Danış", arName: "إسحاق دانيش" },
  { id: "custom", name: "➕ Başka Bir İsim (Manuel Giriş)", arName: "➕ قارئ آخر (إدخال يدوي)" },
];

export const ARABIC_FONT_OPTIONS = [
  { id: "kfgqpc", name: "Medine Mushafı Naskh (KFGQPC)", arName: "خط النسخ - مجمع الملك فهد" },
  { id: "uthmanic_hafs", name: "Osmani Hafs (Uthmanic Hafs)", arName: "خط الرسم العثماني لحفص" },
  { id: "amiri_quran", name: "Amiri Kur'an Hattı (Klasik)", arName: "خط الأميري للقرآن" },
  { id: "scheherazade", name: "Şehrazad Naskh (Scheherazade)", arName: "خط شهرزاد" },
  { id: "noto_naskh", name: "Noto Naskh Arabic", arName: "خط نوتو نسخ" },
  { id: "ruqaa", name: "Rik'a / Ruqaa (Zarif Hat)", arName: "خط الرقعة" },
  { id: "mushaf_pua", name: "Sayfa Mushafı (Kral Fehd PUA)", arName: "خط صفحات المصحف الشريف" },
];

export const TRANSLATION_FONT_OPTIONS = [
  { id: "system", name: "Sistem Fontu (Modern & Sade)", arName: "خط النظام الافتراضي" },
  { id: "jakarta", name: "Plus Jakarta Sans (Şık & Çağdaş)", arName: "بلس جاكرتا سانس" },
  { id: "inter", name: "Inter (Yüksek Okunabilirlik)", arName: "إنتر (وضوح عالي)" },
  { id: "montserrat", name: "Montserrat (Geometrik Sans)", arName: "مونتسيرات" },
  { id: "playfair", name: "Playfair Display (Zarif Serif)", arName: "بليفيلد ديسبلاي (سيريف)" },
  { id: "cinzel", name: "Cinzel (Klasik & Sinematik)", arName: "سينزل (كلاسيكي)" },
  { id: "sansita", name: "Sansita (Vurgulu & Özel)", arName: "سانسيتا" },
];

export const ARABIC_FONT_STYLES: Record<string, string> = {
  kfgqpc: "'KFGQPC Uthman Taha Naskh', 'Amiri Quran', serif",
  uthmanic_hafs: "'Uthmanic Hafs', 'KFGQPC Uthman Taha Naskh', serif",
  amiri_quran: "'Amiri Quran', 'Amiri', serif",
  scheherazade: "'Scheherazade New', 'Amiri Quran', serif",
  noto_naskh: "'Noto Naskh Arabic', 'Amiri', serif",
  ruqaa: "'Ruqaa', 'Amiri Quran', serif",
  mushaf_pua: "serif",
};

export const TRANSLATION_FONT_STYLES: Record<string, string> = {
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  jakarta: "'Plus Jakarta Sans', sans-serif",
  inter: "'Inter', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  playfair: "'Playfair Display', serif",
  cinzel: "'Cinzel', serif",
  sansita: "'Sansita', sans-serif",
};
import AudioTrimmer from "./AudioTrimmer";
import { BackgroundStyle, VideoState } from "@/types/video";




interface Verse {
  id: number;
  text: string;
  translation?: string;
  page?: number;
}

interface Surah {
  id: number;
  name: string;
  transliteration: string;
  total_verses: number;
  verses: Verse[];
}

type RenderState = "idle" | "rendering" | "done" | "error";

interface ApiAyah {
  ayah_number: number;
  text_arabic: string;
  text_turkish: string;
}

interface ApiSurah {
  id: number;
  name_arabic: string;
  name_turkish: string;
  name_transliteration: string;
  ayahs: ApiAyah[];
}

export default function VideoCreatorForm() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const surahs = quranData as Surah[];
  const { selectedTranslation, setSelectedTranslationId, getTranslation, fetchSurahTranslations } = useTranslationContext();

  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedApiSurah, setSelectedApiSurah] = useState<ApiSurah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<string>("mishary_alafasy");
  const [customReciterId, setCustomReciterId] = useState<string>("mishary_alafasy");
  const [manualReciterName, setManualReciterName] = useState<string>("");
  const [startVerse, setStartVerse] = useState<number | null>(null);
  const [endVerse, setEndVerse] = useState<number | null>(null);
  
  // Background Video & Media states
  const [bgVideoSourceMode, setBgVideoSourceMode] = useState<"upload" | "link">("upload");
  const [bgMedia, setBgMedia] = useState<File | null>(null);
  const [bgMediaType, setBgMediaType] = useState<"video" | "image" | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [bgVideoDuration, setBgVideoDuration] = useState<number | null>(null);
  const [keepBgVideoAudio, setKeepBgVideoAudio] = useState<boolean>(false);
  const [bgVideoVolume, setBgVideoVolume] = useState<number>(0.3);
  const [bgVideoUrlInput, setBgVideoUrlInput] = useState<string>("");
  const [isFetchingBgVideo, setIsFetchingBgVideo] = useState<boolean>(false);
  const [linkBgVideoData, setLinkBgVideoData] = useState<{
    filename: string;
    title: string;
    duration: number;
    video_url: string;
  } | null>(null);

  // Typography & Font states
  const [selectedArabicFont, setSelectedArabicFont] = useState<string>("kfgqpc");
  const [selectedTranslationFont, setSelectedTranslationFont] = useState<string>("system");
  const [arabicFontSize, setArabicFontSize] = useState<number>(42);
  const [translationFontSize, setTranslationFontSize] = useState<number>(42);

  const [renderState, setRenderState] = useState<RenderState>("idle");
  const [toast, setToast] = useState<{message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgVideoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (bgVideoPreviewRef.current) {
      bgVideoPreviewRef.current.volume = bgVideoVolume;
    }
  }, [bgVideoVolume]);

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3500);
  };
  const [surahTurkishNames, setSurahTurkishNames] = useState<Map<number, string>>(
    new Map(surahs.map((s) => [s.id, s.transliteration]))
  );
  const [renderError, setRenderError] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioSourceMode, setAudioSourceMode] = useState<"reciter" | "custom">("reciter");
  const [audioUrlInput, setAudioUrlInput] = useState("");
  const [isFetchingUrlAudio, setIsFetchingUrlAudio] = useState(false);
  const [linkAudioData, setLinkAudioData] = useState<{
    filename: string;
    title: string;
    duration: number;
    audio_url: string;
  } | null>(null);
  const [isPreTrimmingLinkAudio, setIsPreTrimmingLinkAudio] = useState(false);
  const [linkAudioTrimStart, setLinkAudioTrimStart] = useState<number>(0);
  const [linkAudioTrimEnd, setLinkAudioTrimEnd] = useState<number>(0);

  const [segmentationProgress, setSegmentationProgress] = useState<string | null>(null);
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [pendingSegmentationData, setPendingSegmentationData] = useState<any[]>([]);

  const [showAudioTrimmer, setShowAudioTrimmer] = useState(false);
  const [preparedAudioUrl, setPreparedAudioUrl] = useState<string | null>(null);
  const [preparedAudioLocalPath, setPreparedAudioLocalPath] = useState<string | null>(null);
  const [preparedJsonData, setPreparedJsonData] = useState<any>(null);
  const [audioTrimStart, setAudioTrimStart] = useState<number>(0);
  const [audioTrimEnd, setAudioTrimEnd] = useState<number>(0);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [audioProgressStage, setAudioProgressStage] = useState<string | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);
  // The URL of the final trimmed audio for inline playback preview
  const [trimmedPreviewUrl, setTrimmedPreviewUrl] = useState<string | null>(null);

  const handleFetchUrlAudio = async () => {
    if (!audioUrlInput.trim()) {
      showToast(isArabic ? "يرجى إدخال رابط صالح" : "Lütfen geçerli bir YouTube veya video/ses linki girin.");
      return;
    }

    setIsFetchingUrlAudio(true);
    setRenderError("");
    try {
      const res = await fetch("/api/video/fetch-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: audioUrlInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isArabic ? "تعذر تنزيل الصوت من الرابط" : "Linkten ses indirilemedi."));
      }

      setLinkAudioData({
        filename: data.filename,
        title: data.title,
        duration: data.duration,
        audio_url: data.audio_url,
      });

      setPreparedAudioUrl(null);
      setPreparedAudioLocalPath(null);
      setPreparedJsonData(null);
      setTrimmedPreviewUrl(null);
      setVideoUrl(null);
      setRenderState("idle");

      setLinkAudioTrimStart(0);
      setLinkAudioTrimEnd(Math.min(data.duration || 60, 60));
      setAudioTrimStart(0);
      setAudioTrimEnd(0);
      setIsPreTrimmingLinkAudio(true);
      
      showToast(isArabic ? "تم جلب الصوت بنجاح! يمكنك الآن تحديد المقطع المطلوب بالفأرة." : "Ses getirildi! Şimdi farenizle ayetlerin geçtiği aralığı seçebilirsiniz.");
    } catch (err: any) {
      setRenderError(err.message || "Bağlantıdan ses alınamadı");
    } finally {
      setIsFetchingUrlAudio(false);
    }
  };

  const removeLinkAudio = () => {
    setLinkAudioData(null);
    setAudioUrlInput("");
    setLinkAudioTrimStart(0);
    setLinkAudioTrimEnd(0);
    setPreparedAudioUrl(null);
    setPreparedAudioLocalPath(null);
    setPreparedJsonData(null);
    setTrimmedPreviewUrl(null);
    setAudioTrimStart(0);
    setAudioTrimEnd(0);
    setVideoUrl(null);
    setRenderState("idle");
  };

  const getFinalReciterName = (): string => {
    if (audioSourceMode === "custom") {
      if (customReciterId === "custom") {
        return manualReciterName.trim();
      }
      const found = EXTENDED_RECITER_LIST.find((r) => r.id === customReciterId);
      if (found) {
        return isArabic ? found.arName : found.name;
      }
      return manualReciterName.trim();
    } else {
      const reciterObj = RECITER_OPTIONS.find((r) => r.id === selectedReciter);
      return reciterObj ? (isArabic ? reciterObj.arName : reciterObj.name) : selectedReciter;
    }
  };

  const handlePrepareAudio = async () => {
    if (!selectedSurah || startVerse === null || endVerse === null) return;
    
    // If we already have prepared audio (meaning parameters haven't changed), just reopen the trimmer
    if (preparedAudioUrl) {
      setShowAudioTrimmer(true);
      return;
    }

    if (audioSourceMode === "custom" && !linkAudioData) {
      showToast(isArabic ? "يرجى جلب الصوت من الرابط أولاً" : "Lütfen önce bir link girip sesi getirin.");
      return;
    }
    
    setIsPreparingAudio(true);
    setAudioProgressStage(isArabic ? "⬇️ تحميل الملف الصوتي..." : "⬇️ Ses dosyası indiriliyor...");
    try {
      const formData = new FormData();
      formData.append("surahId", selectedSurah.id.toString());
      formData.append("startVerse", startVerse.toString());
      formData.append("endVerse", endVerse.toString());
      formData.append("reciterId", audioSourceMode === "custom" ? customReciterId : selectedReciter);
      const finalReciterName = getFinalReciterName();
      if (finalReciterName) formData.append("reciterName", finalReciterName);
      if (audioSourceMode === "custom" && linkAudioData) {
        formData.append("audioFilename", linkAudioData.filename);
        if (linkAudioTrimEnd > linkAudioTrimStart) {
          formData.append("trimStart", linkAudioTrimStart.toString());
          formData.append("trimEnd", linkAudioTrimEnd.toString());
        }
      }
      // Add 10.0s padding so the user can use the AudioTrimmer UI to expand the selection if needed
      formData.append("padSeconds", "10.0");

      setAudioProgressStage(isArabic ? "🔍 تحليل الموجات الصوتية..." : "🔍 Ses dalgaları analiz ediliyor...");

      const res = await fetch("/api/video/prepare-audio", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAudioProgressStage(isArabic ? "✂️ جاري تجهيز النتيجة..." : "✂️ Sonuç hazırlanıyor...");
          
          // If the audio was already pre-trimmed by the user from external link,
          // do NOT shrink the selection to word boundaries — preserve the user's exact cut!
          let defaultRegionStart = 0;
          let defaultRegionEnd = 0;
          if (audioSourceMode === "custom" && linkAudioTrimEnd > linkAudioTrimStart) {
            defaultRegionStart = 0;
            defaultRegionEnd = 0;
          } else if (data.wordTimingsData && data.wordTimingsData.verses) {
            let minStart = Infinity;
            let maxEnd = 0;
            Object.values(data.wordTimingsData.verses).forEach((v: any) => {
              v.words?.forEach((w: any) => {
                if (w.start < minStart) minStart = w.start;
                if (w.end > maxEnd) maxEnd = w.end;
              });
            });
            if (minStart !== Infinity) {
              defaultRegionStart = Math.max(0, (minStart / 1000) - 0.25);
              defaultRegionEnd = (maxEnd / 1000) + 0.75;
            }
          }
          
          setAudioTrimStart(defaultRegionStart);
          setAudioTrimEnd(defaultRegionEnd);
          
          setPreparedAudioUrl(data.audioUrl);
          setPreparedAudioLocalPath(data.localAudioPath);
          setPreparedJsonData(data.wordTimingsData);
          setTrimmedPreviewUrl(null);
          setShowAudioTrimmer(true);
        } else {
          showToast(data.error);
        }
      } else {
        const errData = await res.json().catch(() => null);
        if (errData && errData.error) {
          showToast(errData.error);
        } else {
          showToast(isArabic ? "فشل تجهيز الصوت. حدث خطأ في الخادم." : "Ses hazırlanamadı. Sunucu hatası.");
        }
      }
    } catch (e) {
      console.error(e);
      showToast(isArabic ? "حدث خطأ أثناء الاتصال بالخادم" : "Sunucuya bağlanırken hata oluştu");
    } finally {
      setIsPreparingAudio(false);
      setAudioProgressStage(null);
    }
  };

  const handleAudioTrimConfirm = async (trimStart: number, trimEnd: number) => {
    setAudioTrimStart(trimStart);
    setAudioTrimEnd(trimEnd);
    setShowAudioTrimmer(false);

    if ((trimStart > 0 || trimEnd > 0) && preparedAudioLocalPath) {
      setIsTrimming(true);
      try {
        const res = await fetch("/api/video/trim-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioPath: preparedAudioLocalPath,
            trimStart,
            trimEnd,
            wordTimingsData: preparedJsonData,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Only update the preview URL. Do NOT overwrite the original prepared data, 
            // so the trimmer handles stay correct and the video generator can perform the final cut.
            setTrimmedPreviewUrl(data.audioUrl);
          }
        } else {
          console.error("Trim failed", await res.text());
        }
      } catch (err) {
        console.error("Trim API error:", err);
      } finally {
        setIsTrimming(false);
      }
    } else {
      setTrimmedPreviewUrl(preparedAudioUrl);
    }
  };


  const executeVideoRender = async (pendingSegmentationData: any[] | null = null) => {
    try {
      if (pendingSegmentationData && pendingSegmentationData.length > 0) {
        setSegmentationProgress(
          isArabic ? "جاري تطبيق التقسيم..." : "Bölümleme uygulanıyor..."
        );

        const applyRes = await fetch("/api/segmentation/apply", {
          method: "POST",
          body: JSON.stringify(pendingSegmentationData),
          headers: { "Content-Type": "application/json" },
        });

        if (!applyRes.ok) {
          const applyData = await applyRes.json();
          console.warn(`[UI] Failed to apply segmentation: ${applyData.error}. Continuing without segmentation.`);
          await fetch("/api/segmentation/clear", { method: "POST" }).catch(() => {});
        } else {
          console.log(`[UI] Successfully applied segmentation for ${pendingSegmentationData.length} verses`);
        }
      }

      setSegmentationProgress(null);

      // Build form data and render video
      const formData = new FormData();
      if (!selectedSurah || !startVerse || !endVerse) throw new Error("Missing required fields");
      formData.append("surahId", String(selectedSurah.id));
      formData.append("startVerse", String(startVerse));
      formData.append("endVerse", String(endVerse));

      formData.append("reciterId", audioSourceMode === "custom" ? customReciterId : selectedReciter);
      const finalReciterName = getFinalReciterName();
      if (finalReciterName) {
        formData.append("reciterName", finalReciterName);
      }
      if (audioSourceMode === "custom" && linkAudioData) {
        formData.append("audioFilename", linkAudioData.filename);
      }

      if (linkBgVideoData) {
        formData.append("bgVideoFilename", linkBgVideoData.filename);
      } else if (bgMedia) {
        if (bgMediaType === "video") {
          formData.append("bgVideo", bgMedia);
        } else {
          formData.append("bgImage", bgMedia);
        }
      }
      formData.append("keepBackgroundVideoAudio", keepBgVideoAudio ? "true" : "false");
      formData.append("backgroundVideoVolume", String(bgVideoVolume));
      formData.append("arabicFontFamily", selectedArabicFont);
      formData.append("translationFontFamily", selectedTranslationFont);
      formData.append("arabicFontSize", String(arabicFontSize));
      formData.append("translationFontSize", String(translationFontSize));
      if (selectedTranslation) {
        formData.append("translationId", selectedTranslation.id);
      }

      if (preparedAudioUrl) {
        formData.append("usePreparedAudio", "true");
        if (preparedAudioLocalPath) formData.append("preparedAudioLocalPath", preparedAudioLocalPath);
        if (preparedJsonData) formData.append("preparedJsonData", JSON.stringify(preparedJsonData));
        if (audioTrimStart > 0 || audioTrimEnd > 0) {
          formData.append("trimStart", String(audioTrimStart));
          formData.append("trimEnd", String(audioTrimEnd));
        }
      }

      console.log("[UI] Sending payload:", Object.fromEntries(formData.entries()));

      const response = await fetch("/api/video/render", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.videoUrl) {
        throw new Error(data.error || "Video render failed");
      }

      setVideoUrl(`${data.videoUrl}?t=${Date.now()}`);
      setRenderState("done");
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : "تعذر إنشاء الفيديو");
      setRenderState("error");
    } finally {
      setSegmentationProgress(null);
    }
  };

  const versesArray = useMemo(
    () =>
      startVerse && endVerse
        ? Array.from({ length: endVerse - startVerse + 1 }, (_, i) => startVerse + i)
        : [],
    [startVerse, endVerse]
  );

  const selectedVersesContent =
    selectedSurah && startVerse && endVerse
      ? selectedSurah.verses
          .filter((verse) => verse.id >= startVerse && verse.id <= endVerse)
          .map((verse) => {
            const apiAyah = selectedApiSurah?.ayahs.find((ayah) => ayah.ayah_number === verse.id);
            const fallbackTranslation = fixMojibake(apiAyah?.text_turkish || "");
            
            const isPuaFont = selectedArabicFont === "mushaf_pua";
            const uthmaniText = quranUthmaniMap[String(selectedSurah.id)]?.[String(verse.id)];
            const arabicText = isPuaFont
              ? fixMojibake(verse.text)
              : (uthmaniText || fixMojibake(apiAyah?.text_arabic || verse.text));

            return {
              ...verse,
              text: arabicText,
              translation: getTranslation(selectedSurah.id, verse.id, fallbackTranslation),
              page: verse.page,
            };
          })
      : [];

  const canGenerate = Boolean(
    renderState !== "rendering" && 
    selectedSurah && startVerse && endVerse && 
    preparedAudioUrl !== null
  );

  // Reset prepared audio if user changes audio-related selection (NOT background)
  useEffect(() => {
    setPreparedAudioUrl(null);
    setPreparedAudioLocalPath(null);
    setPreparedJsonData(null);
    setAudioTrimStart(0);
    setAudioTrimEnd(0);
    setTrimmedPreviewUrl(null);
    setVideoUrl(null);
    setRenderState("idle");
  }, [selectedSurah, startVerse, endVerse, selectedReciter, customReciterId, manualReciterName, linkAudioData, audioSourceMode]);

  // Cleanup generated temp files on initial page load
  useEffect(() => {
    fetch("/api/video/cleanup", { method: "DELETE" })
      .catch(err => console.warn("Failed to cleanup on mount", err));
  }, []);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/backend";
    fetch(`${baseUrl}/surahs/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) {
          setSurahTurkishNames(
            new Map(data.map((s: { id: number; name_turkish: string }) => [s.id, s.name_turkish]))
          );
        }
      })
      .catch(() => {});
      
    // Default to "none" in the Video Creator
    setSelectedTranslationId("none");
  }, [setSelectedTranslationId]);

  const handleSurahChange = async (surahId: number | string) => {
    surahId = Number(surahId);
    const surah = surahs.find((item) => item.id === surahId) || null;
    setSelectedSurah(surah);
    setSelectedApiSurah(null);
    setStartVerse(null);
    setEndVerse(null);
    setVideoUrl(null);
    setRenderError("");
    setRenderState("idle");

    if (!surah) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/backend";
      const response = await fetch(`${baseUrl}/surahs/${surahId}`);
      if (response.ok) {
        setSelectedApiSurah(await response.json());
      }
      
      // Fetch dynamic translations for the selected surah
      await fetchSurahTranslations(surah.id);
      
    } catch {
      setSelectedApiSurah(null);
    }
  };

  useEffect(() => {
    if (selectedSurah) {
      fetchSurahTranslations(selectedSurah.id);
    }
  }, [selectedSurah?.id, selectedTranslation.id, fetchSurahTranslations]);

  const handleStartVerseChange = (verse: number | string) => {
    let num = Number(verse);
    if (isNaN(num) || num < 1) num = 1;
    if (selectedSurah && num > selectedSurah.total_verses) num = selectedSurah.total_verses;
    setStartVerse(num);
    setEndVerse(num);
    setVideoUrl(null);
    setRenderError("");
    setRenderState("idle");
  };

  const estimateDuration = (start: number, end: number) => {
    if (!selectedSurah) return 0;
    let totalWords = 0;
    for (let i = start; i <= end; i++) {
      const verse = selectedSurah.verses.find((v: any) => v.id === i);
      if (verse) {
        totalWords += verse.text.trim().split(/\s+/).length;
      }
    }
    return totalWords * 0.8; // Assume 0.8 seconds per word on average
  };

  const handleAddNextVerse = () => {
    if (!selectedSurah || endVerse === null) return;
    if (!selectedSurah || endVerse === null || startVerse === null) return;
    
    // Check limit before adding
    const currentEst = estimateDuration(startVerse, endVerse);
    const nextVerse = selectedSurah.verses.find((v: any) => v.id === endVerse + 1);
    const nextWords = nextVerse ? nextVerse.text.trim().split(/\s+/).length : 0;
    const nextEst = currentEst + (nextWords * 0.8);
    
    if (nextEst > 90 ) {
      showToast(isArabic 
        ? "لقد وصلت إلى الحد الأقصى لمدة الفيديو (90 ثانية) ." 
        : "Maksimum video süresine (90 saniye) ulaştınız.");
      return;
    }

    if (endVerse < selectedSurah.total_verses) {
      setEndVerse(endVerse + 1);
    }
    setVideoUrl(null);
    setRenderError("");
    setRenderState("idle");
  };

  const handleRemoveLastVerse = () => {
    if (startVerse === null || endVerse === null) return;
    if (endVerse > startVerse) {
      setEndVerse(endVerse - 1);
    }
    setVideoUrl(null);
    setRenderError("");
    setRenderState("idle");
  };

  const handleFetchBgVideoFromUrl = async () => {
    if (!bgVideoUrlInput.trim()) {
      showToast(isArabic ? "يرجى إدخال رابط فيديو صالح" : "Lütfen geçerli bir video veya YouTube linki girin.");
      return;
    }

    setIsFetchingBgVideo(true);
    setRenderError("");
    try {
      const res = await fetch("/api/video/fetch-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: bgVideoUrlInput.trim(),
          removeAudio: false
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isArabic ? "تعذر تنزيل الفيديو من الرابط" : "Linkten video indirilemedi."));
      }

      setLinkBgVideoData({
        filename: data.filename,
        title: data.title,
        duration: data.duration,
        video_url: data.video_url,
      });

      setBgMedia(null);
      setBgMediaType("video");
      setBgPreview(data.video_url);
      setBgVideoDuration(data.duration);
      setVideoUrl(null);
      setRenderState("idle");

      showToast(isArabic ? "تم جلب فيديو الخلفية بنجاح!" : "Arka plan videosu başarıyla getirildi!");
    } catch (err: any) {
      setRenderError(err.message || "Bağlantıdan video alınamadı");
    } finally {
      setIsFetchingBgVideo(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (bgPreview && bgPreview.startsWith("blob:")) {
      URL.revokeObjectURL(bgPreview);
    }

    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v|mkv)$/i.test(file.name);
    setBgMedia(file);
    setBgMediaType(isVideo ? "video" : "image");
    setLinkBgVideoData(null);
    const objectUrl = URL.createObjectURL(file);
    setBgPreview(objectUrl);

    if (isVideo) {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.onloadedmetadata = () => {
        setBgVideoDuration(tempVideo.duration);
      };
      tempVideo.src = objectUrl;
    } else {
      setBgVideoDuration(null);
    }

    setVideoUrl(null);
    setRenderState("idle");
  };

  const removeMedia = () => {
    if (bgPreview && bgPreview.startsWith("blob:")) {
      URL.revokeObjectURL(bgPreview);
    }
    setBgMedia(null);
    setBgMediaType(null);
    setBgPreview(null);
    setBgVideoDuration(null);
    setLinkBgVideoData(null);
    setBgVideoUrlInput("");
    setVideoUrl(null);
    setRenderState("idle");
  };

  const LONG_VERSE_THRESHOLD = 7; // Only segment verses with more than 7 Arabic words

  const handleSegmentLongVerses = async () => {
    if (!selectedSurah || selectedVersesContent.length === 0) return;

    const segmentationResults = [];
      setSegmentationProgress(isArabic ? "جاري تقسيم الآيات..." : "Ayetler bölümleniyor...");

    for (const verse of selectedVersesContent) {
      const arabicWordCount = verse.text.trim().split(/\s+/).length;
      const translation = verse.translation || "";

      if (!translation.trim()) continue;

      let gotAutoSegmentation = false;

      // Only call AI if it's reasonably long, to save time and tokens
      if (arabicWordCount >= 6) {
        try {
          const segRes = await fetch("/api/segmentation/auto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              surah: selectedSurah.id,
              ayah: verse.id,
              translation,
              arabicWordCount,
            }),
          });

          if (segRes.ok) {
            const segData = await segRes.json();
            if (segData.success && segData.mappings && segData.mappings.length > 1) {
              segmentationResults.push({
                surah: selectedSurah.id,
                ayah: verse.id,
                mappings: segData.mappings,
              });
              gotAutoSegmentation = true;
            }
          }
        } catch (err) {
          console.warn(`[UI] Auto-segmentation error for verse ${verse.id}:`, err);
        }
      }

      // If AI didn't segment it (too short, failed, or returned 1 segment), add as a single block
      // so the user can still manually divide it in the editor.
      if (!gotAutoSegmentation) {
        segmentationResults.push({
          surah: selectedSurah.id,
          ayah: verse.id,
          mappings: [
            {
              part: 1,
              translation_text: translation,
              arabic_unit_count: arabicWordCount,
            },
          ],
        });
      }
    }

    if (segmentationResults.length > 0) {
      setPendingSegmentationData(segmentationResults);
    } else {
      showToast(isArabic ? "لم يتم العثور على ترجمات للآيات المحددة." : "Seçili ayetler için çeviri bulunamadı.");
    }
    setSegmentationProgress(null);
  };

  const handleClearSegmentation = async () => {
    setPendingSegmentationData([]);
    await fetch("/api/segmentation/clear", { method: "POST" }).catch(() => {});
  };

  const handleGenerateVideo = async () => {
    if (!selectedSurah || !startVerse || !endVerse) return;

    setRenderState("rendering");
    setRenderError("");
    setVideoUrl(null);
    setSegmentationProgress(null);

    try {
      await executeVideoRender(pendingSegmentationData.length > 0 ? pendingSegmentationData : null);
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : "تعذر إنشاء الفيديو");
      setRenderState("error");
      setSegmentationProgress(null);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8" dir={isArabic ? "rtl" : "ltr"}>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient-gold">
          {isArabic ? "صانع الفيديو القرآني" : "Kuran Videosu Oluşturucu"}
        </h1>
        <p className="text-muted-foreground">
          {isArabic
            ? "اختر السورة والآيات والخلفية والقارئ، ثم أنشئ فيديو جاهزًا للتحميل."
            : "Sureyi, ayetleri, arka planı ve kariyi seçip indirilebilir video oluşturun."}
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                1
              </span>
              {isArabic ? "اختيار السورة والآيات" : "Sure ve Ayet Seçimi"}
            </h2>

            <AyahSearch 
              isArabic={isArabic} 
              onSelect={(surahId, ayahId) => {
                const targetSurah = surahs.find(s => s.id === surahId);
                if (targetSurah) {
                  setSelectedSurah(targetSurah);
                  setStartVerse(ayahId);
                  setEndVerse(ayahId);
                  setPendingSegmentationData([]);
                }
              }} 
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DropdownSelect
                label={isArabic ? "السورة" : "Sure"}
                placeholder={isArabic ? "اختر السورة..." : "Sure seçin..."}
                options={surahs.map((surah) => {
                  const turkishName = surahTurkishNames.get(surah.id);
                  let label: string;
                  if (isArabic) {
                    label = `سورة ${fixMojibake(surah.name)}`;
                  } else if (turkishName) {
                    label = `${fixMojibake(turkishName)} Suresi`;
                  } else {
                    label = `${fixMojibake(surah.transliteration)} Suresi`;
                  }
                  return {
                    value: String(surah.id),
                    label,
                  };
                })}
                value={selectedSurah ? String(selectedSurah.id) : null}
                onChange={(val) => {
                  const surah = surahs.find((s) => String(s.id) === val);
                  setSelectedSurah(surah || null);
                  if (surah) {
                    setStartVerse(1);
                    setEndVerse(1);
                  }
                }}
                isRtl={isArabic}
                showNumberBadge
                disabled={false}
                enableSearch={true}
                searchPlaceholder={isArabic ? "ابحث عن سورة..." : "Sure ara..."}
              />

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-sm font-medium text-foreground">
                  {isArabic ? "الترجمة" : "Çeviri"}
                </label>
                <div className="h-[50px] flex items-center w-full">
                  <TranslationSelector className="w-full" forceShow={true} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {isArabic ? "الآية الأولى" : "İlk Ayet"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedSurah?.total_verses ?? 1}
                  value={startVerse ?? ""}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber;
                    if (!isNaN(val)) {
                      let num = Number(val);
                      if (isNaN(num) || num < 1) num = 1;
                      if (selectedSurah && num > selectedSurah.total_verses) num = selectedSurah.total_verses;
                      setStartVerse(num);
                      setEndVerse(num);
                      setVideoUrl(null);
                      setRenderError("");
                      setRenderState("idle");
                    } else if (e.target.value === "") {
                      setStartVerse(null);
                      setEndVerse(null);
                    }
                  }}
                  disabled={!selectedSurah}
                  placeholder={
                    selectedSurah
                      ? (isArabic ? "رقم الآية..." : "Ayet numarası...")
                      : (isArabic ? "أولاً اختر السورة" : "Önce sure seçin")
                  }
                  className="w-full h-[50px] rounded-xl border border-border bg-background px-4 py-2.5 text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  dir={isArabic ? "rtl" : "ltr"}
                />
              </div>
            </div>

            {startVerse && endVerse && selectedSurah && (
              <div className="mt-6 space-y-5 rounded-2xl border border-border/50 bg-gradient-to-br from-surface/80 to-background p-5 shadow-inner-soft backdrop-blur-sm transition-all duration-300">
                <div className="flex flex-wrap gap-2.5">
                  {versesArray.map((verse) => (
                    <span 
                      key={verse} 
                      className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary shadow-sm transition-all hover:bg-primary/10"
                    >
                      {isArabic ? fixMojibake(selectedSurah.name) : fixMojibake(selectedSurah.transliteration)}: {verse}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddNextVerse}
                    disabled={endVerse >= selectedSurah.total_verses}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 glow-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    + {isArabic ? "أضف الآية التالية" : "Sonraki Ayeti Ekle"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLastVerse}
                    disabled={endVerse <= startVerse}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    - {isArabic ? "إزالة آخر آية" : "Son Ayeti Kaldır"}
                  </button>
                </div>
                
                {/* Segmentation Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-border/50">
                  {pendingSegmentationData.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowManualEditor(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-emerald-700 glow-primary shadow-lg"
                      >
                        {isArabic ? "تعديل التقسيم" : "Bölümlemeyi Düzenle"}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSegmentation}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-red-600 glow-primary shadow-lg"
                      >
                        {isArabic ? "حذف التقسيم" : "Bölümlemeyi Temizle"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSegmentLongVerses}
                      disabled={segmentationProgress !== null}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-105 glow-primary hover:bg-primary/90 disabled:opacity-50 disabled:transform-none shadow-lg"
                    >
                      {segmentationProgress ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {segmentationProgress}
                        </>
                      ) : (
                        isArabic ? "تقسيم الآيات الطويلة (اختياري)" : "Uzun Ayetleri Bölümle (İsteğe bağlı)"
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <hr className="border-border" />

          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                2
              </span>
              {isArabic ? "فيديو الخلفية (اختياري)" : "İsteğe Bağlı Arka Plan Videosu"}
            </h2>

            {/* Mode Switcher Tabs when no video/image is selected */}
            {!bgPreview && (
              <div className="flex rounded-xl bg-muted/50 p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setBgVideoSourceMode("upload")}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${bgVideoSourceMode === "upload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isArabic ? "رفع ملف فيديو / صورة" : "Video Dosyası Yükle"}
                </button>
                <button
                  type="button"
                  onClick={() => setBgVideoSourceMode("link")}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${bgVideoSourceMode === "link" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isArabic ? "رابط فيديو (يوتيوب)" : "Link ile Video Getir (YouTube vb.)"}
                </button>
              </div>
            )}

            {bgPreview ? (
              <div className="group relative flex min-h-[240px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-border/60 bg-gradient-to-b from-surface/30 to-background/50 p-6 shadow-md transition-all duration-500">
                {bgMediaType === "video" ? (
                  <video
                    ref={bgVideoPreviewRef}
                    src={bgPreview}
                    autoPlay
                    loop
                    muted={!keepBgVideoAudio}
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bgPreview} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
                )}
                
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity duration-500 group-hover:bg-black/50" />
                
                {/* Floating Badges */}
                <div className="relative z-10 flex flex-wrap gap-2 mb-auto self-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/20">
                    <VideoCameraIcon className="h-3.5 w-3.5 text-primary" />
                    {bgMediaType === "video" 
                      ? (isArabic ? "فيديو الخلفية" : "Arka Plan Videosu") 
                      : (isArabic ? "صورة الخلفية" : "Arka Plan Görseli")}
                  </span>
                  {bgVideoDuration && bgVideoDuration > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                      ⏱️ {Math.round(bgVideoDuration)}s • {isArabic ? "تكرار تلقائي (Loop)" : "Otomatik Döngü (Loop)"}
                    </span>
                  )}
                  {bgMediaType === "video" && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md border ${keepBgVideoAudio ? "bg-sky-950/80 text-sky-300 border-sky-500/40" : "bg-black/70 text-muted-foreground border-white/10"}`}>
                      {keepBgVideoAudio 
                        ? (isArabic ? "🌧️ صوت البيئة نشط" : "🌧️ Yağmur/Ortam Sesi Açık") 
                        : (isArabic ? "🔇 فيديو صامت" : "🔇 Sessiz Video")}
                    </span>
                  )}
                </div>

                {linkBgVideoData && (
                  <div className="relative z-10 my-auto text-center px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 max-w-[90%]">
                    <p className="text-xs font-medium text-white/90 line-clamp-1">{linkBgVideoData.title}</p>
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeMedia(); }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-5 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-500"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    {isArabic ? "إزالة الفيديو" : "Videoyu Kaldır"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {bgVideoSourceMode === "upload" ? (
                  <div 
                    className="group relative flex min-h-[220px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-gradient-to-b from-surface/30 to-background/50 p-6 transition-all duration-500 hover:border-primary/40 hover:bg-surface/50"
                  >
                    <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner transition-transform duration-500 group-hover:scale-110">
                        <VideoCameraIcon className="h-8 w-8" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-base font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                          {isArabic ? "رفع فيديو خلفية (MP4, WebM, MOV)" : "Arka Plan Videosu Yükleyin"}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-[80%] mx-auto">
                          {isArabic 
                            ? "يمكنك رفع فيديو بتنسيق MP4 أو WebM أو MOV. ستتم مزامنة مدة الفيديو مع الصوت وتكراره تلقائياً إذا لزم الأمر." 
                            : "Videonuz için MP4, WebM veya MOV formatında video yükleyebilirsiniz. Süre tilavete göre otomatik eşitlenir ve gerektiğinde baştan sarılır."}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleMediaUpload} 
                        accept="video/*,image/*,.mp4,.webm,.mov" 
                        className="hidden" 
                      />
                      <div className="flex items-center justify-center mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 shadow-lg glow-primary hover:scale-105 hover:bg-primary/90"
                        >
                          <CloudArrowUpIcon className="h-4 w-4" />
                          {isArabic ? "اختيار ملف فيديو" : "Video Dosyası Seç"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/80 bg-surface/40 p-5 space-y-3 shadow-sm">
                    <label className="block text-sm font-medium text-foreground">
                      {isArabic ? "رابط فيديو يوتيوب أو فيديو مباشر:" : "YouTube veya Doğrudan Video Linki:"}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <LinkIcon className="h-5 w-5" />
                        </div>
                        <input
                          type="url"
                          placeholder={isArabic ? "https://www.youtube.com/watch?v=..." : "https://www.youtube.com/watch?v=... veya mp4 linki"}
                          value={bgVideoUrlInput}
                          onChange={(e) => setBgVideoUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleFetchBgVideoFromUrl();
                            }
                          }}
                          className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleFetchBgVideoFromUrl}
                        disabled={isFetchingBgVideo || !bgVideoUrlInput.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm glow-primary"
                      >
                        {isFetchingBgVideo ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isArabic ? "جاري الجلب..." : "İndiriliyor..."}
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            {isArabic ? "جلب الفيديو" : "Videoyu Getir"}
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isArabic 
                        ? "سيتم استخراج الفيديو وتكراره تلقائياً ليتوافق تماماً مع طول التلاوة." 
                        : "YouTube veya video linki girildiğinde video arka plan olarak indirilir ve tilavet süresiyle senkronize edilir."}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Audio Retention Toggle & Modern Volume Control */}
            <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 space-y-3.5 transition-all duration-300 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={keepBgVideoAudio}
                    onChange={(e) => setKeepBgVideoAudio(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <span>🌧️</span>
                      <span>{isArabic ? "حفظ صوت الفيديو (المطر، الرياح، أصوات الطبيعة)" : "Videonun sesini koru (Yağmur, doğa ortam sesleri vb.)"}</span>
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {keepBgVideoAudio
                        ? (isArabic ? "✅ Video sesi tilavetin arkasında hafif ortam sesi olarak çalınır." : "✅ Video sesi tilavet arkasında hafif ortam sesi olarak duyulur.")
                        : (isArabic ? "🔇 Video tamamen sessiz oynatılır (yalnızca Kuran tilaveti duyulur)." : "🔇 Video tamamen sessiz oynatılır (yalnızca Kuran tilaveti duyulur).")}
                    </span>
                  </div>
                </label>

                {keepBgVideoAudio && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
                    {bgVideoVolume === 0 ? "🔇 Sessiz" : bgVideoVolume < 0.3 ? "🔈 Hafif" : bgVideoVolume < 0.6 ? "🔉 Dengeli" : "🔊 Net"} %{Math.round(bgVideoVolume * 100)}
                  </span>
                )}
              </div>

              {keepBgVideoAudio && (
                <div className="pt-3 border-t border-border/40 space-y-3 animate-fadeIn">
                  {/* Slider and Range Display */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <span>🎚️</span>
                        <span>{isArabic ? "مستوى صوت الخلفية (البيئة):" : "Manuel Ses Düzeyi Ayarı:"}</span>
                      </span>
                      <span className="font-bold text-primary text-sm">%{Math.round(bgVideoVolume * 100)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono">0%</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={bgVideoVolume}
                        onChange={(e) => setBgVideoVolume(parseFloat(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary transition-all"
                      />
                      <span className="text-xs text-muted-foreground font-mono">100%</span>
                    </div>
                  </div>

                  {/* Modern Quick Volume Presets */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-medium text-muted-foreground">{isArabic ? "خيارات سريعة:" : "Hızlı Seviyeler:"}</span>
                    {[
                      { label: isArabic ? "صامت (%0)" : "Sessiz (%0)", val: 0.0 },
                      { label: isArabic ? "خفيف (%15)" : "Hafif (%15)", val: 0.15 },
                      { label: isArabic ? "مثالي (%30)" : "Dengeli (%30)", val: 0.30 },
                      { label: isArabic ? "واضح (%50)" : "Belirgin (%50)", val: 0.50 },
                      { label: isArabic ? "كامل (%100)" : "Tam (%100)", val: 1.0 },
                    ].map((preset) => {
                      const isActive = Math.abs(bgVideoVolume - preset.val) < 0.03;
                      return (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setBgVideoVolume(preset.val)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                            isActive
                              ? "bg-primary text-white shadow-sm glow-primary"
                              : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-background"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {isArabic 
                      ? "💡 نصيحة: للحفاظ على وضوح صوت القارئ، يُفضل أن يكون صوت البيئة بين 20% و 40%." 
                      : "💡 İpucu: Kuran tilavetinin berrak ve net anlaşılması için arka plan ortam sesinin %20 ile %35 arasında tutulması önerilir."}
                  </p>
                </div>
              )}
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                3
              </span>
              {isArabic ? "الصوت" : "Ses"}
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex rounded-xl bg-muted/50 p-1 mb-2">
                <button
                  type="button"
                  onClick={() => { setAudioSourceMode("reciter"); setLinkAudioData(null); setPreparedAudioUrl(null); setPreparedJsonData(null); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${audioSourceMode === "reciter" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isArabic ? "قائمة القراء" : "Hazır Kari Listesi"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAudioSourceMode("custom"); setPreparedAudioUrl(null); setPreparedJsonData(null); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${audioSourceMode === "custom" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isArabic ? "رابط فيديو / صوت (يوتيوب)" : "Link ile Ses Ekle (YouTube vb.)"}
                </button>
              </div>

              {audioSourceMode === "reciter" ? (
                <DropdownSelect
                  placeholder={isArabic ? "مشاري راشد العفاسي" : "Mishary Rashed Alafasy"}
                  options={RECITER_OPTIONS.map(r => ({ value: r.id, label: isArabic ? r.arName : r.name }))}
                  value={selectedReciter}
                  onChange={(val) => {
                    setSelectedReciter(val as string);
                    setPreparedAudioUrl(null);
                    setPreparedAudioLocalPath(null);
                    setPreparedJsonData(null);
                    setTrimmedPreviewUrl(null);
                    setVideoUrl(null);
                    setRenderState("idle");
                  }}
                  isRtl={isArabic}
                />
              ) : (
                <div className="space-y-4">
                  {!linkAudioData ? (
                    <div className="rounded-xl border border-border/80 bg-surface/40 p-5 space-y-3 shadow-sm">
                      <label className="block text-sm font-medium text-foreground">
                        {isArabic ? "رابط يوتيوب أو فيديو/صوت مباشر:" : "YouTube veya Doğrudan Video/Ses Linki:"}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <LinkIcon className="h-5 w-5" />
                          </div>
                          <input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={audioUrlInput}
                            onChange={(e) => setAudioUrlInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFetchUrlAudio(); } }}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                            dir="ltr"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleFetchUrlAudio}
                          disabled={isFetchingUrlAudio || !audioUrlInput.trim()}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isFetchingUrlAudio ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              {isArabic ? "جاري الجلب..." : "İndiriliyor..."}
                            </>
                          ) : (
                            <>
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              {isArabic ? "جلب الصوت" : "Sesi Getir"}
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isArabic 
                          ? "الصق رابط المقطع وسيقوم النظام باستخراج الصوت تلقائياً لتقوم بقصه بالفأرة."
                          : "YouTube veya video/ses linkini yapıştırın; ses otomatik indirilecek ve fareyle seçebileceğiniz görsel zaman çizelgesi açılacaktır."}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <MusicalNoteIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground line-clamp-1">{linkAudioData.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {isArabic ? "المدة الكلية:" : "Toplam Süre:"} {Math.floor(linkAudioData.duration / 60)}:{(Math.floor(linkAudioData.duration % 60)).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeLinkAudio}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-red-500 transition-colors"
                          title={isArabic ? "إزالة الرابط" : "Linki Kaldır"}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{isArabic ? "المقطع المحدد:" : "Seçili Kırpma Aralığı:"} </span>
                          {linkAudioTrimEnd > linkAudioTrimStart ? (
                            <span className="font-semibold text-primary">
                              {Math.floor(linkAudioTrimStart / 60)}:{(Math.floor(linkAudioTrimStart % 60)).toString().padStart(2, '0')} - {Math.floor(linkAudioTrimEnd / 60)}:{(Math.floor(linkAudioTrimEnd % 60)).toString().padStart(2, '0')} ({(linkAudioTrimEnd - linkAudioTrimStart).toFixed(1)}s)
                            </span>
                          ) : (
                            <span>{isArabic ? "كامل الصوت" : "Tüm Ses"}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPreTrimmingLinkAudio(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-foreground border border-border shadow-sm hover:bg-background hover:border-primary/50 transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                          </svg>
                          {isArabic ? "تعديل المقطع بالفأرة" : "Fareyle Kesim Aralığını Düzenle"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Provide a way to tag the reciter name for the UI */}
                  <div className="space-y-3 pt-2 border-t border-border/40">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <span>🎙️</span>
                      <span>{isArabic ? "اسم القارئ / الشيخ (سيظهر في أعلى الفيديو):" : "Okuyan / Hoca İsmi (Videoda görünecektir):"}</span>
                    </label>
                    <DropdownSelect
                      placeholder={isArabic ? "اختر قارئاً من القائمة..." : "Listeden bir kari seçin..."}
                      options={EXTENDED_RECITER_LIST.map(r => ({ value: r.id, label: isArabic ? r.arName : r.name }))}
                      value={customReciterId}
                      onChange={(val) => setCustomReciterId(val as string)}
                      isRtl={isArabic}
                    />

                    {customReciterId === "custom" && (
                      <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                        <label className="text-xs font-medium text-muted-foreground">
                          {isArabic ? "أدخل اسم القارئ يدوياً:" : "Okuyanın / Hocanın İsmini Yazın:"}
                        </label>
                        <input
                          type="text"
                          placeholder={isArabic ? "مثال: عبد الباسط عبد الصمد، هزاع البلوشي..." : "Örn: Ebubekir Şatıri, Fatih Çollak, İshak Danış..."}
                          value={manualReciterName}
                          onChange={(e) => setManualReciterName(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                          dir={isArabic ? "rtl" : "ltr"}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <hr className="border-border" />

          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                4
              </span>
              {isArabic ? "خطوط ونصوص الفيديو (الخط والحجم)" : "Yazı Tipleri ve Boyut Ayarları"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arabic Verse Font Card */}
              <div className="rounded-2xl border border-border/80 bg-surface/40 p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>📖</span>
                    <span>{isArabic ? "خط الآيات القرآنية (العربية):" : "Kuran Ayet Fontu (Arapça):"}</span>
                  </label>
                  <span className="text-xs font-bold text-primary">{arabicFontSize}px</span>
                </div>

                <DropdownSelect
                  placeholder={isArabic ? "اختر الخط العربي..." : "Arapça font seçin..."}
                  options={ARABIC_FONT_OPTIONS.map((f) => ({ value: f.id, label: isArabic ? f.arName : f.name }))}
                  value={selectedArabicFont}
                  onChange={(val) => setSelectedArabicFont(val as string)}
                  isRtl={isArabic}
                />

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{isArabic ? "حجم الخط العربي:" : "Arapça Yazı Boyutu:"}</span>
                    <span className="font-semibold text-foreground">{arabicFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="28"
                    max="68"
                    step="1"
                    value={arabicFontSize}
                    onChange={(e) => setArabicFontSize(parseInt(e.target.value, 10))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                  />
                </div>

                {/* Live Preview Box for Arabic */}
                <div className="rounded-xl bg-background/80 border border-border/50 p-3 text-center overflow-hidden">
                  <p className="text-[11px] text-muted-foreground mb-1">{isArabic ? "معاينة الخط:" : "Önizleme:"}</p>
                  <p
                    dir="rtl"
                    style={{
                      fontFamily: ARABIC_FONT_STYLES[selectedArabicFont] || "serif",
                      fontSize: `${Math.min(arabicFontSize, 36)}px`,
                      lineHeight: 1.6,
                    }}
                    className="text-foreground transition-all duration-200"
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              </div>

              {/* Translation Font Card */}
              <div className="rounded-2xl border border-border/80 bg-surface/40 p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>🇹🇷</span>
                    <span>{isArabic ? "خط الترجمة (المعنى):" : "Meal / Çeviri Fontu:"}</span>
                  </label>
                  <span className="text-xs font-bold text-primary">{translationFontSize}px</span>
                </div>

                <DropdownSelect
                  placeholder={isArabic ? "اختر خط الترجمة..." : "Meal fontu seçin..."}
                  options={TRANSLATION_FONT_OPTIONS.map((f) => ({ value: f.id, label: isArabic ? f.arName : f.name }))}
                  value={selectedTranslationFont}
                  onChange={(val) => setSelectedTranslationFont(val as string)}
                  isRtl={isArabic}
                />

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{isArabic ? "حجم خط الترجمة:" : "Meal Yazı Boyutu:"}</span>
                    <span className="font-semibold text-foreground">{translationFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="60"
                    step="1"
                    value={translationFontSize}
                    onChange={(e) => setTranslationFontSize(parseInt(e.target.value, 10))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                  />
                </div>

                {/* Live Preview Box for Translation */}
                <div className="rounded-xl bg-background/80 border border-border/50 p-3 text-center overflow-hidden">
                  <p className="text-[11px] text-muted-foreground mb-1">{isArabic ? "معاينة خط الترجمة:" : "Önizleme:"}</p>
                  <p
                    dir="ltr"
                    style={{
                      fontFamily: TRANSLATION_FONT_STYLES[selectedTranslationFont] || "sans-serif",
                      fontSize: `${Math.min(translationFontSize, 32)}px`,
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                    className="text-foreground transition-all duration-200"
                  >
                    Rahmân ve Rahîm olan Allah&apos;ın adıyla.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground">
                  {isArabic ? "تجهيز وتعديل الصوت (إلزامي)" : "Sesi Hazırla ve Düzenle (Zorunlu)"}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic 
                    ? "استخدم هذه الميزة لسماع الصوت وقص أطرافه بدقة إذا كانت هناك كلمات مقطوعة." 
                    : "Kesilmiş kelimeler varsa sesin uçlarını hassas bir şekilde kesmek veya uzatmak için bu özelliği kullanın."}
                </p>
                {/* Multi-stage progress indicator */}
                {isPreparingAudio && audioProgressStage && (
                  <p className="text-xs text-primary font-medium mt-1.5 flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {audioProgressStage}
                  </p>
                )}
                {isTrimming && (
                  <p className="text-xs text-primary font-medium mt-1.5 flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {isArabic ? "✂️ جاري قص الصوت..." : "✂️ Ses kesiliyor..."}
                  </p>
                )}
                {preparedAudioUrl && !isPreparingAudio && !isTrimming && (
                  <p className="text-xs text-emerald-500 font-medium mt-1">
                    {isArabic ? "✅ تم تجهيز وتعديل الصوت بنجاح" : "✅ Ses başarıyla hazırlandı ve düzenlendi"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handlePrepareAudio}
                disabled={isPreparingAudio || isTrimming || !selectedSurah || startVerse === null || endVerse === null}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm rounded-xl bg-primary text-white hover:bg-primary/90 transition-all duration-300 hover:scale-105 glow-primary disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 flex-shrink-0"
              >
                {isPreparingAudio ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>{isArabic ? "جاري التجهيز..." : "Hazırlanıyor..."}</span>
                  </>
                ) : (
                  <span>{isArabic ? (preparedAudioUrl ? "تعديل الصوت" : "تجهيز وتعديل الصوت") : (preparedAudioUrl ? "Sesi Düzenle" : "Sesi Hazırla")}</span>
                )}
              </button>
            </div>

            {/* Inline audio preview player after trimming */}
            {trimmedPreviewUrl && !isPreparingAudio && !isTrimming && (
              <div className="mt-3 p-3 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <MusicalNoteIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {isArabic ? "معاينة الصوت النهائي:" : "Son ses önizlemesi:"}
                  </span>
                </div>
                <audio 
                  controls 
                  src={trimmedPreviewUrl} 
                  className="w-full h-10 rounded-lg outline-none" 
                  preload="auto"
                />
              </div>
            )}
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            {/* Auto-Segment Toggle */}
            
            <button
              type="button"
              onClick={handleGenerateVideo}
              disabled={!canGenerate}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] glow-primary disabled:opacity-50 disabled:transform-none sm:col-span-2"
            >
              <VideoCameraIcon className="h-6 w-6" />
              {renderState === "rendering"
                ? isArabic
                  ? "جاري إنشاء الفيديو..."
                  : "Video oluşturuluyor..."
                : !preparedAudioUrl
                  ? isArabic
                    ? "يجب تجهيز الصوت أولاً"
                    : "Önce Sesi Hazırlayın"
                  : isArabic
                    ? "إنشاء الفيديو"
                    : "Videoyu Oluştur"}
            </button>
          </div>

          {renderState === "error" && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {isArabic ? "حدث خطأ أثناء إنشاء الفيديو: " : "Video oluşturulurken hata oluştu: "}
              {renderError}
            </p>
          )}

          {videoUrl && (
            <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
              <video src={videoUrl} controls className="w-full rounded-xl bg-black" />
              <div className="flex gap-2">
                <a
                  href={videoUrl}
                  download
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white transition-all duration-300 hover:scale-105 glow-primary"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  {isArabic ? "تحميل الفيديو" : "Videoyu İndir"}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>



    </div>

      {showManualEditor && pendingSegmentationData.length > 0 && (
        <ManualSegmentationEditor
          isOpen={showManualEditor}
          onClose={() => setShowManualEditor(false)}
          segmentationData={pendingSegmentationData}
          verses={selectedVersesContent.map(v => ({ id: v.id, text: v.text, page: v.page, translation: v.translation || "" }))}
          isArabic={isArabic}
          arabicFontFamily={selectedArabicFont}
          onConfirm={(adjustedData) => {
            setPendingSegmentationData(adjustedData);
            setShowManualEditor(false);
          }}
        />
      )}

      {isPreTrimmingLinkAudio && linkAudioData && (
        <AudioTrimmer
          audioUrl={linkAudioData.audio_url}
          defaultRegionStart={linkAudioTrimStart || 0}
          defaultRegionEnd={linkAudioTrimEnd > 0 ? linkAudioTrimEnd : Math.min(linkAudioData.duration || 60, 60)}
          isArabic={isArabic}
          onCancel={() => setIsPreTrimmingLinkAudio(false)}
          onConfirm={(start, end) => {
            setLinkAudioTrimStart(start);
            setLinkAudioTrimEnd(end);
            setIsPreTrimmingLinkAudio(false);
            setPreparedAudioUrl(null);
            setPreparedAudioLocalPath(null);
            setPreparedJsonData(null);
            setTrimmedPreviewUrl(null);
          }}
        />
      )}

      {showAudioTrimmer && preparedAudioUrl && (
        (() => {
          let defaultRegionStart = 0;
          let defaultRegionEnd: number | null = null;
          
          if (audioTrimEnd > 0) {
            defaultRegionStart = audioTrimStart;
            defaultRegionEnd = audioTrimEnd;
          } else if (audioSourceMode === "custom" && linkAudioTrimEnd > linkAudioTrimStart) {
            defaultRegionStart = 0;
            defaultRegionEnd = null; // covers full pre-trimmed duration
          } else if (preparedJsonData && preparedJsonData.verses) {
            let minStart = Infinity;
            let maxEnd = 0;
            Object.values(preparedJsonData.verses).forEach((v: any) => {
              v.words?.forEach((w: any) => {
                if (w.start < minStart) minStart = w.start;
                if (w.end > maxEnd) maxEnd = w.end;
              });
            });
            if (minStart !== Infinity) {
              defaultRegionStart = Math.max(0, (minStart / 1000) - 0.25);
              defaultRegionEnd = (maxEnd / 1000) + 0.75;
            }
          }
          
          return (
            <AudioTrimmer
              audioUrl={preparedAudioUrl}
              defaultRegionStart={defaultRegionStart}
              defaultRegionEnd={defaultRegionEnd}
              isArabic={isArabic}
              onCancel={() => setShowAudioTrimmer(false)}
              onConfirm={handleAudioTrimConfirm}
            />
          );
        })()
      )}
      
      {toast && (
        <div className="fixed top-1/2 right-4 -translate-y-1/2 z-[100] bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300 border border-primary-foreground/20">
          <ExclamationTriangleIcon className="w-6 h-6" />
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </>
  );
}
