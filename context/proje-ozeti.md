# Proje Özeti

Bu dosya projenin ne olduğunu, neden var olduğunu, kapsamını ve mevcut durumunu açıklar.

## Projenin adı

KuranNuru Video Creator (`kuran-video`)

## Kısa tanım

Kuran-ı Kerim tilavet videolarını, ayet-kelime senkronizasyonunu ve Arapça hat tipografisini Remotion ve Next.js tabanlı ön yüz ile Whisper destekli FastAPI arka yüzü üzerinden otomatik ve yüksek kalitede üreten web uygulaması.

## Ana amaç

Kuran tilavetleri için ses-metin hizalamasını (Whisper/stable-ts ile kelime düzeyinde zaman damgası) hassaslaştırarak estetik, ayarlanabilir ve video formatında (Remotion) dışa aktarılabilir içerik üretim sürecini otomatikleştirmek.

## Kapsama dahil olanlar

- `kuran-video/frontend`: Next.js 14, Remotion, Tailwind CSS ve TypeScript ile video önizleme, ayet arama, modern mouse kontrollü görsel ses kesici (interactive trimmer), Arapça ve Türkçe dengelenmiş tipografi, yerel dosya veya YouTube/link ile arka plan videosu ekleme, otomatik döngü (Loop), isteğe bağlı yağmur/ortam sesi kontrolü ve video render arayüzü.
- `kuran-video/backend`: FastAPI, PostgreSQL, Redis, faster-whisper/stable-ts tabanlı ses işleme, harici linkten (YouTube vb.) ses indirme/çıkarma, ayet ve sure veri yönetimi, zamanlama (timestamps) çıkarma servisleri.
- `kuran-video/docker-compose.yml`: Frontend, backend, db (Postgres 15) ve redis (7-alpine) servislerinin GPU destekli orkestrasyonu.

## Kapsam dışında kalanlar

- Kök dizindeki hafıza ve ajan şablon dosyaları (`.agents/`, `.claude/`, `context/`, `CLAUDE.md`, `AGENTS.md`) uygulama kodundan bağımsız proje hafızasını oluşturur; doğrudan uygulama çalışma zamanına dahil değildir.
- Otomatik AI arka plan/görsel oluşturma özellikleri (projeden tamamen arındırılmıştır).
- Doğrudan yerel ses dosyası yükleme (ses temini harici link / YouTube üzerinden yapılır).

## Mevcut durum

- Proje kodları `kuran-video/` alt dizini altında toplanmıştır.
- PostgreSQL (5434), Redis (6381) ve FastAPI backend (8002) servisleri Docker üzerinde ayaktadır.
- Frontend servisi Next.js ve Remotion bağımlılıklarıyla Docker imajı olarak inşa edilmektedir (port 3001).
- Ayet/sure veritabanı tohumlama ve Whisper tabanlı zamanlama çıkarma mekanizmaları mevcuttur.

## Önemli konumlar

- `kuran-video/frontend/`: Next.js & Remotion ön yüzü.
- `kuran-video/backend/`: FastAPI arka yüzü ve Python betikleri.
- `kuran-video/docker-compose.yml`: Servis yapılandırması.
- `context/`: Proje kalıcı hafızası ve bağlam haritası.
