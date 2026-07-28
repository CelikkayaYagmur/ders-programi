package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"slices"
	"sort"
	"sync"

	"changeme/internal/domain"
)

const veriDosyaAdi = "data.json"
var yuklendi = false

type VeriDeposu struct {
	Hocalar           []domain.Hoca           `json:"hocalar"`
	Dersler           []domain.Ders           `json:"dersler"`
	Subeler           []domain.Sube           `json:"subeler"`
	Zoomlar           []domain.Zoom           `json:"zoomlar"`
	ToplantiTur       []domain.ToplantiTuru   `json:"toplantiTur"`
	ProgramOturumlari []ProgramOturumu        `json:"programOturumlari"`
	DersYukleri       []DersYuku              `json:"dersYukleri"`
	HocaDersler       []HocaDers              `json:"hocaDersler"`
	SonrakiID         int                     `json:"sonrakiID"`
}

// DersYuku, otomatik ders programı oluşturmak için kullanılacak olan ders atamalarıdır.
type DersYuku struct {
	ID       int    `json:"id"`
	DersAdi  string `json:"dersAdi"`
	SubeID   int    `json:"subeId"`
	Duration int    `json:"duration"` // Kaç saat
}

// HocaDers, bir öğretmenin verebileceği dersleri tanımlar.
type HocaDers struct {
	ID      int    `json:"id"`
	HocaID  int    `json:"hocaId"`
	DersAdi string `json:"dersAdi"`
}

// ProgramOturumu, takvimde planlanmış olan tek bir oturum bloğudur.
type ProgramOturumu struct {
	ID        int    `json:"id"`
	DersAdi   string `json:"dersAdi"`
	HocaID    int    `json:"hocaId"`
	SubeID    int    `json:"subeId"`
	ZoomID    int    `json:"zoomId"`
	TurID     int    `json:"turId"`
	StartSlot int    `json:"startSlot"` // 0..39
	Duration  int    `json:"duration"`  // Kaç saat süreceği
}

type VeriService struct {
	kilit             sync.Mutex
	hocalar           []domain.Hoca
	dersler           []domain.Ders
	subeler           []domain.Sube
	zoomlar           []domain.Zoom
	toplantiTur       []domain.ToplantiTuru
	programOturumlari []ProgramOturumu
	dersYukleri       []DersYuku
	hocaDersler       []HocaDers
	sonrakiID         int // her yeni kayda benzersiz bir ID vermek için sayaç
}

func (s *VeriService) verileriYukle() {
	if yuklendi {
		return
	}
	yuklendi = true
	veri, err := os.ReadFile(veriDosyaAdi)
	if err != nil {
		return
	}
	var depo VeriDeposu
	err = json.Unmarshal(veri, &depo)
	if err == nil {
		s.hocalar = depo.Hocalar
		s.dersler = depo.Dersler
		s.subeler = depo.Subeler
		s.zoomlar = depo.Zoomlar
		s.toplantiTur = depo.ToplantiTur
		s.programOturumlari = depo.ProgramOturumlari
		s.dersYukleri = depo.DersYukleri
		s.hocaDersler = depo.HocaDersler
		s.sonrakiID = depo.SonrakiID
	}
}

func (s *VeriService) kaydet() {
	depo := VeriDeposu{
		Hocalar:           s.hocalar,
		Dersler:           s.dersler,
		Subeler:           s.subeler,
		Zoomlar:           s.zoomlar,
		ToplantiTur:       s.toplantiTur,
		ProgramOturumlari: s.programOturumlari,
		DersYukleri:       s.dersYukleri,
		HocaDersler:       s.hocaDersler,
		SonrakiID:         s.sonrakiID,
	}
	veri, err := json.MarshalIndent(depo, "", "  ")
	if err == nil {
		_ = os.WriteFile(veriDosyaAdi, veri, 0644)
	}
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
	s.verileriYukle()
	h := domain.Hoca{ID: s.yeniID(), Ad: ad}
	s.hocalar = append(s.hocalar, h)
	s.kaydet()
	return h
}

func (s *VeriService) HocaListele() []domain.Hoca {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	// append([]T{}, ...) her zaman gerçek bir dizi döndürür (boşsa bile),
	// böylece arayüzde "null" değil "[]" olur.
	return append([]domain.Hoca{}, s.hocalar...)
}

func (s *VeriService) HocaSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	s.hocalar = slices.DeleteFunc(s.hocalar, func(h domain.Hoca) bool { return h.ID == id })
	s.kaydet()
}

