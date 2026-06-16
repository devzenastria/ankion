@'

# ANKION Core Product & Security Contract V1

## 1. Amaç

Bu doküman ANKION’un ürün özünü, güvenlik sınırlarını, reveal/profil görünürlüğü modelini, anlık medya doğruluğunu, ses limitlerini, takip/arama kurallarını ve Supabase geçiş ön şartlarını sabitler.

Bu sözleşme backend, Supabase, RLS, storage, auth, media capture, location, monetization ve UI kararlarında temel referans olarak kabul edilir.

ANKION’un özü:

anonim ses → merak → sese cevap → özel bağlantı → güven → profil izni → owner-approved profil görünürlüğü → gerçek sosyal bağ

ANKION’da kullanıcı önce profili değil sesi deneyimler. Gerçek kimlik yalnızca izinle, bağlantı bazlı ve yönlü olarak açılır.

---

## 2. ANKION Ne Değildir?

ANKION aşağıdaki ürün yönlerine evrilmeyecek:

- Dating app değildir.
- Clubhouse değildir.
- Discord değildir.
- Oda / chat room sistemi değildir.
- Profil gezme uygulaması değildir.
- Kullanıcı adı arama uygulaması değildir.
- Neon demo / vitrin uygulaması değildir.
- Global profil açma sistemi değildir.
- Rastgele arama uygulaması değildir.

Bu yönlerden biri ürün kararına sızarsa karar reddedilir.

---

## 3. Temel Ürün Kuralları

Korunacak ana kurallar:

1. Önce ses, profil sonra.
2. Kullanıcı önce kişiyi değil sesi duyar.
3. Gerçek kimlik izinsiz açılmaz.
4. Profil görünürlüğü global değildir.
5. Profil görünürlüğü bağlantı bazlıdır.
6. Profil görünürlüğü yönlüdür.
7. Karşılıklı otomatik reveal yoktur.
8. Kullanıcı adı/profil araması yoktur.
9. Profil isteği yalnızca ses veya bağlantı bağlamından doğar.
10. Reveal/profil izni owner-approved olur.
11. Plus/paid özellikler gerçek profil görünürlüğünü bypass edemez.
12. Takip etmek gerçek profili açmaz.
13. Arama gerçek profili açmaz.
14. Medya paylaşımı profil reveal yerine geçmez.
15. Engelleme her şeyden güçlüdür.

---

## 4. Identity Model

ANKION’da üç ana kimlik katmanı vardır:

### 4.1 Auth Account

Teknik kullanıcı hesabıdır.

İçerebilir:

- auth user id
- email/phone/provider bilgisi
- login/session bilgisi

Bu katman public client yüzeylerinde doğrudan görünmemelidir.

### 4.2 Anonymous Identity

Kullanıcının public/keşif/feed/voice yüzeylerinde görünen anonim temsilidir.

İçerebilir:

- anonymous_identity_id
- ses bağlamı
- anonim avatar/renk/sembol
- anonim durum metni
- public-safe istatistikler
- takip edilebilir anonim akış referansı

Bu katman gerçek profil bilgisine doğrudan bağlanmış gibi gösterilmemelidir.

### 4.3 Real Profile

Gerçek kimlik katmanıdır.

İçerebilir:

- isim
- fotoğraf
- bio
- sosyal sinyaller
- gerçek profil alanları
- kullanıcıya özel görünürlük ayarları

Bu katman yalnızca bağlantı bazlı, owner-approved reveal grant varsa görünür.

---

## 5. Reveal / Profil Görünürlüğü Sözleşmesi

Reveal modeli bağlantı bazlı, yönlü ve owner-approved çalışır.

### 5.1 Roller

Gelen:

- Benim profilimi isteyenlerdir.
- Karar bendedir.

Gönderilen:

- Benim görmek istediğim profillerdir.
- Karar karşı taraftadır.

Member Profile:

- Mevcut bağlantının görünürlük sonucunu gösterir.
- Global profil sayfası değildir.

Chat:

- Bağlantının kısa durum özetini gösterir.
- Reveal karar merkezi değildir.

---

## 6. Reveal Durumları

### 6.1 pending

Anlamı:

- Profil isteği bekliyor.
- Profil görünmez.
- Sesli bağlantı devam eder.

İzin verilenler:

- Profil sahibi Profili aç seçebilir.
- Profil sahibi Anonim kal seçebilir.
- Profil sahibi Engelle seçebilir.

Yasaklananlar:

- Karşı taraf profili göremez.
- Plus ile bekleme bypass edilemez.
- Takip ile profil açılamaz.
- Arama ile profil açılamaz.

### 6.2 approved

Anlamı:

- Profil yalnızca ilgili bağlantıda açılmıştır.
- Global profil açılmaz.

İzin verilenler:

- Profil o bağlantıda görünür.
- Ses devam eder.
- Profil sahibi sonradan Anonim kal seçebilir.
- Profil sahibi Engelle seçebilir.

Yasaklananlar:

- Başka bağlantılara otomatik görünürlük yayılmaz.
- Karşılıklı otomatik reveal oluşmaz.
- Feed/Discover içinde gerçek profil globalleşmez.

### 6.3 kept_anonymous

Anlamı:

- Profil kapalı kalır.
- Ses devam edebilir.

İzin verilenler:

- Profil sahibi sonradan Profili aç seçebilir.
- Profil sahibi Engelle seçebilir.

Yasaklananlar:

- Karşı taraf kullanıcı adıyla arayamaz.
- Profil listelenemez.
- Takip gerçek profili açamaz.

### 6.4 blocked

Anlamı:

- En güçlü güvenlik durumudur.

Sonuçlar:

- Profil kapalıdır.
- Ses kapalıdır.
- Arama kapalıdır.
- Takip kapalıdır.
- Yeni profil isteği kapalıdır.
- Yeni ses kapalıdır.

Engel kaldırılırsa:

- Profil otomatik açılmaz.
- Güvenli dönüş anonim/profil kapalı state olmalıdır.

---

## 7. Profil Sekmesi Görünürlük Kuralı

Profil sekmesindeki görünürlük global profil açma değildir.

Bu alan sadece kullanıcının varsayılan gizlilik duruşunu anlatır.

Doğru anlam:

- “Kimlik kapalı”
- “Profil izne bağlı”
- “Bağlantı bazlı görünürlük”

Yanlış anlam:

- “Profilimi herkese aç”
- “Global görünür ol”
- “Beni kullanıcı adıyla bulsunlar”

Profil görünürlüğü yalnızca bağlantı bazlı reveal grant ile açılır.

---

## 8. Anlık Medya Güvenliği

Anlık medya güvenliği MVP çekirdeğidir. Sonraya atılacak opsiyonel konu değildir.

### 8.1 Public / Genel Akış Medya

Genel/public akışa gelen medya galeriden gelmez.

Public/discovery medya yalnızca uygulama içi yakalanan yeni an olmalıdır.

Kurallar:

- Kamera tap = fotoğraf.
- Kamera uzun basış = video.
- Ses ayrı ana aksiyondur.
- Public medya capture-now olmalıdır.
- Public medya reveal yerine geçmez.
- Public medya gerçek kimliği otomatik açmaz.

### 8.2 Private Chat Medya

Özel chat içinde ileride galeri kullanılabilir.

Kullanım amacı:

- kişisel paylaşım
- anılar
- özel bağlantı içi medya

Ancak private medya da reveal bypass yapamaz.

---

## 9. Anlık Hilesi Önleme

Sadece UI engeli yeterli değildir.

İleride kriptografik doğrulama gerekir.

Gerekli güvenlik parçaları:

1. capture intent
2. server nonce
3. kısa ömürlü upload izni
4. media hash
5. upload intent doğrulaması
6. storage path kontrolü
7. RLS kontrolü
8. replay engeli
9. süresi dolmuş upload reddi
10. cihaz/app bütünlüğü kontrolü
11. mümkünse attestation/imza kontrolü

Buradaki “kripto” coin/blockchain değildir.

Anlamı:

- nonce
- hash
- imza
- attestation
- kısa ömürlü izin
- replay koruması

---

## 10. Ses Limitleri

Ses ANKION’un ana etkileşimidir.

Limitler:

- Her ses maksimum 21 saniye.
- Günlük toplam maksimum 7 ses.
- Aynı kişiye günlük maksimum 3 ses.

Kurallar:

- Limitlerin source of truth noktası backend olmalıdır.
- Frontend sadece kalan hakkı gösterebilir.
- Frontend limit güvenliği sağlamaz.
- Engellenen kişiye ses gönderilemez.
- Anonim kalınan bağlantıda ses devam edebilir.

---

## 11. Takip Et Kuralı

Takip edilecek şey gerçek profil değildir.

Takip edilebilir varlık:

- anonim ses akışı
- anonim identity
- bağlantı bağlamı

Takip etmek şunları yapmaz:

- gerçek profili açmaz
- reveal izni vermez
- kullanıcı adı araması doğurmaz
- global profil görünürlüğü sağlamaz
- Plus bypass oluşturmaz

Takip edilen kişinin yeni anları Feed/Discover içinde küçük ikon, badge veya öncelik ile belirebilir.

Reveal onayı yoksa gerçek kimlik görünmez.

Engellenen kişi takip edilemez veya takip ilişkisinden çıkarılır.

---

## 12. Sesli ve Görüntülü Arama Kuralı

Arama ileride eklenecek bağlantı özelliğidir.

