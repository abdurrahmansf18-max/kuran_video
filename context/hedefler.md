# Hedefler

Bu dosya projenin aktif hedeflerini, önceliklerini ve başarı ölçütlerini içerir.

## Aktif hedefler

- **AI Arka Plan Üretimini Kaldırma**: Otomatik görsel/arka plan oluşturma özelliğinin ve ilgili tüm frontend/backend rotalarının tamamen temizlenmesi.
- **Link ile Ses Alma (YouTube vb.)**: Yerel ses dosyası yükleme özelliğinin kaldırılarak, bağlantı (URL) üzerinden ses indirme/çıkarma altyapısının kurulması.
- **Modern & İnteraktif Ses Kesici**: Dakika/saniye metin girişleri yerine mouse ile sürüklenebilir, modern dalga formu (waveform) ve zaman çizelgeli ses kesme arayüzünün geliştirilmesi.
- **Arapça ve Türkçe Tipografi Dengelemesi**: Video oluşturma ve önizlemede Türkçe meal metin boyutunun Arapça metin boyutu ile dengelenmesi/eşitlenmesi.
- Docker ortamında servis entegrasyonunun ve Remotion video pipeline'ının doğrulanması.

## Öncelik sırası

1. Otomatik görsel oluşturma (AI background) rotalarının ve arayüz bileşenlerinin temizlenmesi.
2. Link (YouTube vb.) üzerinden ses indirme backend servisi ve frontend arayüzünün geliştirilmesi.
3. Mouse ile sürüklenebilir modern görsel ses kesme (interactive trimmer) bileşeninin uygulanması.
4. Video ve önizleme şablonunda Arapça ile Türkçe meal boyutlarının dengelenmesi.
5. Docker ortamında uçtan uca render ve ses entegrasyonunun doğrulanması.

## Başarı ölçütleri

- `docker compose ps` çıktısında tüm servislerin (`db`, `redis`, `backend`, `frontend`) "Up" durumunda olması.
- URL girilerek sesin sorunsuz indirilmesi, oynatılması ve modern trimmer ile seçilen aralığın kırpılabilmesi.
- AI görsel oluşturma kodlarının ve butonlarının projeden tamamen arındırılmış olması.
- Video önizleme ve çıktısında Arapça metin ile Türkçe meal boyutlarının orantılı ve dengeli görünmesi.

## Zaman sınırları

- Mevcut geliştirme oturumu.

## Tamamlanan veya geçerliliğini yitiren hedefler

