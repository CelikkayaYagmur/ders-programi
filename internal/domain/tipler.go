// Package domain, ders programının alan modelini (veri tipleri) tutar.
// Burada iş mantığı yok, sadece "veri neye benziyor" sorusunun cevabı var.
package domain

// Programın boyutları. Bunlar ayardır, kolayca değiştirilebilir.
const (
	GunSayisi  = 5 // Pazartesi..Cuma
	GunlukDers = 8 // her günde 8 ders saati
)

// Slot, haftadaki tek bir ders saatini temsil eden tam sayıdır (0..39).
// Zamanı saat/tarih olarak değil slot olarak tutuyoruz; böylece "aynı saatte mi?"
// kontrolü basit bir karşılaştırmaya (a == b) iner.
type Slot int

// Gun, slotun hangi güne düştüğünü verir (0 = Pazartesi ... 4 = Cuma).
func (s Slot) Gun() int { return int(s) / GunlukDers }

// Saat, slotun gün içindeki kaçıncı ders saati olduğunu verir (0..7).
func (s Slot) Saat() int { return int(s) % GunlukDers }

// Oturum, yerleştirilecek TEK BİR ders saatidir.
// "Matematik 9-A haftada 4 saat" -> aynı DersAdi/HocaID/SubeID ile 4 ayrı Oturum.
type Oturum struct {
	ID      int
	DersAdi string
	HocaID  int
	SubeID  int
	ZoomID  int
}

// Program, hangi oturumun hangi slota konduğunu tutar.
// Anahtar: Oturum.ID, Değer: o oturumun yerleştirildiği Slot.
type Program struct {
	Yerlesim map[int]Slot
}
