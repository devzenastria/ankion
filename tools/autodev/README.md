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

## Gorev ilerleme durumu

`tools/autodev/task-queue.json` icindeki her gorev `status` alani tasir:

- `PENDING`: AUTODEV tarafindan secilebilir.
- `COMPLETED`: Tamamlanmis gorev; tekrar prompt uretilmez.
- `BLOCKED`: Bloklu gorev; tekrar prompt uretilmez.
- `SKIPPED`: Bilerek atlanan gorev; tekrar prompt uretilmez.

`run-autodev.ps1` yalnizca ilk `PENDING` gorev icin prompt uretir. Tum gorevler tamamlanmis, bloklu veya atlanmis ise tekrar prompt uretmez, durumu raporlar ve yine insan onayi gerektirir.

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

## SUBAGENT v1

SUBAGENT v1, AUTODEV uzerinde calisan guvenli bir gorev yonlendirici, risk siniflandirici ve Codex prompt ureticisidir. ANKION app source dosyalarini kendisi degistirmez ve urun ozelligi kodlamaz. Amaci, onerilen dar kapsamli gorevi dogru ajan tipine baglamak, riski siniflandirmak, HIGH riskleri otomatik bloklamak ve insan onayina sunulacak promptu uretmektir.

SUBAGENT v1 sunlari yapar:

- `tools/autodev/subagent-queue.sample.json` veya verilen kuyruktan en fazla bir uygun `PENDING` gorev secer.
- `subagent-risk-gate.ps1` ile LOW / MEDIUM / HIGH risk siniflandirmasi yapar.
- LOW riskli uygun gorevler icin `tools/autodev/prompts/` altina Codex promptu uretir.
- MEDIUM riskli gorevlerde `approvedByHuman: true` yoksa prompt uretmez.
- HIGH riskli gorevleri otomatik bloklar.
- Raporlari `tools/autodev/reports/` altina yazar.
- Her durumda insan onayi gerektirir.

SUBAGENT v1 sunlari yapmaz:

- Codex'i recursive calistirmaz.
- App source, package, lockfile, env, Supabase, Auth, RLS, backend runtime, native Android/iOS veya APK alani degistirmez.
- Commit, push, deploy, publish veya release yapmaz.
- Paket kurmaz ve secret olusturmaz.
- Gercek otonom kodlama yapmaz.

### Ajan tipleri

- `PRODUCT_COPY_AGENT`: Sadece mevcut metin/copy duzeltmesi. LOW risk, tek app screen dosyasi.
- `UI_POLISH_AGENT`: Kucuk UI polish. LOW veya MEDIUM risk, MEDIUM icin acik insan onayi gerekir.
- `TYPECHECK_FIX_AGENT`: TypeScript/typecheck hatasi duzeltmesi. Hata ciktisi zorunludur; genis refactor yasaktir.
- `DOCS_SYNC_AGENT`: Tamamlanmis islerden sonra mevcut dokumanlari gunceller. Yeni dokuman olusturmaz.
- `RISK_GATE_AGENT`: Gorev onerisine GO / NO-GO degerlendirmesi yapar.
- `HANDOFF_AGENT`: ChatGPT incelemesi icin rapor/handoff ozeti uretir.

### Risk seviyeleri

- `LOW`: copy-only, tek dosya, davranis yok, package/backend/native yok.
- `MEDIUM`: kucuk UI yapisi veya typecheck fix, en fazla 3 dosya, insan onayi gerekir.
- `HIGH`: Supabase, Auth, RLS, package/lockfile, APK/native, payment, monetization, genis refactor, data model, production/deploy veya secret dokunan isler. HIGH otomatik bloklanir.

HIGH risk otomatik bloklanir cunku bu alanlar ANKION gizlilik, guvenlik, veri modeli, release ve geri donusu zor operasyon sinirlarina dokunur. Bu isler sadece ayrica planlanmis, insan tarafindan onaylanmis ve daraltmistirilmis sureclerle ele alinabilir.

Gercek otonom kodlama kapali kalir: `realAutonomousCodingEnabled: false`, `recursiveCodexEnabled: false`, `requireHumanApproval: true`. SUBAGENT v1 yalnizca prompt ve rapor uretir; uygulama kodunu kendisi degistirmez.

### SUBAGENT v1 calistirma

```powershell
cd C:\ankion
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\autodev\subagent-router.ps1 -TaskQueuePath .\tools\autodev\subagent-queue.sample.json
```

Beklenen sonuc: LOW sample icin prompt uretilir, HIGH RLS sample bloklu raporlanir, insan onayi zorunlu kalir.