- [2026-11-09] Uygulama dosyalarının `kuran-video/` klasörüne toplanması ve kök hafıza şablonunun ayrıştırılması tamamlandı.
- [2026-11-09] Frontend Docker imajı (`kuran_video-frontend`) inşa edildi ve `http://localhost:3001` portunda ayağa kaldırıldı.
- [2026-11-10] AI arka plan görsel üretimi özelliği ve ilgili tüm arayüz/arka yüz rotaları temizlendi.
- [2026-11-10] Yerel ses yükleme yerine bağlantı (YouTube vb.) üzerinden ses alma mimarisi (`yt-dlp`, `/api/video/fetch-audio`, `/api/extraction/from-url`) entegre edildi.
- [2026-11-10] Mouse ile sürüklenebilir modern görsel ses kesme aracı (`AudioTrimmer`) entegre edildi; manuel dakika/saniye girişleri görsel zaman çizelgesiyle değiştirildi.
- [2026-11-10] Remotion video şablonunda Türkçe meal yazı boyutu Arapça ayet boyutuyla eşitlendi (42px).
- [2026-11-10] Ses ekleme arayüzüne genişletilmiş kari listesi ve manuel hoca/okuyucu ismi giriş alanı eklendi; belirlenen ismin render pipeline'ı üzerinden videoda (🎙️) görünmesi sağlandı.
- [2026-11-10] Layout ve Remotion TypeScript hataları giderildi, Next.js üretim derlemesi (`npm run build`) ve Docker servisleri doğrulandı.
- [2026-11-12] Arka Plan Videosu Desteği (Yerel video yükleme + YouTube/URL linkiyle video indirme) entegre edildi. Video süresi tilavet sesine göre otomatik döngüye (loop) alındı; kullanıcının video sesini (yağmur, doğa ortam sesleri vb.) isteğe bağlı koruyabilmesi veya sessize alabilmesi için buton ve ses düzeyi ayarı eklendi.
- [2026-11-12] Kuran-ı Kerim Arapça hat fontu (KFGQPC Medine Naskh, Uthmanic Hafs, Amiri Quran, Scheherazade, Noto Naskh, Ruqaa, PUA Mushaf) ve Türkçe Meal fontu (Sistem, Plus Jakarta Sans, Inter, Montserrat, Playfair Display, Cinzel, Sansita) için çoklu font seçimi ve bağımsız yazı boyutu (slider) kontrolü uçtan uca entegre edildi.
- [2026-11-12] Ses ve Metin Senkronizasyonu Kapsamlı İyileştirmesi: Farklı hocalar ve harici link/özel seslerde ayetlerin veya uzun ayet bölümlerinin (chunk) erken kaybolması ya da geç kalması sorunu analiz edildi. Whisper VAD (Voice Activity Detection) desteği etkinleştirildi, Tajweed uzatmalarını (Madd) bozan yapay 2.5s kesme kodu temizlendi, harici API bağımlı karakter oranı döngüsü yerine doğrudan kelime zamanlaması eşleştirmesine geçildi ve video sonundaki ayet/parça uzama süresi (diff) Remotion dizilimine tam senkronize edildi.
- [2026-11-12] Harici Link Ses Kırpma Aralığı Senkronizasyonu: YouTube/link ses getirme alanında fareyle yapılan ön kırpmanın (pre-trim), "Sesi Hazırla" aşamasına aktarılırken state çakışması, AudioTrimmer hesaplama hatası ve backend kelime daraltması sebebiyle boyut/süre uyuşmazlığı yaşaması düzeltildi. Ayrı `linkAudioTrimStart/End` state'i tanımlandı, `AudioTrimmer` içindeki `duration - defaultRegionStart` eksikliği giderildi ve kullanıcının seçtiği tam kesit boyutunun korunması sağlandı.
- [2026-11-12] Standart Uthmani Arapça Font Desteği ve Çemberli Rakam (١٤٨-١٥٥) Hatası Giderildi: Remotion ve VideoCreator formunda standart fontlar (`kfgqpc`, `uthmanic_hafs`, `amiri_quran`, `scheherazade`, `noto_naskh`, `ruqaa`) seçildiğinde, `quran.json` içindeki Kral Fehd PUA karakterlerinin standart fontlarda Presentation Forms-A ayet numaralarına (`١٤٨-١٥٥`) dönüşme sorunu çözüldü. Sisteme 114 sure ve 6236 ayeti içeren eksiksiz `quran_uthmani.json` entegre edildi. Seçilen fonta göre PUA fontunda Mushaf sayfa karakterleri, diğer tüm fontlarda ise otantik Uthmani metin dinamik olarak beslendi.
- [2026-11-12] Arka Plan Videosu Takılmaları ve Ses Kopmaları Giderildi: Arka plan videoları Remotion render öncesinde FFmpeg stream-loop ile tam tilavet süresi kadar tek parça olarak pre-loop edildi; sessiz videolarda ses kanalı (`-an`) kaldırılarak Remotion render anındaki dekoder sıfırlaması ve ses takılmaları tamamen engellendi.
- [2026-11-12] C4 Mimari Modellemesi Tamamlandı: Projenin Sistem Bağlamı (C1), Konteyner Mimarisi (C2), Bileşen Dağılımı (C3) ve Yürütme Sıralaması / Kod Seviyesi (C4) diyagramları hazırlanarak `context/mimari/c4-modeli.md` belgesine kaydedildi.