// --- Ders ---

func (s *VeriService) DersEkle(ad string) domain.Ders {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	d := domain.Ders{ID: s.yeniID(), Ad: ad}
	s.dersler = append(s.dersler, d)
	s.kaydet()
	return d
}

func (s *VeriService) DersListele() []domain.Ders {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	return append([]domain.Ders{}, s.dersler...)
}

func (s *VeriService) DersSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	s.dersler = slices.DeleteFunc(s.dersler, func(d domain.Ders) bool { return d.ID == id })
	s.kaydet()
}

// --- Sube ---

func (s *VeriService) SubeEkle(ad string) domain.Sube {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	su := domain.Sube{ID: s.yeniID(), Ad: ad}
	s.subeler = append(s.subeler, su)
	s.kaydet()
	return su
}

func (s *VeriService) SubeListele() []domain.Sube {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	return append([]domain.Sube{}, s.subeler...)
}

func (s *VeriService) SubeSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	s.subeler = slices.DeleteFunc(s.subeler, func(su domain.Sube) bool { return su.ID == id })
	s.kaydet()
}

// --- Zoom ---

func (s *VeriService) ZoomEkle(ad, adres string) domain.Zoom {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	z := domain.Zoom{ID: s.yeniID(), Ad: ad, Adres: adres}
	s.zoomlar = append(s.zoomlar, z)
	s.kaydet()
	return z
}

func (s *VeriService) ZoomListele() []domain.Zoom {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	return append([]domain.Zoom{}, s.zoomlar...)
}

func (s *VeriService) ZoomSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	s.zoomlar = slices.DeleteFunc(s.zoomlar, func(z domain.Zoom) bool { return z.ID == id })
	s.kaydet()
}

// --- Toplantı Türü ---

func (s *VeriService) ToplantiTuruEkle(ad string) domain.ToplantiTuru {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	t := domain.ToplantiTuru{ID: s.yeniID(), Ad: ad}
	s.toplantiTur = append(s.toplantiTur, t)
	s.kaydet()
	return t
}

func (s *VeriService) ToplantiTuruListele() []domain.ToplantiTuru {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	return append([]domain.ToplantiTuru{}, s.toplantiTur...)
}

func (s *VeriService) ToplantiTuruSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	s.toplantiTur = slices.DeleteFunc(s.toplantiTur, func(t domain.ToplantiTuru) bool { return t.ID == id })
	s.kaydet()
}

// --- Program Oturumları ---

func (s *VeriService) ProgramOturumEkle(dersAdi string, hocaID, subeID, zoomID, turID, startSlot, duration int) ProgramOturumu {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	o := ProgramOturumu{
		ID:        s.yeniID(),
		DersAdi:   dersAdi,
		HocaID:    hocaID,
		SubeID:    subeID,
		ZoomID:    zoomID,
		TurID:     turID,
		StartSlot: startSlot,
		Duration:  duration,
	}
	s.programOturumlari = append(s.programOturumlari, o)
	s.kaydet()
	return o
}

func (s *VeriService) ProgramOturumListele() []ProgramOturumu {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	if s.programOturumlari == nil {
		return []ProgramOturumu{}
	}
	return append([]ProgramOturumu{}, s.programOturumlari...)
}

func (s *VeriService) ProgramOturumGuncelle(id int, dersAdi string, hocaID, subeID, zoomID, turID, startSlot, duration int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	for i, o := range s.programOturumlari {
		if o.ID == id {
			s.programOturumlari[i].DersAdi = dersAdi
			s.programOturumlari[i].HocaID = hocaID
			s.programOturumlari[i].SubeID = subeID
			s.programOturumlari[i].ZoomID = zoomID
			s.programOturumlari[i].TurID = turID
			s.programOturumlari[i].StartSlot = startSlot
			s.programOturumlari[i].Duration = duration
			break
		}
	}
	s.kaydet()
}

func (s *VeriService) ProgramOturumSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	s.programOturumlari = slices.DeleteFunc(s.programOturumlari, func(o ProgramOturumu) bool { return o.ID == id })
	s.kaydet()
}

// --- Hoca Ders Eşleştirmeleri ---

func (s *VeriService) HocaDersEkle(hocaID int, dersAdi string) HocaDers {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	hd := HocaDers{
		ID:      s.yeniID(),
		HocaID:  hocaID,
		DersAdi: dersAdi,
	}
	s.hocaDersler = append(s.hocaDersler, hd)
	s.kaydet()
	return hd
}

