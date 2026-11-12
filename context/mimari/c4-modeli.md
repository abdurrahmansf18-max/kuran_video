# Kur'an Video Projesi — C4 Mimari Modeli

Bu doküman, KuranNuru Video Creator (`kuran-video`) projesinin yazılım mimarisini C4 modelleme standardına uygun olarak tanımlar.

---

## C1 — Sistem Bağlamı (System Context)

Sistem bağlamı, sistemin dış dünyadaki aktörlerle (kullanıcılar) ve harici üçüncü parti servislerle olan ilişkilerini üst seviyeden gösterir.

```mermaid
graph TD
    User["👤 Kullanıcı / İçerik Üreticisi\n(Web Tarayıcısı)"]

    subgraph Platform["KuranNuru Video Creator Platformu"]
        KuranVideo["🕋 Kur'an Video Üretim Sistemi\n(Next.js + Remotion + FastAPI)"]
    end

    subgraph ExternalServices["Harici Servisler ve Veri Sağlayıcılar"]
        YouTube["📺 YouTube / Harici Linkler\n(yt-dlp ile Ses/Video Kaynağı)"]
        QuranCloud["📖 Tanzil & Al-Quran Cloud API\n(Uthmani Mushaf & Sure Bilgisi)"]
        QuranCom["🔍 Quran.com API v4\n(Ayet Arama & Kelime Kodu v2)"]
        Mp3Quran["🎙️ Mp3Quran & EveryAyah\n(Kari Tilavet MP3 Kaynakları)"]
        Pollinations["🤖 Pollinations AI\n(Otomatik Ayet Bölümleme Asistanı)"]
    end

    User -->|"Sure/Ayet seçer, font/boyut ayarlar, link verir, video üretir"| KuranVideo
    KuranVideo -->|"Harici ses ve arka plan videosu çeker"| YouTube
    KuranVideo -->|"Otantik Uthmani metin doğrulaması"| QuranCloud
    KuranVideo -->|"Ayet arama ve tecvid durakları"| QuranCom
    KuranVideo -->|"Kari seslerini indirir"| Mp3Quran
    KuranVideo -->|"Uzun ayetleri mantıksal bölümler"| Pollinations
    KuranVideo -->|"MP4 Video Çıktısı sunar"| User
```

---

## C2 — Konteyner Mimarisi (Container Diagram)

Sistemi oluşturan bağımsız çalışma birimlerini (Docker konteynerleri, veri depoları ve protokoller) tanımlar.

```mermaid
graph TB
    User["👤 Kullanıcı Tarayıcısı\n(Chrome, Safari, Firefox)"]

    subgraph DockerHost["Docker Compose Ortamı (kuran_video)"]
        subgraph FrontendContainer["Frontend Servisi (Port 3001 -> 3000)"]
            NextApp["Next.js 14 App Router\n(React 18, Tailwind CSS, TypeScript)"]
            RemotionEngine["Remotion 4 Render Engine\n(Headless Chromium, Puppeteer)"]
            WaveSurfer["WaveSurfer.js\n(İnteraktif Dalga Formu Kesici)"]
            LocalAudioCache["Local Public Storage\n(/public/renders, /public/render-assets)"]
        end

        subgraph BackendContainer["Backend Servisi (Port 8002 -> 8000)"]
            FastAPI["FastAPI 0.104+ Web API\n(Python 3.10, Uvicorn)"]
            WhisperModel["faster-whisper & stable-ts\n(OdyAsh/faster-whisper-base-ar-quran, VAD)"]
            YtDlp["yt-dlp & FFmpeg\n(Medya İndirme & Kod Dönüştürme)"]
            BackendStorage["Disk Deposu\n(/app/data/extracted_clips, /app/data/surah_cache)"]
        end

        subgraph DBContainer["Veritabanı Servisi (Port 5434 -> 5432)"]
            PostgreSQL[("PostgreSQL 15 Relational DB\n(surahs, ayahs tabloları)")]
        end

        subgraph RedisContainer["Önbellek Servisi (Port 6381 -> 6379)"]
            Redis[("Redis 7 In-Memory Cache\n(Oturum ve işlem kuyrukları)")]
        end
    end

    User -->|"HTTP / HTTPS (Port 3001)"| NextApp
    NextApp -->|"İç Docker Ağı (http://backend:8000)"| FastAPI
    NextApp -->|"Dahili Render"| RemotionEngine
    NextApp -->|"Ses Manipülasyonu"| WaveSurfer
    NextApp -->|"Statik Dosya Okuma/Yazma"| LocalAudioCache

    FastAPI -->|"SQLAlchemy ORM (Port 5432)"| PostgreSQL
    FastAPI -->|"Önbellek & Kuyruk (Port 6379)"| Redis
    FastAPI -->|"Model Çıkarımı (Kelime Hizalama)"| WhisperModel
    FastAPI -->|"Medya İndirme & Sıkıştırma"| YtDlp
    FastAPI -->|"Geçici Ses/JSON Depolama"| BackendStorage

    RemotionEngine -->|"Video İndirme API"| User
```

---

## C3 — Bileşen Seviyesi (Component Diagram)

### Frontend Bileşenleri (`kuran-video/frontend`)

