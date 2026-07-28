package main

import (
	"testing"
)

func TestCSP(t *testing.T) {
	s := &VeriService{
		dersYukleri: []DersYuku{
			{ID: 1, DersAdi: "Beden Eğitimi", SubeID: 1, Duration: 2},
			{ID: 2, DersAdi: "Matematik", SubeID: 1, Duration: 4},
		},
		hocaDersler: []HocaDers{
			{ID: 1, HocaID: 1, DersAdi: "Beden Eğitimi"},
			{ID: 2, HocaID: 2, DersAdi: "Matematik"},
		},
	}

	err := s.OtomatikOlustur()
	if err != nil {
		t.Fatalf("Failed: %v", err)
	}

	for _, o := range s.programOturumlari {
		t.Logf("Assigned: %s (Duration: %d) at Slot: %d", o.DersAdi, o.Duration, o.StartSlot)
	}
}
