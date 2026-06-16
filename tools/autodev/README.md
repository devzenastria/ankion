# ANKION AUTODEV v2

ANKION AUTODEV v2, yerel ve insan onayli bir gelistirme orkestratoru iskelesidir. Amaci, guvenli gorev kuyrugundan yalnizca bir gorev secmek, ANKION urun kurallarini ve yasakli alanlari kontrol etmek, Codex icin dar kapsamli bir prompt uretmek, dogrulama/guard/diff raporlari almak ve sonucu insan onayina sunmaktir.

## v2 ne yapar?

- `tools/autodev/task-queue.json` dosyasindan en fazla bir gorev isler.
- LOW riskli guvenli AUTODEV sistem gorevleri icin Codex promptu uretir.
- `preflight.ps1`, `validate.ps1`, `guard.ps1` ve `review-diff.ps1` ile durumu raporlar.
- Raporlari `tools/autodev/reports/` altina yazar.
- Promptlari `tools/autodev/prompts/` altina yazar.
- Her calisma sonunda `HUMAN APPROVAL REQUIRED` der.

## v2 ne yapmaz?

- ANKION urun ozelliklerini dogrudan auto-code etmez.
- Codex'i recursive olarak calistirmaz.
- Commit, push, deploy, publish veya release yapmaz.
- APK testi, Gradle, adb veya emulator calistirmaz.
- Paket kurmaz; `package.json` veya `pnpm-lock.yaml` degistirmez.
- Supabase, Auth, RLS, native Android/iOS, odeme, monetizasyon veya production ayarlarini degistirmez.

## Recursive Codex neden kapali?

Recursive Codex calistirma kontrolsuz donguler, zor incelenen degisiklikler ve guvenlik siniri asimlari yaratabilir. v2 guvenli modda sadece prompt uretir; promptu kullanip kullanmama ve sonucu kabul etme karari insandadir.

## Git neden zorunlu?

AUTODEV cannot be trusted for autonomous coding until git diff verification is working. Git PATH uzerinde yoksa veya `git diff --name-only` / `git diff --stat` calismazsa AUTODEV v2 fail-closed davranir, yasakli dosya durumu `UNKNOWN` olur ve final karar `FAILED` olur.

## Preflight calistirma

```powershell
cd C:\ankion
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\autodev\preflight.ps1
```

## Tam v2 calistirma

```powershell
cd C:\ankion
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\autodev\run-autodev.ps1
```

## Dogrulama komutlari

AUTODEV v2 sadece su komutlari calistirir:

```powershell
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
```

## Raporlar ve promptlar

- Raporlar: `tools/autodev/reports/`
- Codex promptlari: `tools/autodev/prompts/`
- Yerel durum yer tutuculari: `tools/autodev/state/`

## Insan onayi

Her sonuc insan onayi gerektirir. MEDIUM riskli gorevler kodlamadan once insan onayi gerektirir; HIGH riskli gorevler otomatik reddedilir. AUTODEV raporu gecse bile kabul, devam, restore, merge veya release karari otomatik degildir.

## APK kapsami

APK testi, release build, Gradle, emulator ve adb AUTODEV v2 kapsami disindadir.
## AUTODEV v2.1 Work-Sync Layer

Work-Sync Layer, kullanici isten dondugunde AUTODEV durumunu hizli inceleyebilmesi icin yerel durum dosyalari uretir. Bu katman mevcut durum, heartbeat, blocker, sorular, bekleyen kararlar, en son raporlar ve guvenli sonraki aksiyonu `tools/autodev/state/` altina yazar.

Ise gitmeden once durum senkronu almak icin:

```powershell
cd C:\ankion
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\autodev\sync-status.ps1
```

Isten donunce ChatGPT'ye gonderilecek tek dosyayi okumak icin:

```powershell
cd C:\ankion
type .\tools\autodev\state\LATEST_HANDOFF.md
```

`LATEST_HANDOFF.md`, ChatGPT'ye GO / NO-GO incelemesi icin gonderilecek ana dosyadir. ChatGPT bu makinedeki durumu canli olarak senkronlayamaz; kullanici handoff dosyasini paylasmadikca en guncel yerel raporlari goremez.

Git calismadan otonom kodlama bloklu kalir. Git PATH uzerinde yoksa AUTODEV diff dogrulamasi yapamaz, yasakli dosya durumu `UNKNOWN` kalir ve autonomous coding etkinlestirilmemelidir.

## v2.2 handoff reconciliation

Git ve diff review PASS oldugunda LATEST_HANDOFF.md artik temiz durumu raporlarla uzlastirir: yasakli dosyalar, paket/env/Supabase/Auth/RLS/APK/native alanlari ve app source durumu temiz diff icin NO olur. Git PATH karari Git calisirken PENDING tutulmaz. Real autonomous coding yine kullanicinin ilk LOW-risk coding task onayina kadar NO-GO durumundadir.

