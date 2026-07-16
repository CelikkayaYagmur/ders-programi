package domain

import "sort"

// CakismaTuru, bir çakışmanın hangi kesin kuralı ihlal ettiğini söyler.
type CakismaTuru int

const (
	HocaCakismasi CakismaTuru = iota // aynı hoca aynı slotta iki derste
	SubeCakismasi                    // aynı şube aynı slotta iki derste
	ZoomCakismasi                    // aynı Zoom aynı slotta iki derste
)

func (t CakismaTuru) String() string {
	switch t {
	case HocaCakismasi:
		return "hoca"
	case SubeCakismasi:
		return "şube"
	case ZoomCakismasi:
		return "zoom"
	default:
		return "bilinmeyen"
	}
}

// Cakisma, tek bir kesin kural ihlalini anlatır:
// belirli bir slotta, belirli bir kaynağı (hoca/şube/Zoom) paylaşan oturumlar.
type Cakisma struct {
	Tur       CakismaTuru
	Slot      Slot
	KaynakID  int   // çakışan hoca/şube/Zoom'un ID'si
	Oturumlar []int // bu slotta o kaynağı paylaşan oturum ID'leri (en az 2 tane)
}

// CakismalariBul, bir yerleşimdeki (Program) tüm kesin kural ihlallerini döndürür.
// oturumlar: değişmeyen ders listesi (her oturumun hoca/şube/Zoom bilgisi burada).
// p:         hangi oturumun hangi slotta olduğu (değişen yerleşim).
//
// Üç kesin kural da aynı desendir: "aynı slotta aynı X'e sahip iki oturum var mı?"
// Bu yüzden tek bir yardımcı fonksiyonu üç alan (hoca, şube, Zoom) için çağırıyoruz.
func CakismalariBul(oturumlar []Oturum, p Program) []Cakisma {
	// Oturum ID'sinden oturumun kendisine hızlı erişim için harita.
	oturumByID := make(map[int]Oturum, len(oturumlar))
	for _, o := range oturumlar {
		oturumByID[o.ID] = o
	}

	var sonuc []Cakisma
	sonuc = append(sonuc, kaynakCakismalari(oturumByID, p, HocaCakismasi, func(o Oturum) int { return o.HocaID })...)
	sonuc = append(sonuc, kaynakCakismalari(oturumByID, p, SubeCakismasi, func(o Oturum) int { return o.SubeID })...)
	sonuc = append(sonuc, kaynakCakismalari(oturumByID, p, ZoomCakismasi, func(o Oturum) int { return o.ZoomID })...)

	// Çıktı deterministik olsun (test ve arayüz için): tür, slot, kaynak sırasına diz.
	sort.Slice(sonuc, func(i, j int) bool {
		if sonuc[i].Tur != sonuc[j].Tur {
			return sonuc[i].Tur < sonuc[j].Tur
		}
		if sonuc[i].Slot != sonuc[j].Slot {
			return sonuc[i].Slot < sonuc[j].Slot
		}
		return sonuc[i].KaynakID < sonuc[j].KaynakID
	})
	return sonuc
}

// kaynakCakismalari, tek bir alan üzerinden çakışmaları bulur.
// kaynakID: bir oturumdan ilgili alanı (HocaID / SubeID / ZoomID) seçen fonksiyon.
func kaynakCakismalari(oturumByID map[int]Oturum, p Program, tur CakismaTuru, kaynakID func(Oturum) int) []Cakisma {
	// (slot, kaynak) çifti -> o slotta o kaynağı kullanan oturum ID'leri.
	gruplar := make(map[[2]int][]int)
	for otID, slot := range p.Yerlesim {
		o, ok := oturumByID[otID]
		if !ok {
			continue // yerleşimde olup ders listesinde olmayan oturumu atla
		}
		anahtar := [2]int{int(slot), kaynakID(o)}
		gruplar[anahtar] = append(gruplar[anahtar], otID)
	}

	var sonuc []Cakisma
	for anahtar, oturumIDler := range gruplar {
		if len(oturumIDler) < 2 {
			continue // aynı kaynağı tek oturum kullanıyorsa çakışma yok
		}
		sort.Ints(oturumIDler) // grup içi sıralama deterministik olsun
		sonuc = append(sonuc, Cakisma{
			Tur:       tur,
			Slot:      Slot(anahtar[0]),
			KaynakID:  anahtar[1],
			Oturumlar: oturumIDler,
		})
	}
	return sonuc
}
