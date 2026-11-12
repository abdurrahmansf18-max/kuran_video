# Kurallar ve Sınırlar

Bu dosya projede her zaman dikkate alınması gereken kalıcı kuralları, sınırları ve yasakları içerir.

## Zorunlu kurallar

- Kuran ayet metinleri (Uthmani mushaf, PUA fontları) ve Tanzil standartlarına tam sadakat korunmalı; harf, hareke veya kelime değişiklikleri kesinlikle doğrulanmalıdır.
- Video ve önizleme ekranlarında Türkçe meal yazı boyutu ile Arapça ayet yazı boyutu tipografik olarak dengeli/eşleşir boyutta tutulmalıdır.
- Şablon hafıza dosyaları (`CLAUDE.md`, `AGENTS.md`, `context/`) proje kök dizininde kalmalı; uygulama kodları `kuran-video/` klasöründe tutulmalıdır.
- Docker ortamında çalışan servislerin port çakışmalarına (Host: Frontend 3001, Backend 8002, DB 5434, Redis 6381) dikkat edilmelidir.
- **C4 Modeli ve Hafıza Senkronizasyonu**: Yeni bir özellik, servis, bileşen veya iş akışı eklendiğinde `context/mimari/c4-modeli.md` dosyasındaki C4 mimari modeli (C1 Context, C2 Container, C3 Component veya C4 Code) ilgili seviyeye göre güncellenmeli ve diyagramlara eklenmelidir.
- **Kod ve Mimari Tasarım Uyumu**: Yeni kod parçaları ve özellikler, projenin mevcut yazılım mimarisine, frontend 5 adımlı kart tasarım standartlarına ve backend FastAPI yapısına tam uyumlu şekilde geliştirilmelidir; mimari standart dışına çıkılamaz.
- **Git Branch ve Dağıtım Düzeni**: Görev türüne göre ayrılmış çalışma dallarına sadık kalınmalıdır: yeni özellik ve geliştirmeler `features-and-updates`, hata düzeltmeleri `bug-fixes`, entegrasyon `development`, nihai kararlı sürüm `main` branch'inde yönetilmelidir. Commit ve push işlemleri doğru branch'e yapılmalıdır.

## Yapılmaması gerekenler

- Kuran metinlerinde veya tecvid/durak işaretlerinde keyfi veya kontrolsüz otomatik düzeltme yapılmamalıdır.
- Doğrulanmamış veya test edilmemiş komutlar çalıştırma talimatlarına eklenmemelidir.
- Host ortamında `node` bulunmadığından frontend derleme/lint komutları doğrudan hostta çalıştırılmamalıdır (Docker veya uygun ortam kullanılmalıdır).

## Bütçe, süre ve kaynak sınırları

- Remotion video render ve Whisper ses çıkarma işlemleri GPU ve yüksek bellek tüketir; Docker bellek ve paylaşılan bellek (`shm_size: 2gb`, max memory: 8G) sınırları gözetilmelidir.

## Hukuki, güvenlik ve gizlilik sınırları

- HuggingFace veya diğer harici servis API anahtarları `.env` üzerinden yönetilmeli, açık metin olarak depoya işlenmemelidir.
- Kuran mushaf fontları ve lisansları (KFGQPC vb.) kullanım şartlarına uygun şekilde korunmalıdır.

## Kullanıcı onayı gerektiren işlemler

- Veritabanını sıfırlayan veya tohumlama verilerini ezen işlemler (`docker compose down -v`, veritabanı sıfırlama betikleri).
- Ayet ve kelime zamanlama (timestamps) dosyalarının kalıcı olarak silinmesi veya üzerine yazılması.
