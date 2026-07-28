package domain

import "testing"

// Bu testler Puanla'nın iki esnek hedefi de ölçtüğünü gösterir:
//   1. gün dengesi  (şube dersleri günlere yayılsın)
//   2. ders yığılma (aynı ders aynı güne toplanmasın)
// Ağırlıklar değişebileceği için testler çoğunlukla "karşılaştırma" yapar
// (yayılmış < yığılmış), tek bir kesin değer testi de formülü belgeler.

// Tek şube, tek ders, dört saat -> yayma/yığma senaryoları için elverişli.
func birDersDortSaat() []Oturum {
	return []Oturum{
		{ID: 1, DersAdi: "Matematik", SubeID: 100},
		{ID: 2, DersAdi: "Matematik", SubeID: 100},
		{ID: 3, DersAdi: "Matematik", SubeID: 100},
		{ID: 4, DersAdi: "Matematik", SubeID: 100},
	}
}

func TestPuanla_BosProgramSifir(t *testing.T) {
	oturumlar := birDersDortSaat()
	p := Program{Yerlesim: map[int]Slot{}} // hiçbir oturum yerleştirilmemiş

	if got := Puanla(oturumlar, p); got != 0 {
		t.Fatalf("boş programın puanı 0 olmalı, %d geldi", got)
	}
}

func TestPuanla_YayilmisProgramYigilmadanIyidir(t *testing.T) {
	oturumlar := birDersDortSaat()

	// Hepsi Pazartesi'ye yığılmış (slot 0,1,2,3 -> hepsi gün 0).
	yigilmis := Program{Yerlesim: map[int]Slot{1: 0, 2: 1, 3: 2, 4: 3}}
	// Pzt-Sal-Çar-Per'e dağılmış (slot 0, GunlukDers, 2*GunlukDers, 3*GunlukDers -> gün 0,1,2,3).
	yayilmis := Program{Yerlesim: map[int]Slot{1: 0, 2: Slot(GunlukDers), 3: Slot(2 * GunlukDers), 4: Slot(3 * GunlukDers)}}

	puanYigilmis := Puanla(oturumlar, yigilmis)
	puanYayilmis := Puanla(oturumlar, yayilmis)

	if puanYayilmis >= puanYigilmis {
		t.Fatalf("yayılmış program (%d) yığılmıştan (%d) daha DÜŞÜK puan almalı",
			puanYayilmis, puanYigilmis)
	}
}

func TestPuanla_GunDengesiAyniIkenYigilmaAzOlanIyidir(t *testing.T) {
	// İki ders (Matematik, Fizik), aynı şube, ikişer saat.
	oturumlar := []Oturum{
		{ID: 1, DersAdi: "Matematik", SubeID: 100},
		{ID: 2, DersAdi: "Matematik", SubeID: 100},
		{ID: 3, DersAdi: "Fizik", SubeID: 100},
		{ID: 4, DersAdi: "Fizik", SubeID: 100},
	}

	// Yığılmış: her ders kendi gününe toplanmış. Mat -> Pzt (0,1), Fiz -> Sal (GunlukDers, GunlukDers+1).
	// Şubenin günlük dağılımı: Pzt 2, Sal 2.
	yigilmis := Program{Yerlesim: map[int]Slot{1: 0, 2: 1, 3: Slot(GunlukDers), 4: Slot(GunlukDers + 1)}}

	// Yayılmış: her ders iki güne bölünmüş. Mat -> Pzt+Sal (0, GunlukDers), Fiz -> Pzt+Sal (1, GunlukDers+1).
	// Şubenin günlük dağılımı YİNE: Pzt 2, Sal 2 (yani gün dengesi birebir aynı).
	yayilmis := Program{Yerlesim: map[int]Slot{1: 0, 2: Slot(GunlukDers), 3: 1, 4: Slot(GunlukDers + 1)}}

	puanYigilmis := Puanla(oturumlar, yigilmis)
	puanYayilmis := Puanla(oturumlar, yayilmis)

	// Gün dengesi iki programda da aynı olduğundan, farkın tek kaynağı ders yığılması.
	if puanYayilmis >= puanYigilmis {
		t.Fatalf("gün dengesi aynıyken yığılması az olan (%d) daha düşük olmalı, yığılmış (%d)",
			puanYayilmis, puanYigilmis)
	}
}

func TestPuanla_BilinenDeger(t *testing.T) {
	// Tek şube, tek ders, iki saat; ikisi de Pazartesi (gün 0).
	oturumlar := []Oturum{
		{ID: 1, DersAdi: "Matematik", SubeID: 100},
		{ID: 2, DersAdi: "Matematik", SubeID: 100},
	}
	p := Program{Yerlesim: map[int]Slot{1: 0, 2: 1}}

	// Şube günlük: [2,0,0,0,0] -> kareler toplamı 4.
	// Ders  günlük: [2,0,0,0,0] -> kareler toplamı 4.
	// Puan = AgirlikGunDengesi*4 + AgirlikDersYigilma*4  (ağırlıklar değişse de doğru kalsın).
	beklenen := AgirlikGunDengesi*4 + AgirlikDersYigilma*4
	if got := Puanla(oturumlar, p); got != beklenen {
		t.Fatalf("beklenen %d, gelen %d", beklenen, got)
	}
}