func (s *VeriService) HocaDersListele() []HocaDers {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	if s.hocaDersler == nil {
		return []HocaDers{}
	}
	return append([]HocaDers{}, s.hocaDersler...)
}

func (s *VeriService) HocaDersSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	s.hocaDersler = slices.DeleteFunc(s.hocaDersler, func(hd HocaDers) bool { return hd.ID == id })
	s.kaydet()
}


// --- Ders Yükleri ---

func (s *VeriService) DersYukuEkle(dersAdi string, subeID, duration int) DersYuku {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	dy := DersYuku{
		ID:       s.yeniID(),
		DersAdi:  dersAdi,
		SubeID:   subeID,
		Duration: duration,
	}
	s.dersYukleri = append(s.dersYukleri, dy)
	s.kaydet()
	return dy
}

func (s *VeriService) DersYukuListele() []DersYuku {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	if s.dersYukleri == nil {
		return []DersYuku{}
	}
	return append([]DersYuku{}, s.dersYukleri...)
}

func (s *VeriService) DersYukuGuncelle(id int, dersAdi string, subeID, duration int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	for i, dy := range s.dersYukleri {
		if dy.ID == id {
			s.dersYukleri[i].DersAdi = dersAdi
			s.dersYukleri[i].SubeID = subeID
			s.dersYukleri[i].Duration = duration
			break
		}
	}
	s.kaydet()
}

func (s *VeriService) DersYukuSil(id int) {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()
	s.dersYukleri = slices.DeleteFunc(s.dersYukleri, func(dy DersYuku) bool { return dy.ID == id })
	s.kaydet()
}

