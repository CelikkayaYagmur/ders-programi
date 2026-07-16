package domain

// Esnek kural ağırlıkları. Bunlar AYARDIR, gerçek değil — çıktıya bakılıp değiştirilir.
// Bu yüzden sabit gibi davranma, kolayca oynanabilir tut.
const (
	AgirlikGunDengesi  = 10 // bir şubenin dersleri günlere eşit yayılmazsa
	AgirlikDersYigilma = 3  // aynı ders (şube içinde) aynı güne yığılırsa
)

// dersGrubu, "bir şubenin belirli bir dersi"ni tanımlar (ör. 9-A'nın Matematik'i).
// Aynı ders farklı şubelerde ayrı grup sayılır.
type dersGrubu struct {
	SubeID  int
	DersAdi string
}

// Puanla, bir yerleşimin ESNEK kural cezasını verir. DÜŞÜK = İYİ.
// Kesin kurallara (çakışma) bakmaz; onlar CakismalariBul'un işi.
//
// İki esnek hedef ölçülür:
//  1. Gün dengesi  : her ŞUBE'nin dersleri 5 güne dengeli yayılsın.
//  2. Ders yığılma : aynı ders (şube içinde) hep aynı güne toplanmasın.
//
// İkisini de aynı yöntemle ölçüyoruz: bir gruptaki GÜNLÜK ders sayılarının
// KARELER TOPLAMI. Neden kare? Sabit sayıda ders için kareler toplamı ancak
// dersler günlere eşit dağıldığında en küçük olur. Yani bir güne yığmak cezayı
// büyütür, günlere yaymak küçültür.
func Puanla(oturumlar []Oturum, p Program) int {
	oturumByID := make(map[int]Oturum, len(oturumlar))
	for _, o := range oturumlar {
		oturumByID[o.ID] = o
	}

	// Her grup için 5 günlük sayaç: indeks = gün (0..4), değer = o günkü ders sayısı.
	subeGunleri := make(map[int][]int)       // şube      -> günlük sayaç
	dersGunleri := make(map[dersGrubu][]int) // (şube,ders) -> günlük sayaç

	for otID, slot := range p.Yerlesim {
		o, ok := oturumByID[otID]
		if !ok {
			continue // yerleşimde olup ders listesinde olmayan oturumu sayma
		}
		gun := slot.Gun()

		if subeGunleri[o.SubeID] == nil {
			subeGunleri[o.SubeID] = make([]int, GunSayisi)
		}
		subeGunleri[o.SubeID][gun]++

		grup := dersGrubu{SubeID: o.SubeID, DersAdi: o.DersAdi}
		if dersGunleri[grup] == nil {
			dersGunleri[grup] = make([]int, GunSayisi)
		}
		dersGunleri[grup][gun]++
	}

	gunDengesiCeza := 0
	for _, gunluk := range subeGunleri {
		gunDengesiCeza += karelerToplami(gunluk)
	}

	dersYigilmaCeza := 0
	for _, gunluk := range dersGunleri {
		dersYigilmaCeza += karelerToplami(gunluk)
	}

	return AgirlikGunDengesi*gunDengesiCeza + AgirlikDersYigilma*dersYigilmaCeza
}

// karelerToplami, günlük ders sayılarının karelerinin toplamını verir.
func karelerToplami(sayilar []int) int {
	toplam := 0
	for _, s := range sayilar {
		toplam += s * s
	}
	return toplam
}