```mermaid
graph LR
    subgraph UIComponents["Kullanıcı Arayüzü Bileşenleri"]
        VCForm["VideoCreatorForm.tsx\n(Ana Kontrol ve Durum Yönetimi)"]
        ATrimmer["AudioTrimmer.tsx\n(Mouse ile Dalga Formu Kesici)"]
        MSEditor["ManualSegmentationEditor.tsx\n(Kelime Taşıma ve Parçalama)"]
        ASearch["AyahSearch.tsx\n(Canlı Ayet Arama)"]
        TSelector["TranslationSelector.tsx\n(Meal Seçimi)"]
    end

    subgraph NextRoutes["Next.js API Rotaları (/api)"]
        R_Render["video/render/route.ts\n(Remotion Paketleme & Çıktı Üretimi)"]
        R_PrepAudio["video/prepare-audio/route.ts\n(Ses Hazırlama & Kelime Hizalama)"]
        R_TrimAudio["video/trim-audio/route.ts\n(FFmpeg ile Ses Kırpma)"]
        R_FetchVideo["video/fetch-video/route.ts\n(YouTube Video İndirme)"]
        R_FetchAudio["video/fetch-audio/route.ts\n(YouTube Ses İndirme)"]
        R_AutoSeg["segmentation/auto/route.ts\n(Yapay Zeka Ayet Bölümleme)"]
        R_Cleanup["video/cleanup/route.ts\n(Geçici Dosya Temizliği)"]
    end

    subgraph RemotionComp["Remotion Video Kompozisyonu"]
        QVideo["QuranVideo.tsx\n(Ayarlanabilir Tipografi, Hat, Animasyon)"]
        RootComp["Root.tsx\n(Kompozisyon Kaydı)"]
    end

    VCForm --> ATrimmer
    VCForm --> MSEditor
    VCForm --> ASearch
    VCForm --> TSelector
    VCForm --> R_Render
    VCForm --> R_PrepAudio
    VCForm --> R_TrimAudio
    VCForm --> R_FetchVideo
    VCForm --> R_FetchAudio
    VCForm --> R_AutoSeg
    VCForm --> R_Cleanup
    R_Render --> RootComp
    RootComp --> QVideo
```

### Backend Bileşenleri (`kuran-video/backend`)

```mermaid
graph LR
    subgraph FastAPIRouters["FastAPI API Yönlendiricileri"]
        RT_Extract["routers/extraction.py\n(Ses Hizalama & Klip Çıkarma)"]
        RT_Surahs["routers/surahs.py\n(Sure Listesi & Detay)"]
        RT_Ayahs["routers/ayahs.py\n(Ayet Metinleri & Bilgileri)"]
        RT_Search["routers/search.py\n(Metin İçi Ayet Arama)"]
        RT_Download["routers/download.py\n(Dosya İndirme Servisi)"]
        RT_AI["routers/ai.py\n(Dil Modeli Destek Rotası)"]
    end

    subgraph CoreServices["İş Mantığı ve Motorlar"]
        PreciseClip["scripts/extract_precise_clip.py\n(VAD & Whisper Kelime Seviyesi Zamanlama)"]
        WhisperEngine["faster-whisper Model Yöneticisi\n(Ar-Quran Özelleştirilmiş Model)"]
        DBEngine["database.py & models.py\n(SQLAlchemy PostgreSQL Modelleri)"]
    end

    RT_Extract --> PreciseClip
    PreciseClip --> WhisperEngine
    RT_Surahs --> DBEngine
    RT_Ayahs --> DBEngine
    RT_Search --> DBEngine
```

---

## C4 — Kod ve Çalışma Akışı Seviyesi (Code / Pipeline Flow)

Kur'an Video Üretim Hattının (Video Creation & Alignment Pipeline) uçtan uca yürütme sıralaması:

```mermaid
sequenceDiagram
    autonumber
    actor User as Kullanıcı
    participant UI as VideoCreatorForm.tsx
    participant Trimmer as AudioTrimmer.tsx
    participant PrepRoute as /api/video/prepare-audio
    participant Backend as FastAPI (/api/extraction/custom)
    participant Whisper as extract_precise_clip (Whisper VAD)
    participant RenderRoute as /api/video/render
    participant FFmpeg as FFmpeg Stream Looper
    participant Remotion as Remotion (renderMedia)

    User->>UI: Sure, Ayet, Font ve YouTube Linki girer
    UI->>UI: Harici ses indirilir (yt-dlp)
    UI->>Trimmer: Fare ile ön kesim aralığı seçilir (pre-trim)
    User->>UI: "Sesi Düzenle & Hazırla" butonuna basar
    UI->>PrepRoute: FormData (surah, start, end, trimStart, trimEnd)
    PrepRoute->>Backend: POST /api/extraction/custom
    Backend->>Whisper: Sesi kırp & Whisper ile kelime zamanlamasını çıkar
    Whisper-->>Backend: wordTimingsData (kelime ms başlangıç/bitiş)
    Backend-->>PrepRoute: { mp3_filename, json_filename }
    PrepRoute-->>UI: { audioUrl, wordTimingsData }
    UI->>UI: İkinci Trimmer tam kırpma boyutuyla (0-duration) açılır
    User->>UI: "Videoyu Oluştur" butonuna basar
    UI->>RenderRoute: POST /api/video/render (Tüm ayarlar, fontlar, medya)
    alt Arka Plan Videosu Mevcutsa
        RenderRoute->>FFmpeg: -stream_loop ile video tilavet süresine pre-loop edilir (-an veya aac)
        FFmpeg-->>RenderRoute: looped_background.mp4 (Kesintisiz tek akış)
    end
    alt Standart Font Seçildiyse (kfgqpc, amiri vb.)
        RenderRoute->>RenderRoute: Otantik Tanzil Uthmani metni beslenir
    else Mushaf PUA Seçildiyse
        RenderRoute->>RenderRoute: Kral Fehd PUA sayfa glifleri beslenir
    end
    RenderRoute->>Remotion: renderMedia (Tek parça video + Kelime senkronu)
    Remotion-->>RenderRoute: Final MP4 Video üretildi
    RenderRoute-->>UI: { success: true, videoUrl }
    UI-->>User: Videoyu oynat ve indir seçeneği sunulur
```