// OtomatikOlustur clears current sessions and generates a new schedule based on DersYukleri using a CSP Solver.
func (s *VeriService) OtomatikOlustur() error {
	s.kilit.Lock()
	defer s.kilit.Unlock()
	s.verileriYukle()

	s.programOturumlari = []ProgramOturumu{}

	// 1. Gather Qualified Teachers for each Subject
	subjectTeachers := make(map[string][]int)
	for _, hd := range s.hocaDersler {
		subjectTeachers[hd.DersAdi] = append(subjectTeachers[hd.DersAdi], hd.HocaID)
	}

	// 2. Build the list of Variables (1-hour blocks to schedule)
	type Variable struct {
		SubeID           int
		DersAdi          string
		QualifiedTeacher []int
		MaxPerDay        int
	}

	var variables []Variable
	for _, dy := range s.dersYukleri {
		teachers := subjectTeachers[dy.DersAdi]
		if len(teachers) == 0 {
			return fmt.Errorf("çözüm bulunamadı: %s dersini verebilecek tanımlı bir öğretmen yok (Şube ID: %d)", dy.DersAdi, dy.SubeID)
		}
		
		// Eğer haftada 5 saatten fazlaysa, günde birden fazla o dersten olabilir.
		maxPerDay := (dy.Duration / 5) + 1
		if dy.Duration%5 == 0 {
			maxPerDay = dy.Duration / 5
		}

		for i := 0; i < dy.Duration; i++ {
			variables = append(variables, Variable{
				SubeID:           dy.SubeID,
				DersAdi:          dy.DersAdi,
				QualifiedTeacher: teachers,
				MaxPerDay:        maxPerDay,
			})
		}
	}

	// 3. Heuristic: Minimum Remaining Values (MRV)
	// Sort variables so that those with the fewest qualified teachers are scheduled first.
	sort.Slice(variables, func(i, j int) bool {
		return len(variables[i].QualifiedTeacher) < len(variables[j].QualifiedTeacher)
	})

	// 4. Timeslots Definition
	var allSlots []int
	for day := 0; day < 5; day++ {
		for _, s := range []int{4, 8, 12, 16, 20, 24, 28, 32, 36} { // 9 slots per day
			allSlots = append(allSlots, day*64+s)
		}
	}

	// 5. Fast Constraint Checking Matrices
	teacherSchedule := make(map[int]map[int]bool) // TeacherID -> Slot -> occupied
	classSchedule := make(map[int]map[int]bool)   // SubeID -> Slot -> occupied
	zoomSchedule := make(map[int]map[int]bool)    // ZoomID -> Slot -> occupied
	classSubjectDay := make(map[int]map[string]map[int]int) // SubeID -> DersAdi -> Day -> count
	teacherLoad := make(map[int]int)              // TeacherID -> Total Assigned Hours
	
	// Helper to init maps
	initMaps := func(subeID, hocaID, zoomID int, dersAdi string) {
		if teacherSchedule[hocaID] == nil {
			teacherSchedule[hocaID] = make(map[int]bool)
		}
		if classSchedule[subeID] == nil {
			classSchedule[subeID] = make(map[int]bool)
		}
		if zoomID > 0 && zoomSchedule[zoomID] == nil {
			zoomSchedule[zoomID] = make(map[int]bool)
		}
		if classSubjectDay[subeID] == nil {
			classSubjectDay[subeID] = make(map[string]map[int]int)
		}
		if classSubjectDay[subeID][dersAdi] == nil {
			classSubjectDay[subeID][dersAdi] = make(map[int]int)
		}
	}

	assignments := make([]ProgramOturumu, len(variables))

	// 6. Backtracking Solver
	var solve func(index int) bool
	solve = func(index int) bool {
		if index == len(variables) {
			return true // All variables assigned!
		}

		v := variables[index]
		
		// To distribute randomly and generate different schedules on each run, use a random offset
		startOffset := rand.Intn(len(allSlots))

		// To load balance, sort qualified teachers by their current assigned load
		sortedTeachers := make([]int, len(v.QualifiedTeacher))
		copy(sortedTeachers, v.QualifiedTeacher)
		sort.Slice(sortedTeachers, func(i, j int) bool {
			return teacherLoad[sortedTeachers[i]] < teacherLoad[sortedTeachers[j]]
		})

		// Domain iteration: Timeslots x Teachers
		for attempt := 0; attempt < len(allSlots); attempt++ {
			slotIdx := (startOffset + attempt*13) % len(allSlots)
			slot := allSlots[slotIdx]
			day := slot / 64

			// Check Class Double-Booking
			if classSchedule[v.SubeID][slot] {
				continue
			}

			// Check Subject Max Per Day Limit
			if classSubjectDay[v.SubeID][v.DersAdi][day] >= v.MaxPerDay {
				continue
			}

			// Zoom Account Availability
			var selectedZoomID int
			if len(s.zoomlar) > 0 {
				for _, z := range s.zoomlar {
					if zoomSchedule[z.ID] == nil {
						zoomSchedule[z.ID] = make(map[int]bool)
					}
					if !zoomSchedule[z.ID][slot] {
						selectedZoomID = z.ID
						break
					}
				}
				if selectedZoomID == 0 {
					// No zoom account available for this slot, skip slot
					continue
				}
			} else {
				// If NO zoom accounts are defined at all in the system, we can't assign one, but we should fail because the user wants them.
				continue
			}

			// Try each qualified teacher (prioritizing those with the least load)
			for _, tID := range sortedTeachers {
				// Check Teacher Double-Booking
				if teacherSchedule[tID][slot] {
					continue
				}

				// --- ASSIGN ---
				initMaps(v.SubeID, tID, selectedZoomID, v.DersAdi)
				
				teacherSchedule[tID][slot] = true
				classSchedule[v.SubeID][slot] = true
				if selectedZoomID > 0 {
					zoomSchedule[selectedZoomID][slot] = true
				}
				classSubjectDay[v.SubeID][v.DersAdi][day]++
				teacherLoad[tID]++
				
				assignments[index] = ProgramOturumu{
					ID:        s.yeniID(),
					DersAdi:   v.DersAdi,
					HocaID:    tID,
					SubeID:    v.SubeID,
					ZoomID:    selectedZoomID,
					Duration:  4, // 1 saat
					StartSlot: slot,
				}

				// RECURSE
				if solve(index + 1) {
					return true
				}

				// --- BACKTRACK (Undo Assignment) ---
				teacherSchedule[tID][slot] = false
				classSchedule[v.SubeID][slot] = false
				if selectedZoomID > 0 {
					zoomSchedule[selectedZoomID][slot] = false
				}
				classSubjectDay[v.SubeID][v.DersAdi][day]--
				teacherLoad[tID]--
			}
		}

		return false
	}

	// 7. Execute Solver
	if !solve(0) {
		// To provide meaningful error, we can find the index that failed furthest.
		// For simplicity, we just return a general error with the current variable that couldn't be placed.
		return fmt.Errorf("Çözüm bulunamadı! Lütfen kontrol edin:\n1) Yeterli Zoom hesabınız var mı? (Her dersin Zoom linki olması zorunludur)\n2) Öğretmenlerin aynı anda birden fazla dersi var mı?")
	}

	s.programOturumlari = assignments
	s.kaydet()
	return nil
}