### 12.1 Sesli Arama

Sesli arama sadece özel bağlantı içinde açılabilir.

Yasaklananlar:

- Akıştan direkt arama
- Keşfet’ten direkt arama
- Rastgele arama
- Oda sistemi
- Engellenen kişiye arama

Sesli arama gerçek profili açmaz.

### 12.2 Görüntülü Arama

Görüntülü arama kimliği açığa çıkarabileceği için yüksek izinli özelliktir.

Açılma şartı:

- Profil izni onaylandıktan sonra

veya

- Ayrıca karşılıklı görüntülü arama izni verildikten sonra

Görüntülü arama reveal modelini bypass edemez.

---

## 13. Konum Güvenliği

Konum ileride “çevrendeki anonim sesleri duyma” için kullanılabilir.

Kurallar:

- Konum gerçek kimliği açmamalıdır.
- Konum hassas veridir.
- Hassasiyet seviyesi RLS/storage/backend kadar yüksektir.
- Konum sadece gerekli hassasiyet seviyesinde işlenmelidir.
- Precise location gerekmiyorsa kullanılmamalıdır.
- Kullanıcıya net izin ve amaç gösterilmelidir.

Plus üyelik çevresel anonim ses keşfi sunabilir.

Ancak Plus gerçek profil görünürlüğünü bypass edemez.

---

## 14. Ekran Görüntüsü, Ekran Kaydı ve Uygulama Kilidi

Bu özellikler güvenlik fazında gerçek native/security mantığıyla ele alınmalıdır.

Kurallar:

- Sahte UI olarak yapılmaz.
- Android için FLAG_SECURE benzeri native koruma gerekir.
- Ekran kaydı/screenshot engeli sadece görsel iddia olarak bırakılmaz.
- Uygulama kilidi gerçek cihaz güvenliğiyle uyumlu olmalıdır.

Bu özellikler profil/reveal/media güvenliğinin yerine geçmez; ek koruma katmanıdır.

---

## 15. Monetizasyon Sınırları

ANKION para kazanabilir, ancak güvenlik ve reveal modelini satamaz.

İzin verilen gelir yönleri:

- Plus üyelik
- gelişmiş anonim keşif filtreleri
- daha fazla çevresel anonim ses keşfi
- takip edilen anonim seslerin öncelikli görünümü
- coin/paket sistemleri

Kesin yasak:

- başkasının gerçek profilini parayla görmek
- reveal iznini satın almak
- bekleyen reveal isteğini Plus ile bypass etmek
- engellenen kişiye erişim satın almak
- konumla gerçek kimlik çıkarmak
- takip üzerinden gerçek profili açmak

---

## 16. UI / UX Sözleşmesi

Tasarım yönü:

- dark-first
- soft
- minimal
- insanî
- az border
- az glow
- az demo metni
- yaşayan sosyal app hissi

Renk anlamları:

- Mor = marka / primary
- Pembe = ses / merak / yanıt
- Yeşil = yalnızca onay / success
- Kırmızı veya sert pembe ton = engelle / güvenlik
- Gri = pasif / bekleyen

Kaçınılacak his:

- neon oyuncak
- poster
- vitrin
- demo ekranı
- fazla açıklayıcı kartlar
- oda/chat room çağrışımı
- dating/match dili

---

## 17. Dil Sözleşmesi

Tercih edilen ifadeler:

- Bağlantılar
- Sesli bağlantılar
- Sese cevap ver
- Profil iste
- Profili aç
- Anonim kal
- Engelle
- Engeli kaldır
- Takip et
- Ses bırak
- Kamera
- Bir an bırak

Kaçınılacak ifadeler:

- Ses bağı
- Odalar
- Sohbet odası
- Odaya katıl
- Sohbete geç
- dating dili
- match dili
- kullanıcı adıyla arama dili
- gereksiz “anlık fotoğraf / anlık video” tekrarları

---

## 18. Route Sözleşmesi

Mevcut route sözleşmesi:

- `/` = Home
- `/feed` = Akış
- `/discover` = Keşfet
- `/chat` = Bağlantılar listesi
- `/chat?threadId=x` = özel bağlantı thread
- `/reveal-requests` = Profil izinleri / İzinler
- `/profile` = Benim alanım
- `/settings` = Ayarlar
- `/member-profile` = ses/profil sahibi görünümü

Navigasyon kuralları:

- Alt nav Bağlantılar her zaman `/chat` listesine gider.
- Alt nav direkt thread açmaz.
- Yanıtla / Sese cevap ver → `/chat?threadId=...`
- Avatar/thumb/profile alanı → `/member-profile?memberId=...&threadId=...&source=...`
- Aktif tab’a tekrar basmak no-op olmalıdır.
- Reveal/profil izni onay veya red sonrası istemsiz başka sekmeye atmaz.

