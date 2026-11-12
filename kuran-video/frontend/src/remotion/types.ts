export type VerseMapping = {
  part: number;
  translation_text: string;
  arabic_unit_count: number;
  chunkStartFrame?: number;
  chunkDurationInFrames?: number;
};

export type WordTiming = {
  w: string;
  start: number;
  end: number;
};

export type QuranVerse = {
  id: number;
  text: string;
  translation: string;
  durationInFrames: number;
  audioPath: string;
  page?: number;
  mappings?: VerseMapping[];
  wordTimings?: WordTiming[];
  absoluteStartFrame?: number;
};

export type QuranVideoProps = {
  surahNameArabic: string;
  surahNameTransliteration: string;
  backgroundImagePath: string | null;
  backgroundVideoPath?: string | null;
  backgroundVideoDurationInFrames?: number;
  keepBackgroundVideoAudio?: boolean;
  backgroundVideoVolume?: number;
  globalAudioPath?: string | null;
  isAudioExtracted?: boolean;
  verses: QuranVerse[];
  totalDurationInFrames: number;
  textScale?: number;
  reciterName?: string;
  arabicFontFamily?: string;
  translationFontFamily?: string;
  arabicFontSize?: number;
  translationFontSize?: number;
};
