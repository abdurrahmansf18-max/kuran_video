import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface AyahSearchProps {
  onSelect: (surahId: number, ayahId: number) => void;
  isArabic?: boolean;
}

interface SearchResult {
  verse_key: string;
  text: string;
  translations: { text: string }[];
}

export default function AyahSearch({ onSelect, isArabic }: AyahSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 3) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=10&page=1&language=tr`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.search?.results || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (verseKey: string) => {
    const [surah, ayah] = verseKey.split(":").map(Number);
    if (surah && ayah) {
      onSelect(surah, ayah);
      setIsOpen(false);
      setQuery("");
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="relative w-full mb-6" ref={wrapperRef} dir={isArabic ? "rtl" : "ltr"}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className={`h-5 w-5 text-muted-foreground ${isArabic ? 'right-3 left-auto' : 'left-3'}`} />
        </div>
        <input
          type="text"
          className={`block w-full rounded-xl border border-border bg-background py-3 ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground shadow-sm transition-all`}
          placeholder={isArabic ? "ابحث عن آية أو موضوع..." : "Bir ayet, kelime veya konu arayın (örn: göklerde)"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        />
        {isLoading && (
          <div className={`absolute inset-y-0 flex items-center ${isArabic ? 'left-3' : 'right-3'}`}>
            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-surface rounded-xl shadow-lg border border-border overflow-hidden max-h-80 overflow-y-auto">
          <ul className="divide-y divide-border">
            {results.map((result) => (
              <li 
                key={result.verse_key}
                className="p-3 hover:bg-surface-2 cursor-pointer transition-colors"
                onClick={() => handleSelect(result.verse_key)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {isArabic ? "الآية" : "Ayet"} {result.verse_key}
                  </span>
                  <span className="text-sm font-arabic text-foreground text-right" dir="rtl">
                    {result.text}
                  </span>
                </div>
                {result.translations && result.translations.length > 0 && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2" dir="ltr">
                    {stripHtml(result.translations[0].text)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