Member profile dönüş kuralları:

- `feed` → `/feed`
- `discover` → `/discover`
- `chat` → aynı thread
- `reveal` → `/reveal-requests`
- `home` → `/`
- fallback → `/chat`

---

## 19. Feed / Akış Sözleşmesi

Feed temiz kalmalıdır.

Son karar:

- Agresif alt composer kullanılmaz.
- Büyük dock kullanılmaz.
- Üç ikonlu sürekli composer kullanılmaz.
- Neon floating button kullanılmaz.
- Swipe açıklamaları ekranda yazı olarak kalmaz.

Güvenli geçici çözüm:

- Akış temiz kalır.
- Küçük `+` paylaşım girişi olabilir.
- Basınca sade bottom sheet açılır:
  - Ses bırak
  - Kamera

Gelecek davranış:

- Kamera tap = fotoğraf
- Kamera uzun basış = video
- Swipe sağ = gizle
- Swipe sol = şikayet et

Gerçek kamera/mikrofon/upload henüz açılmaz.

---

## 20. Supabase Geçiş Ön Şartları

Supabase’e doğrudan özellik bağlanmayacak.

Önce readiness audit yapılacak.

Önerilen sıra:

1. UI/flow stabilize
2. veri modeli final kontrol
3. Supabase proje/env hazırlığı
4. Auth foundation
5. Anonymous Identity
6. Private Profile
7. Reveal Requests
8. Profile Visibility Grants
9. Blocks
10. Media Capture Intent
11. Storage/RLS
12. client integration

Supabase ana backend parçaları:

- Auth
- Postgres
- RLS
- Storage
- Realtime
- Edge Functions

Yan servisler ileride:

- RevenueCat = Plus / abonelik / coin / paket
- Sentry = crash/error takibi
- Expo Notifications = push
- Expo SecureStore = küçük güvenli local veri
- Expo Camera / Location / AV veya ilgili native modüller = izinler ve capture
- WebRTC tabanlı servis/katman = gerçek zamanlı sesli/görüntülü arama

Supabase gerçek zamanlı çağrı medyasını taşıyan sistem olarak varsayılmamalıdır. Supabase çağrı izinlerini, bağlantı durumlarını ve güvenlik kayıtlarını tutabilir.

---

## 21. Backend Source of Truth Kuralları

Aşağıdaki kararlar frontend’e bırakılamaz:

- günlük ses limiti
- aynı kişiye günlük ses limiti
- reveal grant kontrolü
- block kontrolü
- profile visibility kontrolü
- media upload intent kontrolü
- storage path doğrulaması
- public media capture doğrulaması
- takip ilişkisinin güvenlik kontrolü
- arama izni kontrolü
- konum görünürlük sınırları

Frontend sadece durum gösterir ve istek başlatır.

Güvenlik kararı backend/RLS/storage/edge katmanında verilmelidir.

---

## 22. Zayıf Halka Kuralı

ANKION’da şu konular eşit önemlidir:

- anonim ses
- reveal/profil izni
- anlık medya doğruluğu
- privacy
- security
- location
- limits
- backend/RLS/storage
- UI/UX

Hiçbir konu diğerinden önemsiz kabul edilemez.

Bir alandaki açık diğer alanların güvenini bozar.

Zayıf halka kabul edilmez.

---

## 23. Her Karardan Önce Kontrol Listesi

Her ürün, kod, backend, UI veya monetizasyon kararından önce şu sorular sorulur:

1. Bu değişiklik kullanıcıyı profil gezmeye mi iter?
2. Bu değişiklik global profil açma hissi verir mi?
3. Bu değişiklik önce ses ilkesini zayıflatır mı?
4. Bu değişiklik owner-approved reveal modelini bozar mı?
5. Bu değişiklik kullanıcı adı/profil araması ihtiyacı doğurur mu?
6. Bu değişiklik Anonim kal ile Engelle ayrımını karıştırır mı?
7. Bu değişiklik anlık medya hilesine açık kapı bırakır mı?
8. Bu değişiklik takip/arama/plus özellikleriyle profil iznini bypass eder mi?

Bu sorulardan biri “evet” ise değişiklik yapılmaz.

---

## 24. V1 Kararı

Bu doküman ANKION için Supabase/backend geçişinden önce bağlayıcı ürün ve güvenlik sözleşmesidir.

Bu sözleşmeyle çelişen UI, backend, database, RLS, storage, monetization veya navigation kararı uygulanmaz.

V1 sonrası ilk teknik adım:

Supabase Readiness Audit.
'@ | Set-Content -Path "C:\ankion\docs\architecture\ANKION_CORE_PRODUCT_SECURITY_CONTRACT_V1.md" -Encoding UTF8
