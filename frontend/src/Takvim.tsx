import { Fragment } from 'react'
import './takvim.css'

// Not: Bu ekran şimdilik SAHTE veriyle çalışıyor (tasarımı görmek için).
// İleride oturumlar Go tarafından gelecek ve kartlar sürüklenebilir olacak.

const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
const GUNLUK_DERS = 8 // Go tarafındaki domain.GunlukDers ile aynı

// Frontend'deki oturum, Go'daki Oturum tipinin sadeleştirilmiş bir yansıması.
type Oturum = {
  id: number
  dersAdi: string
  hoca: string
  slot: number // 0..39
}

// Bir slottan gün ve saati çıkarmak (Go'daki Slot.Gun() / Slot.Saat() ile aynı mantık).
const gun = (slot: number) => Math.floor(slot / GUNLUK_DERS)
const saat = (slot: number) => slot % GUNLUK_DERS

// Örnek: 9-A şubesinin haftasından birkaç ders.
const ornekOturumlar: Oturum[] = [
  { id: 1, dersAdi: 'Matematik', hoca: 'Ali Vural', slot: 0 },   // Pzt 1
  { id: 2, dersAdi: 'Matematik', hoca: 'Ali Vural', slot: 1 },   // Pzt 2
  { id: 3, dersAdi: 'Fizik', hoca: 'Ayşe Kaya', slot: 9 },       // Sal 2
  { id: 4, dersAdi: 'Türkçe', hoca: 'Mehmet Demir', slot: 18 },  // Çar 3
  { id: 5, dersAdi: 'Kimya', hoca: 'Zeynep Ak', slot: 24 },      // Per 1
  { id: 6, dersAdi: 'Tarih', hoca: 'Can Yıldız', slot: 27 },     // Per 4
  { id: 7, dersAdi: 'İngilizce', hoca: 'Elif Şahin', slot: 33 }, // Cuma 2
]

export function Takvim() {
  // "gün-saat" anahtarından oturuma hızlı erişim (hangi hücrede ne var?).
  const yerlesim = new Map<string, Oturum>()
  for (const o of ornekOturumlar) {
    yerlesim.set(`${gun(o.slot)}-${saat(o.slot)}`, o)
  }

  return (
    <div className="takvim-sayfa">
      <header className="takvim-baslik">
        <h1>Ders Programı</h1>
        <p className="takvim-altbaslik">9-A şubesi — haftalık görünüm</p>
      </header>

      <div className="takvim">
        {/* Üst satır: sol boş köşe + gün başlıkları */}
        <div className="takvim-kose" />
        {GUNLER.map((g) => (
          <div key={g} className="takvim-gun-baslik">{g}</div>
        ))}

        {/* Her ders saati için bir satır: sol saat etiketi + 5 gün hücresi */}
        {Array.from({ length: GUNLUK_DERS }).map((_, saatIdx) => (
          <Fragment key={saatIdx}>
            <div className="takvim-saat-baslik">{saatIdx + 1}. ders</div>
            {GUNLER.map((_, gunIdx) => {
              const o = yerlesim.get(`${gunIdx}-${saatIdx}`)
              return (
                <div key={gunIdx} className="takvim-hucre">
                  {o && (
                    <div className="oturum-kart">
                      <span className="oturum-ders">{o.dersAdi}</span>
                      <span className="oturum-hoca">{o.hoca}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
