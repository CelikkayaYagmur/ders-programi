# Ders Programı Çizelgeleme Uygulaması

## Ne yapıyoruz

Bir okulun ders programını hazırlayan masaüstü uygulaması. Hoca uygulamayı açar,
öğretmenleri / şubeleri / Zoom adreslerini / dersleri girer, sonra programı
elle düzenler. İleride otomatik program üreten bir algoritma da eklenecek.

Bu bir üniversite bitirme/dönem projesi. Mentörümüz olan bir hoca var.

## Ekip

- İki kişilik ekip. Biri macOS, biri Windows kullanıyor.
- Kod her iki platformda da çalışmak zorunda.

## Teknoloji

- **Wails v3** (alpha) — Go backend + web frontend, tek .exe çıkarıyor
- **Go** — tüm iş mantığı burada
- **React + TypeScript** — arayüz
- **Vite** — build (Wails şablonuyla geliyor)
- **Tailwind CSS** — stil
- **TanStack Query** — Go'dan gelen veriler
- **Zustand** — sadece arayüz durumu (açık sekme, tema vb.)
- **Biome** — lint + format

## Teknoloji kuralları

- **Redux KURMA.** Verilerin çoğu Go tarafında. Sunucu verisi için TanStack Query,
  arayüz durumu için Zustand yeterli. Bu bilinçli bir karar.
- **CGO gerektiren kütüphane EKLEME.** Tek .exe dağıtımını bozuyor.
  SQLite gerekirse `modernc.org/sqlite` kullan (saf Go).
  `mattn/go-sqlite3` KULLANMA.
- **Dosya yolu birleştirirken her zaman `filepath.Join`.** Asla `"klasor/" + dosya` yapma.
- **WebView motorları farklı:** macOS'ta WebKit/Safari, Windows'ta Chromium/WebView2.
  Yeni CSS özellikleri (container queries, `:has()`, subgrid) kullanma.
  Vite `build.target` olarak Safari 16'yı taban al.
- Yeni bir kütüphane eklemeden önce sor. Bağımlılık sayısını düşük tut.

---

## Alan kuralları — projenin kalbi

### Kesin kurallar (hard constraints)

Bunlar ihlal edilirse program **geçersizdir**. Yarısı doğru diye bir şey yok.

1. Aynı **hoca** aynı saatte iki derste olamaz
2. Aynı **Zoom adresi** aynı saatte iki derse ayrılamaz
3. Aynı **şube** aynı saatte iki derste olamaz

Üçü de aynı desendir: "aynı slotta aynı X'e sahip iki oturum var mı?"
Tek fonksiyonla, üç alan üzerinden kontrol edilir.

### Esnek kurallar (soft constraints)

Amaç ihlal etmemek değil, **ihlali en aza indirmek**. Puanla() bunları ölçer.
Dengeleme **şube bazlıdır** — hoca yükü bir hedef değil.

1. Bir şubenin dersleri günlere eşit yayılsın (Pzt 8 / Sal 0 olmasın)
2. Aynı ders hep aynı güne yığılmasın (Matematik'in 4 saati Salı'ya toplanmasın)

Bu ayrım (hard vs soft) tüm mimarinin temeli. Kod yazarken bu terimleri kullan.

### Girdi olan / karar verilen

- Hangi hocanın hangi dersi vereceği **girdidir**, algoritma buna karar vermez.
- Bir hoca birden çok şubeye ve birden çok seviyeye girebilir. Bu normaldir.
- Algoritmanın verdiği tek karar: **her oturum hangi slot'a gidecek.**

---

## Veri modeli

Zamanı saat/tarih olarak DEĞİL, tam sayı slot olarak tut.
"Aynı saatte mi" kontrolü `a.Slot == b.Slot` olsun.

```go
const GunSayisi = 5
const GunlukDers = 8

type Slot int  // 0..39

func (s Slot) Gun() int  { return int(s) / GunlukDers }
func (s Slot) Saat() int { return int(s) % GunlukDers }

// Yerleştirilecek TEK BİR ders saati.
// "Matematik 9-A haftada 4 saat" -> aynı DersAdi/HocaID/SubeID ile 4 ayrı Oturum.
type Oturum struct {
    ID      int
    DersAdi string
    HocaID  int
    SubeID  int
    ZoomID  int
}

type Program struct {
    Yerlesim map[int]Slot  // OturumID -> Slot
}
```

## İki kritik fonksiyon

```go
func CakismalariBul(p Program) []Cakisma  // kesin kural ihlalleri
func Puanla(p Program) int                // esnek kural cezası, düşük = iyi
```

Bunlar projenin temeli. İki yerde kullanılacaklar:

1. Hoca elle ders sürüklerken → "bu hoca o saatte dolu" uyarısı
2. Otomatik algoritma → milyonlarca kez çağrılacak

Yani iyi yazılırlarsa algoritma aşamasında işin çoğu bitmiş olur.
Bu yüzden bunlar önce yazılır ve testleri olur.

### Puanlama ağırlıkları

```go
const (
    AgirlikGunDengesi  = 10
    AgirlikDersYigilma = 3
)
```

Bu sayılar **ayardır, gerçek değil.** Çıktıya bakarak değiştirilecekler.
Sabit gibi davranma, kolayca değiştirilebilir tut.

---

## Yol haritası

**Şu anki aşama: 1**

1. Veri modeli + `CakismalariBul` + `Puanla` + testleri ← BURADAYIZ
2. Veri girişi ekranları (hoca, şube, Zoom, ders)
3. Elle program düzenleme ekranı (sürükle-bırak + canlı çakışma uyarısı)
4. Kalıcı kayıt (dosya veya SQLite)
5. Otomatik algoritma (muhtemelen simulated annealing, saf Go)

Aşama atlamayalım. 1 bitmeden 2'ye geçme.

### Algoritma hakkında ön karar (aşama 5 için)

- **Simulated annealing** — muhtemel seçim. Saf Go, ~200 satır, tek exe bozulmaz.
- **OR-Tools CP-SAT** — endüstri standardı ama Go binding'i yok, Python gerektirir.
  Tek exe dağıtımını bozar. Bu yüzden eleniyor.
- **Genetik algoritma** — masada ama timetabling'de genelde annealing'den kötü
  sonuç verir ve ayarlaması zordur.

Nihai karar hocayla tartışılacak. Aşama 5'ten önce bu konuda kod yazma.

---

## Çalışma şekli

- **Küçük adımlarla ilerle.** Tek seferde bir özellik. 200 satırlık yamalar üretme.
- **Her değişiklikten sonra ne yaptığını sade Türkçe anlat.**
- Terim kullanman gerekiyorsa ilk geçtiği yerde bir cümleyle açıkla.
- Yeni bir kütüphane, yeni bir mimari desen veya kapsamlı bir yeniden yapılandırma
  önermeden önce sor.
- `CakismalariBul` ve `Puanla` için test yaz. Testler okunabilir olsun —
  ekip bunları okuyup anlayacak.
- Bir şeyi neden öyle yaptığını sorulunca açıkla. Bu bir öğrenme projesi;
  çalışan kod kadar anlaşılan kod da hedef.
