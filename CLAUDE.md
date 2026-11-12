# Proje Çalışma Talimatları

Bu dosya projenin ana ve kalıcı çalışma talimatlarını içerir. Claude Code bu dosyayı doğrudan kullanır. Codex, `AGENTS.md` üzerinden bu dosyaya yönlendirilir.

## Proje bağlamını kullanma

- Her görevin başında `context/README.md` dosyasını oku.
- Ana haritada “her görevde oku” olarak belirtilen dosyaları oku.
- Görevin konusuna göre haritada belirtilen diğer bağlam dosyalarını gerektiğinde oku.
- Görevle ilgisi olmayan dosyaları gereksiz yere bağlama yükleme.
- Proje bilgileri için `context/` altındaki doğrulanmış ve güncel dosyaları esas al.
- Bağlam dosyaları çelişiyorsa veya güncelliğinden şüphe ediyorsan sessizce seçim yapma; kullanıcıya bildir.

## Bağlam haritasını koruma

- `context/` altında yeni bir bağlam dosyası oluşturur, taşır, yeniden adlandırır, amacını değiştirir veya silersen aynı işlem içinde `context/README.md` haritasını güncelle.
- Bir bağlam dosyasının yalnızca içeriği değişmiş ve dosyanın amacı aynı kalmışsa ana haritayı değiştirme.
- Her bağlam dosyasının ana haritadan doğrudan veya bir alt harita üzerinden ulaşılabilir olmasını sağla.
- Haritada bulunmayan bir bağlam dosyası fark edersen amacı açıksa haritaya ekle; belirsizse kullanıcıya sor.
- Gerekli harita güncellemesi tamamlanmadan bağlamla ilgili görevi tamamlanmış sayma.

## Kaynakları yönetme

- `context/kaynaklar/` altındaki dosyaları kullanıcı veya proje tarafından sağlanan dayanak girdileri olarak değerlendir.
- Bir kaynak ekler, taşır, yeniden adlandırır veya silersen aynı işlem içinde `context/kaynaklar/kaynak-indeksi.md` dosyasını güncelle.
- Kaynakların orijinal içeriğini açıkça istenmedikçe değiştirme.
- Ajan tarafından üretilen çıktı, yorum veya özetleri ham kaynak olarak kaydetme.
- Bir kaynaktan çıkarılan kalıcı sonucu, kullanıcı tarafından doğrulandığında ilgili bağlam dosyasına kaynak yolu ve dönemiyle birlikte işle.
- Kullanıcı tarafından yeni bir kaynak eklenmedikçe kaynak indeksine yeni kaynak kaydı oluşturma.
- Parola, erişim anahtarı veya gereksiz kişisel veri gibi hassas bilgileri proje bağlamına ekleme.

## Proje hafızasını güncel tutma

- Bir görev sırasında hedef, karar, kural, kapsam, sınır veya başka bir kalıcı proje bilgisi açıkça değişirse ilgili bağlam dosyasını aynı görev içinde güncelle.
- Yeni bir özellik, bileşen, servis veya iş akışı eklendiğinde veya değiştirildiğinde `context/mimari/c4-modeli.md` dosyasındaki C4 modeli (C1 Sistem Bağlamı, C2 Konteyner, C3 Bileşen veya C4 Kod seviyesi) mutlaka aynı görev içinde güncellenmeli ve diyagramlara işlenmelidir.
- Eklenen her yeni kod parçası ve özellik, projenin mevcut yazılım mimarisine, frontend kart ve tasarım standartlarına ve backend servis mimarisine tam uyumlu olmalıdır.
- Bir bilginin geçici mi kalıcı mı olduğu belirsizse bağlama eklemeden önce kullanıcıya sor.
- Geçici konuşmaları, reddedilmiş seçenekleri ve doğrulanmamış varsayımları kalıcı bağlam olarak kaydetme.
- Sohbetin tamamını bağlam dosyalarına kopyalama; yalnızca gelecekte tekrar kullanılacak kesinleşmiş bilgileri işle.
- Kullanıcı “hafızayı güncelle”, “bağlamı denetle” veya “kaynakları denetle” dediğinde `proje-hafizasi` becerisini kullan.
- Uzun bir konuşmada kalıcı bağlama işlenmemiş önemli bilgiler oluştuysa, uygun zamanda kullanıcıya hafızayı güncellemeyi isteyip istemediğini sor.

## Çalışma yaklaşımı

- İşleme başlamadan önce talebi, ilgili dosyaları ve mevcut yapıyı incele.
- Kullanıcıya ait mevcut çalışmaları koru ve yalnızca görev için gerekli alanları değiştir.
- Görev kapsamı dışında kalan dosyaları değiştirme.
- Sonucu önemli ölçüde etkileyen bir varsayımı açıkça belirt.
- Sonucu değiştirecek bir belirsizlik varsa kullanıcıya sor; küçük ayrıntılarda makul karar vererek ilerle.
- Güncel veya dış dünyaya ilişkin önemli bir iddiayı doğrulamadan kesin bilgi gibi sunma.

