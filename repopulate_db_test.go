package main

import (
	"testing"
	"fmt"
	"changeme/internal/domain"
)

func TestRepopulateDB(t *testing.T) {
	vs := &VeriService{}
	vs.kilit.Lock()
	vs.verileriYukle()
	// Clean
	vs.hocalar = nil
	vs.dersler = nil
	vs.subeler = nil
	vs.dersYukleri = nil
	vs.hocaDersler = nil
	vs.programOturumlari = nil
	vs.sonrakiID = 0
	
	// Subeler
	var subeIDs []int
	for grade := 1; grade <= 12; grade++ {
		for _, branch := range []string{"A", "B"} {
			className := fmt.Sprintf("%d%s", grade, branch)
			vs.sonrakiID++
			sube := domain.Sube{ID: vs.sonrakiID, Ad: className}
			vs.subeler = append(vs.subeler, sube)
			subeIDs = append(subeIDs, sube.ID)
		}
	}

	// Lectures
	lectures := []string{"Matematik", "Fizik", "Kimya", "Biyoloji", "Edebiyat", "Tarih", "Ingilizce", "Beden Egitimi"}
	var dersAdlari []string
	
	for _, lec := range lectures {
		vs.sonrakiID++
		ders := domain.Ders{ID: vs.sonrakiID, Ad: lec}
		vs.dersler = append(vs.dersler, ders)
		dersAdlari = append(dersAdlari, ders.Ad)
		
		// Create 3 teachers per lecture so they can handle 96 hours (3 * 45 = 135 slots max)
		for i := 1; i <= 3; i++ {
			hocaName := fmt.Sprintf("Hoca %s %d", lec, i)
			vs.sonrakiID++
			hoca := domain.Hoca{ID: vs.sonrakiID, Ad: hocaName}
			vs.hocalar = append(vs.hocalar, hoca)
			
			// Assign lecture to teacher
			vs.sonrakiID++
			hd := HocaDers{ID: vs.sonrakiID, HocaID: hoca.ID, DersAdi: ders.Ad}
			vs.hocaDersler = append(vs.hocaDersler, hd)
		}
	}
	
	for _, subeID := range subeIDs {
		for _, dersAdi := range dersAdlari {
			vs.sonrakiID++
			dy := DersYuku{ID: vs.sonrakiID, DersAdi: dersAdi, SubeID: subeID, Duration: 4}
			vs.dersYukleri = append(vs.dersYukleri, dy)
		}
	}
	
	vs.kaydet()
	vs.kilit.Unlock()
}
