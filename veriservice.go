package main

import (
	"slices"
	"sync"

	"changeme/internal/domain"
)

// VeriService, veri giriş ekranlarının kullandığı basit bir depodur.
// Yağmur'un formları buna YAZAR (Ekle/Sil), takvim ekranı buradan OKUR (Listele).
//
// Şimdilik veriyi BELLEKTE tutuyoruz: uygulama kapanınca kayıtlar silinir.
// Kalıcı kayıt (dosya veya SQLite) yol haritasında Aşama 4'te eklenecek.
//
// Not (mutex): Wails metotları farklı goroutine'lerden çağrılabildiği için,
// listeleri değiştiren/okuyan yerleri bir kilitle koruyoruz. Kilit, aynı anda
// iki işlemin listeyi bozmasını engeller.
type VeriService struct {
	kilit       sync.Mutex
	hocalar     []domain.Hoca
	subeler     []domain.Sube
	zoomlar     []domain.Zoom
	toplantiTur []domain.ToplantiTuru
	sonrakiID   int // her yeni kayda benzersiz bir ID vermek için sayaç
}

// yeniID, bir sonraki benzersiz kimliği üretir. (Kilit zaten alınmış olmalı.)
func (s *VeriService) yeniID() int {
	s.sonrakiID++
	return s.sonrakiID
}

// --- Hoca ---

func (s *VeriService) HocaEkle(ad string) domain.Hoca {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	h := domain.Hoca{ID: s.yeniID(), Ad: ad}
	s.hocalar = append(s.hocalar, h)
	return h
}

func (s *VeriService) HocaListele() []domain.Hoca {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	// append([]T{}, ...) her zaman gerçek bir dizi döndürür (boşsa bile),
	// böylece arayüzde "null" değil "[]" olur.
	return append([]domain.Hoca{}, s.hocalar...)
}

func (s *VeriService) HocaSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.hocalar = slices.DeleteFunc(s.hocalar, func(h domain.Hoca) bool { return h.ID == id })
}

// --- Sube ---

func (s *VeriService) SubeEkle(ad string) domain.Sube {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	su := domain.Sube{ID: s.yeniID(), Ad: ad}
	s.subeler = append(s.subeler, su)
	return su
}

func (s *VeriService) SubeListele() []domain.Sube {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	return append([]domain.Sube{}, s.subeler...)
}

func (s *VeriService) SubeSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.subeler = slices.DeleteFunc(s.subeler, func(su domain.Sube) bool { return su.ID == id })
}

// --- Zoom ---

func (s *VeriService) ZoomEkle(ad, adres string) domain.Zoom {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	z := domain.Zoom{ID: s.yeniID(), Ad: ad, Adres: adres}
	s.zoomlar = append(s.zoomlar, z)
	return z
}

func (s *VeriService) ZoomListele() []domain.Zoom {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	return append([]domain.Zoom{}, s.zoomlar...)
}

func (s *VeriService) ZoomSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.zoomlar = slices.DeleteFunc(s.zoomlar, func(z domain.Zoom) bool { return z.ID == id })
}

// --- Toplantı Türü ---

func (s *VeriService) ToplantiTuruEkle(ad string) domain.ToplantiTuru {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	t := domain.ToplantiTuru{ID: s.yeniID(), Ad: ad}
	s.toplantiTur = append(s.toplantiTur, t)
	return t
}

func (s *VeriService) ToplantiTuruListele() []domain.ToplantiTuru {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	return append([]domain.ToplantiTuru{}, s.toplantiTur...)
}

func (s *VeriService) ToplantiTuruSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.toplantiTur = slices.DeleteFunc(s.toplantiTur, func(t domain.ToplantiTuru) bool { return t.ID == id })
}