## Yetki ve güvenlik

- Geri alınması zor, veri kaybına yol açabilecek veya dış dünyada etkisi olacak işlemleri açık yetki olmadan yapma.
- Dosya silme, mevcut içeriğin üzerine yazma, yayımlama, dışarıya mesaj gönderme veya ödeme oluşturma gibi işlemlerde hedefi ve kapsamı doğrula.
- Kullanıcının açıkça istediği ve görev kapsamında bulunan güvenli işlemler için gereksiz yere tekrar onay isteme.
- Gizli bilgileri yanıtlarda, günlüklerde veya proje belgelerinde açığa çıkarma.

## Doğrulama ve tamamlanma

- Bir işi tamamlandı olarak bildirmeden önce sonucu görevin riskine uygun biçimde kontrol et.
- Yazılım projesiyse mevcut test, denetim ve derleme komutlarını kullan; komut uydurma.
- Belge, analiz veya içerik projesiyse sonucu kaynaklar, bağlam kuralları ve istenen biçim açısından incele.
- Kontrol edemediğin bir noktayı kontrol edilmiş gibi gösterme.
- Tamamlandığında yapılan değişiklikleri, etkilenen dosyaları ve doğrulanamayan noktaları kısa şekilde bildir.

## İletişim

- Kullanıcının dilini ve bilgi seviyesini takip et.
- Sonucu önce, gerekli açıklamayı ardından ver.
- Teknik terimleri yalnızca gerektiğinde kullan ve ilk kullanımda sade biçimde açıkla.
- Belirsizlikleri, varsayımları ve engelleri gizleme.

## Projeye özel kalıcı talimatlar

### Proje yapısı ve çalışma alanı
- Proje kaynak kodları `kuran-video/` alt dizinindedir; proje hafıza şablonu kök dizindedir (`CLAUDE.md`, `AGENTS.md`, `context/`).
- Detaylı proje mimarisi, hedefler ve kararlar için her görevin başında `context/README.md` haritasını esas al.

### Git branch stratejisi ve dağıtım düzeni
- Projede görev türüne göre ayrılmış 3 ana çalışma branch'i ve 1 ana üretim branch'i bulunur:
  - `features-and-updates`: Yeni özellikler, geliştirmeler, UI/UX standartlaştırması ve tasarım yenilikleri bu dalda geliştirilir ve buraya commitleyip pushlanır.
  - `bug-fixes`: Hata ve arıza gidermeleri (bugfix) bu dalda yönetilir ve buraya commitleyip pushlanır.
  - `development`: Tüm özellik ve düzeltmelerin entegre edilip birlikte test edildiği entegrasyon dalıdır.
  - `main`: Kararlı ve yayına hazır ana sürüm dalıdır; doğrulanmış sürümler en son burada birleştirilir.
  - Göreve başlarken ilgili branch'in aktif olduğu doğrulanmalı; commit ve push işlemleri doğru branch hedef alınarak yürütülmelidir.

### Mimari yönetişim ve C4 modeli güncelleme protokolü
- Projeye eklenecek her kod parçası ve yeni özellik, projenin mevcut yazılım mimarisine (frontend 5 adımlı standart kart mimarisi, backend FastAPI router/service yapısı, Remotion video render hattı) tam uyumlu şekilde geliştirilmelidir.
- Yeni bir özellik veya akış eklendiğinde `context/mimari/c4-modeli.md` dosyasındaki ilgili C4 seviyesi (C1 Context, C2 Container, C3 Component veya C4 Code) güncellenerek hafıza şablonuna işlenmelidir. Gelecekteki tüm geliştirmeler bu kurallara göre ilerleyecektir.

### Komutlar ve ortam
- Host ortamında Node.js kurulu değildir; tüm frontend ve backend komutları `kuran-video/` dizininde Docker Compose üzerinden yürütülmelidir:
  - Frontend derleme ve denetim: `cd kuran-video && docker compose exec frontend npm run lint` (veya `npm run build`)
  - Backend servisleri ve betikler: `cd kuran-video && docker compose exec backend python scripts/validate_quran.py`
  - Konteyner yönetimi: `cd kuran-video && docker compose up -d` / `docker compose ps`
- Servis portları: Frontend `3001` (konteyner içi `3000`), Backend `8002` (konteyner içi `8000`), PostgreSQL `5434`, Redis `6381`.

### Hassas alanlar ve yetki
- Kuran metinleri, Uthmani imla, PUA fontları ve Tanzil ayet veritabanı tohumlama verileri değiştirilirken titizlikle doğrulanmalı, keyfi müdahalede bulunulmamalıdır.
- Veritabanı hacmini sıfırlayan (`docker compose down -v`) veya timestamps dosyalarını ezen işlemler öncesinde kullanıcıdan açık onay alınmalıdır.

