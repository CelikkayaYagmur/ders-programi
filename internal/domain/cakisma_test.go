package domain

import (
	"reflect"
	"testing"
)

// Bu testler CakismalariBul'un üç kesin kuralı da doğru yakaladığını gösterir:
//   1. aynı hoca aynı slotta olamaz
//   2. aynı şube aynı slotta olamaz
//   3. aynı Zoom aynı slotta olamaz

func TestCakismalariBul_BosProgramCakismaVermez(t *testing.T) {
	oturumlar := []Oturum{
		{ID: 1, DersAdi: "Matematik", HocaID: 10, SubeID: 100, ZoomID: 1000},
	}
	p := Program{Yerlesim: map[int]Slot{}} // hiçbir oturum yerleştirilmemiş

	got := CakismalariBul(oturumlar, p)

	if len(got) != 0 {
		t.Fatalf("boş programda çakışma olmamalı, %d tane bulundu: %+v", len(got), got)
	}
}

func TestCakismalariBul_AyniHocaFarkliSlotCakismaz(t *testing.T) {
	// Aynı hoca ama farklı saatlerde -> sorun yok.
	oturumlar := []Oturum{
		{ID: 1, HocaID: 10, SubeID: 100, ZoomID: 1000},
		{ID: 2, HocaID: 10, SubeID: 101, ZoomID: 1001},
	}
	p := Program{Yerlesim: map[int]Slot{
		1: 0, // Pazartesi 1. saat
		2: 1, // Pazartesi 2. saat
	}}

	got := CakismalariBul(oturumlar, p)

	if len(got) != 0 {
		t.Fatalf("farklı slotlarda çakışma olmamalı, bulundu: %+v", got)
	}
}

func TestCakismalariBul_AyniHocaAyniSlot(t *testing.T) {
	// Aynı hoca aynı saatte iki derste -> hoca çakışması.
	oturumlar := []Oturum{
		{ID: 1, HocaID: 10, SubeID: 100, ZoomID: 1000},
		{ID: 2, HocaID: 10, SubeID: 101, ZoomID: 1001},
	}
	p := Program{Yerlesim: map[int]Slot{
		1: 5,
		2: 5,
	}}

	got := CakismalariBul(oturumlar, p)

	if len(got) != 1 {
		t.Fatalf("tam olarak 1 çakışma bekleniyordu, %d bulundu: %+v", len(got), got)
	}
	c := got[0]
	if c.Tur != HocaCakismasi {
		t.Errorf("tür hoca olmalı, %v geldi", c.Tur)
	}
	if c.Slot != 5 {
		t.Errorf("slot 5 olmalı, %d geldi", c.Slot)
	}
	if c.KaynakID != 10 {
		t.Errorf("çakışan hoca 10 olmalı, %d geldi", c.KaynakID)
	}
	if !reflect.DeepEqual(c.Oturumlar, []int{1, 2}) {
		t.Errorf("oturumlar [1 2] olmalı, %v geldi", c.Oturumlar)
	}
}

func TestCakismalariBul_AyniSubeAyniSlot(t *testing.T) {
	// Aynı şube aynı saatte iki derste -> şube çakışması.
	oturumlar := []Oturum{
		{ID: 1, HocaID: 10, SubeID: 100, ZoomID: 1000},
		{ID: 2, HocaID: 11, SubeID: 100, ZoomID: 1001},
	}
	p := Program{Yerlesim: map[int]Slot{
		1: 3,
		2: 3,
	}}

	got := CakismalariBul(oturumlar, p)

	if len(got) != 1 {
		t.Fatalf("tam olarak 1 çakışma bekleniyordu, %d bulundu: %+v", len(got), got)
	}
	if got[0].Tur != SubeCakismasi || got[0].KaynakID != 100 {
		t.Errorf("şube 100 çakışması bekleniyordu, geldi: %+v", got[0])
	}
}

func TestCakismalariBul_AyniZoomAyniSlot(t *testing.T) {
	// Aynı Zoom adresi aynı saatte iki derse ayrılmış -> Zoom çakışması.
	oturumlar := []Oturum{
		{ID: 1, HocaID: 10, SubeID: 100, ZoomID: 1000},
		{ID: 2, HocaID: 11, SubeID: 101, ZoomID: 1000},
	}
	p := Program{Yerlesim: map[int]Slot{
		1: 7,
		2: 7,
	}}

	got := CakismalariBul(oturumlar, p)

	if len(got) != 1 {
		t.Fatalf("tam olarak 1 çakışma bekleniyordu, %d bulundu: %+v", len(got), got)
	}
	if got[0].Tur != ZoomCakismasi || got[0].KaynakID != 1000 {
		t.Errorf("Zoom 1000 çakışması bekleniyordu, geldi: %+v", got[0])
	}
}

func TestCakismalariBul_AyniSlottaHemHocaHemSube(t *testing.T) {
	// İki oturum aynı slotta; hem hocaları hem şubeleri aynı (Zoom farklı).
	// Beklenen: iki ayrı çakışma (bir hoca, bir şube).
	oturumlar := []Oturum{
		{ID: 1, HocaID: 10, SubeID: 100, ZoomID: 1000},
		{ID: 2, HocaID: 10, SubeID: 100, ZoomID: 1001},
	}
	p := Program{Yerlesim: map[int]Slot{
		1: 4,
		2: 4,
	}}

	got := CakismalariBul(oturumlar, p)

	if len(got) != 2 {
		t.Fatalf("2 çakışma bekleniyordu (hoca + şube), %d bulundu: %+v", len(got), got)
	}
	// Çıktı tür sırasına dizili: önce hoca, sonra şube.
	if got[0].Tur != HocaCakismasi {
		t.Errorf("ilk çakışma hoca olmalı, %v geldi", got[0].Tur)
	}
	if got[1].Tur != SubeCakismasi {
		t.Errorf("ikinci çakışma şube olmalı, %v geldi", got[1].Tur)
	}
}

func TestCakismalariBul_UcOturumAyniHocaTekGrup(t *testing.T) {
	// Üç oturum aynı hoca, aynı slot -> tek çakışma, üç oturum da içinde.
	oturumlar := []Oturum{
		{ID: 1, HocaID: 10, SubeID: 100, ZoomID: 1000},
		{ID: 2, HocaID: 10, SubeID: 101, ZoomID: 1001},
		{ID: 3, HocaID: 10, SubeID: 102, ZoomID: 1002},
	}
	p := Program{Yerlesim: map[int]Slot{
		1: 2,
		2: 2,
		3: 2,
	}}

	got := CakismalariBul(oturumlar, p)

	if len(got) != 1 {
		t.Fatalf("tek grup çakışma bekleniyordu, %d bulundu: %+v", len(got), got)
	}
	if !reflect.DeepEqual(got[0].Oturumlar, []int{1, 2, 3}) {
		t.Errorf("çakışan oturumlar [1 2 3] olmalı, %v geldi", got[0].Oturumlar)
	}
}
