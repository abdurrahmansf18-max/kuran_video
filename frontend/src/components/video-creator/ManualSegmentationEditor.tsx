"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckIcon, ChevronRightIcon, ChevronLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Mapping {
  part: number;
  translation_text: string;
  arabic_unit_count: number;
}

interface SegmentationResult {
  surah: number;
  ayah: number;
  mappings: Mapping[];
}

interface Verse {
  id: number;
  text: string;
  page?: number;
}

interface ManualSegmentationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  segmentationData: SegmentationResult[];
  verses: Verse[];
  onConfirm: (adjustedData: SegmentationResult[]) => void;
  isArabic: boolean;
}

export default function ManualSegmentationEditor({
  isOpen,
  onClose,
  segmentationData,
  verses,
  onConfirm,
  isArabic,
}: ManualSegmentationEditorProps) {
  // Local state to hold the editable data
  const [editedData, setEditedData] = useState<SegmentationResult[]>([]);
  const [toast, setToast] = useState<{message: string} | null>(null);
  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (isOpen && segmentationData) {
      // Deep copy to allow editing without mutating original until confirmed
      setEditedData(JSON.parse(JSON.stringify(segmentationData)));
    }
  }, [isOpen, segmentationData]);

  if (!isOpen) return null;

  const handleAdjustCount = (verseIdx: number, mappingIdx: number, delta: number) => {
    const newData = [...editedData];
    const mappings = newData[verseIdx].mappings;
    const verse = verses.find(v => v.id === newData[verseIdx].ayah);
    if (!verse) return;
    
    // We can only shift words between adjacent mappings
    if (delta > 0) {
      // Trying to increase current mapping's count (take from next)
      if (mappingIdx < mappings.length - 1 && mappings[mappingIdx + 1].arabic_unit_count > 0) {
        if (mappings[mappingIdx + 1].arabic_unit_count === 2) {
          showToast(isArabic ? "لا يمكن ترك كلمة واحدة في القسم." : "Bir bölümde en az 2 kelime kalmalıdır.");
          return;
        }
        
        let shiftAmount = 1;
        mappings[mappingIdx].arabic_unit_count += shiftAmount;
        mappings[mappingIdx + 1].arabic_unit_count -= shiftAmount;
        
        if (mappings[mappingIdx + 1].arabic_unit_count === 0) {
          mappings[mappingIdx].translation_text += (mappings[mappingIdx].translation_text ? " " : "") + mappings[mappingIdx + 1].translation_text;
          mappings.splice(mappingIdx + 1, 1);
        }
      }
    } else {
      // Trying to decrease current mapping's count (give to next)
      if (mappings[mappingIdx].arabic_unit_count > 0 && mappingIdx < mappings.length - 1) {
        if (mappings[mappingIdx].arabic_unit_count === 2) {
          showToast(isArabic ? "لا يمكن ترك كلمة واحدة في القسم." : "Bir bölümde en az 2 kelime kalmalıdır.");
          return;
        }
        
        let shiftAmount = 1;
        mappings[mappingIdx].arabic_unit_count -= shiftAmount;
        mappings[mappingIdx + 1].arabic_unit_count += shiftAmount;
        
        if (mappings[mappingIdx].arabic_unit_count === 0) {
          mappings[mappingIdx + 1].translation_text = mappings[mappingIdx].translation_text + (mappings[mappingIdx + 1].translation_text ? " " : "") + mappings[mappingIdx + 1].translation_text;
          mappings.splice(mappingIdx, 1);
        }
      }
    }
    
    setEditedData(newData);
  };

  const handleAddSection = (verseIdx: number) => {
    const newData = [...editedData];
    const mappings = newData[verseIdx].mappings;
    const lastMapping = mappings[mappings.length - 1];
    
    if (lastMapping && lastMapping.arabic_unit_count > 1) {
      lastMapping.arabic_unit_count -= 1;
      mappings.push({
        part: mappings.length + 1,
        translation_text: "",
        arabic_unit_count: 1
      });
      setEditedData(newData);
    } else {
      showToast(isArabic ? "القسم الأخير يحتوي على كلمة واحدة فقط. لا يمكن إنشاء قسم جديد." : "Son bölümde sadece bir kelime var. Yeni bölüm oluşturulamaz.");
    }
  };

  const [isWaqfLoading, setIsWaqfLoading] = useState(false);

  const handleAutoSegmentWaqf = async (verseIdx: number) => {
    const newData = [...editedData];
    const mappings = newData[verseIdx].mappings;
    const seg = newData[verseIdx];
    const verse = verses.find(v => v.id === seg.ayah);
    if (!verse) return;
    
    const allWords = verse.text.trim().split(/\s+/);
    const totalArabicUnits = allWords.length;
    
    if (totalArabicUnits < 5) {
      showToast(isArabic ? "الآية قصيرة جداً للتقسيم." : "Ayet otomatik bölünmek için çok kısa.");
      return;
    }

    setIsWaqfLoading(true);
    try {
      const qRes = await fetch(`https://api.quran.com/api/v4/verses/by_key/${seg.surah}:${seg.ayah}?language=tr&words=true&word_fields=text_uthmani,code_v2`);
      const qData = await qRes.json();
      
      const waqfMarks = ["ۚ", "ۖ", "ۗ", "ۛ", "ۙ", "ۘ", "۩", "۞"];
      const splits: number[] = [];
      
      if (qData.verse && qData.verse.words) {
        const words = qData.verse.words.filter((w: any) => w.char_type_name !== "end");
        let currentCount = 0;
        for (let i = 0; i < words.length; i++) {
          const codeV2 = words[i].code_v2 || "";
          const numCodes = [...codeV2.trim()].length;
          currentCount += numCodes;
          
          const text = words[i].text_uthmani || "";
          const hasWaqf = waqfMarks.some(mark => text.includes(mark));
          if (hasWaqf && i !== words.length - 1) {
            splits.push(currentCount);
            currentCount = 0;
          }
        }
        if (currentCount > 0) {
          splits.push(currentCount);
        }
        
        // Ensure total arabic words matched exactly, adjusting the last segment
        if (splits.length > 0) {
          let sumBeforeLast = 0;
          for (let j = 0; j < splits.length - 1; j++) {
            sumBeforeLast += splits[j];
          }
          splits[splits.length - 1] = Math.max(1, totalArabicUnits - sumBeforeLast);
        }
      }

      const fullTranslation = mappings.map(m => m.translation_text.trim()).filter(Boolean).join(" ");
      let newCounts = splits.length > 1 ? splits : [];
      
      if (newCounts.length === 0) {
        // Fallback mathematical if no waqf found
        const parts = totalArabicUnits > 15 ? 3 : 2;
        const arabicPerPart = Math.ceil(totalArabicUnits / parts);
        let remaining = totalArabicUnits;
        for (let i = 0; i < parts; i++) {
          if (i === parts - 1) {
            newCounts.push(remaining);
          } else {
            newCounts.push(arabicPerPart);
            remaining -= arabicPerPart;
          }
        }
      }
      
      const transWords = fullTranslation.split(/\s+/);
      const newMappings: Mapping[] = [];
      let currentTransWordIdx = 0;
      
      for (let i = 0; i < newCounts.length; i++) {
        let chunkTranslation = "";
        if (i === newCounts.length - 1) {
          chunkTranslation = transWords.slice(currentTransWordIdx).join(" ");
        } else {
          const ratio = newCounts[i] / totalArabicUnits;
          const wordsToTake = Math.max(1, Math.round(transWords.length * ratio));
          chunkTranslation = transWords.slice(currentTransWordIdx, currentTransWordIdx + wordsToTake).join(" ");
          currentTransWordIdx += wordsToTake;
        }
        newMappings.push({
          part: i + 1,
          arabic_unit_count: newCounts[i],
          translation_text: chunkTranslation
        });
      }
      
      newData[verseIdx].mappings = newMappings;
      setEditedData(newData);
      showToast(isArabic ? "تم التقسيم بنجاح" : "Duraklara göre başarıyla bölündü!");
    } catch (e) {
      console.error(e);
      showToast(isArabic ? "فشل الاتصال للحصول على علامات الوقف" : "Durak işaretleri alınamadı.");
    } finally {
      setIsWaqfLoading(false);
    }
  };

  const handleTranslationChange = (verseIdx: number, mappingIdx: number, newText: string) => {
    const newData = [...editedData];
    newData[verseIdx].mappings[mappingIdx].translation_text = newText;
    setEditedData(newData);
  };

  const handleConfirm = () => {
    onConfirm(editedData);
  };

  const uniquePages = Array.from(new Set(verses.map((v) => v.page).filter(Boolean)));
  const fontFaces = uniquePages
    .map(
      (page) => `
    @font-face {
      font-family: 'p${page}';
      src: url('/fonts/2013/QCF2BSMLfonts/QCF2${String(page).padStart(3, "0")}.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `
    )
    .join("\n");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fontFaces }} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
        <div className="bg-background border-0 sm:border border-border rounded-none sm:rounded-2xl shadow-2xl w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            {isArabic ? "الضبط اليدوي للتقسيم" : "Manuel Bölümleme Ayarı"}
          </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-primary text-xs sm:text-sm mb-4">
            {isArabic 
              ? "استخدم أزرار (+ / -) لنقل الكلمات العربية بين الأقسام حتى يتطابق المعنى تماماً مع الترجمة. يمكنك أيضاً تعديل نص الترجمة مباشرة."
              : "Çeviri ile tam olarak eşleşene kadar Arapça kelimeleri bölümler arasında taşımak için (+ / -) düğmelerini kullanın. Çeviri metnini doğrudan da düzenleyebilirsiniz."}
          </div>

          {editedData.map((segResult, verseIdx) => {
            const verse = verses.find(v => v.id === segResult.ayah);
            if (!verse) return null;
            
            const allWords = verse.text.trim().split(/\s+/);
            let currentWordIndex = 0;

            return (
              <div key={`${segResult.surah}-${segResult.ayah}`} className="bg-background rounded-xl overflow-hidden border border-border">
                <div className="bg-muted/30 px-4 py-2 border-b border-border font-medium text-muted-foreground">
                  {isArabic ? `الآية ${segResult.ayah}` : `Ayet ${segResult.ayah}`}
                </div>
                
                <div className="p-4 space-y-4">
                  {segResult.mappings.map((mapping, mappingIdx) => {
                    const chunkWords = allWords.slice(currentWordIndex, currentWordIndex + mapping.arabic_unit_count);
                    currentWordIndex += mapping.arabic_unit_count;

                    return (
                      <div key={mappingIdx} className="flex flex-col gap-3 p-4 rounded-lg bg-card border border-border relative">
                        {/* Translation Part */}
                        <textarea
                          readOnly
                          value={mapping.translation_text}
                          className="w-full bg-transparent text-primary font-medium text-sm sm:text-base pb-2 focus:outline-none resize-none"
                          rows={Math.max(2, Math.ceil(mapping.translation_text.length / 35))}
                          dir={isArabic ? "rtl" : "ltr"}
                        />
                        
                        {/* Arabic Part Preview */}
                        <div dir="rtl" className="text-right text-foreground text-xl sm:text-2xl leading-relaxed font-arabic mt-2" style={{ fontFamily: verse.page ? `'p${verse.page}'` : "inherit" }}>
                          {chunkWords.join(" ")}
                        </div>
                        

                      </div>
                    );
                  })}
                  
                  <div className="flex justify-center mt-4 gap-3 flex-wrap">
                    <button
                      onClick={() => handleAddSection(verseIdx)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg glow-primary hover:scale-105"
                    >
                      {isArabic ? "+ إضافة قسم جديد" : "+ Yeni Bölüm Ekle"}
                    </button>
                    
                    <button
                      onClick={() => handleAutoSegmentWaqf(verseIdx)}
                      disabled={isWaqfLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg glow-primary hover:scale-105 flex items-center gap-2 disabled:opacity-50"
                      title={isArabic ? "تقسيم الآية تلقائياً بناءً على علامات الوقف" : "Ayeti durak işaretlerine (Cim, Tı vb) göre otomatik olarak böl"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.536.57a48.204 48.204 0 01-.2 4.316c1.666-.021 3.315-.126 4.939-.313a.64.64 0 01.657.643v0c0 .355-.186.676-.401.959-.221.29-.349.634-.349 1.003 0 1.036 1.007 1.875 2.25 1.875s2.25-.84 2.25-1.875c0-.369-.128-.713-.349-1.003-.215-.283-.401-.604-.401-.959v0c0-.333.27-.599.6-.584 1.48.064 2.97.106 4.47.124a.656.656 0 01.658.663v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401v0a.64.64 0 01.657-.643 48.39 48.39 0 014.163.3c-.186-1.613-.293-3.25-.315-4.907a.656.656 0 01.658-.663v0c.355 0 .676.186.959.401.29.221.634.349 1.003.349 1.036 0 1.875-1.007 1.875-2.25s-.84-2.25-1.875-2.25c-.369 0-.713.128-1.003.349-.283.215-.604.401-.959.401v0a.64.64 0 01-.657-.643 48.39 48.39 0 01-4.163-.3c.186-1.613.293-3.25.315-4.907z" />
                      </svg>
                      {isArabic ? "تقسيم بالوقف" : "Duraklara Göre Böl"}
                    </button>
                    
                    <button
                      onClick={() => {
                        const newData = [...editedData];
                        const mappings = newData[verseIdx].mappings;
                        const fullTranslation = mappings.map(m => m.translation_text.trim()).filter(Boolean).join(" ");
                        if (!fullTranslation) return;
                        
                        const transWords = fullTranslation.split(/\s+/);
                        const totalArabicUnits = mappings.reduce((sum, m) => sum + m.arabic_unit_count, 0);
                        
                        if (totalArabicUnits === 0 || transWords.length === 0) return;

                        let currentTransWordIdx = 0;
                        for (let i = 0; i < mappings.length; i++) {
                          if (i === mappings.length - 1) {
                            mappings[i].translation_text = transWords.slice(currentTransWordIdx).join(" ");
                          } else {
                            const ratio = mappings[i].arabic_unit_count / totalArabicUnits;
                            const wordsToTake = Math.round(transWords.length * ratio);
                            mappings[i].translation_text = transWords.slice(currentTransWordIdx, currentTransWordIdx + wordsToTake).join(" ");
                            currentTransWordIdx += wordsToTake;
                          }
                        }
                        setEditedData(newData);
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg glow-primary hover:scale-105 flex items-center gap-2"
                      title={isArabic ? "توزيع النص المترجم تلقائياً بناءً على عدد الكلمات العربية" : "Çeviri metnini Arapça kelime sayısına göre orantılı olarak otomatik dağıt"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      {isArabic ? "توزيع الترجمة" : "Çeviriyi Dağıt"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-border flex justify-end gap-2 sm:gap-3 bg-background mt-auto">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors text-sm sm:text-base"
            >
              {isArabic ? "إلغاء" : "İptal"}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 flex items-center gap-2 transition-all duration-300 hover:scale-105 glow-primary text-sm sm:text-base"
            >
              <CheckIcon className="w-5 h-5" />
              {isArabic ? "اعتماد وإكمال الفيديو" : "Onayla ve Videoyu Tamamla"}
            </button>
          </div>
        </div>
        
        {toast && (
          <div className="fixed top-1/2 right-4 -translate-y-1/2 z-[60] bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300 border border-primary-foreground/20">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}
      </div>
    </>
  );
}
