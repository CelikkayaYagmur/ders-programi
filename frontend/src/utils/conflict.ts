import { Hoca, Sube, Zoom } from '../../bindings/changeme/internal/domain/models';
import { ProgramOturumu } from '../../bindings/changeme/models';

export const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const GUNLUK_DERS = 64;

export interface Conflict {
  id1: number;
  id2: number;
  type: 'hoca' | 'zoom' | 'sube';
  message: string;
  slot: number;
}

export const formatConflictTime = (slotNum: number) => {
  const startSaatVal = slotNum % GUNLUK_DERS;
  const startTotalMinutes = 7 * 60 + startSaatVal * 15; // Offset by 7 hours (7am)
  const hours = Math.floor(startTotalMinutes / 60) % 24;
  const mins = startTotalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const getSlotTimeRange = (startSlot: number, duration: number) => {
  const startSaatVal = startSlot % GUNLUK_DERS;
  const startTotalMinutes = 7 * 60 + startSaatVal * 15;
  const endTotalMinutes = startTotalMinutes + duration * 15;
  
  const formatMinutes = (totalMins: number) => {
    const totalHours = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    return `${totalHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  return `${formatMinutes(startTotalMinutes)} - ${formatMinutes(endTotalMinutes)}`;
};

/**
 * Checks if inserting a new session or modifying an existing one creates conflicts.
 * This is used for drag/drop, resize, and modal save logic to get a single error string, if any.
 */
export const checkSingleConflict = (
  oturumlar: ProgramOturumu[],
  hocalar: Hoca[],
  subeler: Sube[],
  zoomlar: Zoom[],
  hedefOturumId: number | null, // The ID of the session being modified/added. null if adding new.
  hedefHocaId: number,
  hedefZoomId: number,
  hedefSubeId: number,
  hedefDersAdi: string,
  hedefStartSlot: number,
  hedefDuration: number
): string | null => {
  const newSlots = Array.from({ length: hedefDuration }).map((_, idx) => hedefStartSlot + idx);

  for (const o of oturumlar) {
    if (hedefOturumId !== null && o.id === hedefOturumId) continue;
    
    const oSlots = Array.from({ length: o.duration }).map((_, idx) => o.startSlot + idx);
    const overlappingSlot = newSlots.find(s => oSlots.includes(s));
    
    if (overlappingSlot !== undefined) {
      const timeStr = formatConflictTime(overlappingSlot);
      const gunIdx = Math.floor(overlappingSlot / GUNLUK_DERS);
      const currentSubeName = subeler.find(s => s.ID === hedefSubeId)?.Ad || 'Sınıf';
      const otherSubeName = subeler.find(s => s.ID === o.subeId)?.Ad || 'Sınıf';

      // 1. Aynı Hoca Çakışması
      if (hedefHocaId > 0 && o.hocaId && hedefHocaId === o.hocaId) {
        const hName = hocalar.find(h => h.ID === hedefHocaId)?.Ad || 'Öğretmen';
        return `${GUNLER[gunIdx]} günü saat ${timeStr}'de ${currentSubeName} sınıfındaki "${hedefDersAdi}" dersi ile ${otherSubeName} sınıfındaki "${o.dersAdi}" dersi için öğretmen ${hName} çakışıyor!`;
      }
      
      // 2. Aynı Zoom Çakışması
      if (hedefZoomId > 0 && o.zoomId && hedefZoomId === o.zoomId) {
        const zName = zoomlar.find(z => z.ID === hedefZoomId)?.Ad || 'Zoom';
        return `${GUNLER[gunIdx]} günü saat ${timeStr}'de ${currentSubeName} sınıfındaki "${hedefDersAdi}" dersi ile ${otherSubeName} sınıfındaki "${o.dersAdi}" dersi için ${zName} hesabı çakışıyor!`;
      }

      // 3. Aynı Şube Çakışması
      if (hedefSubeId > 0 && o.subeId && hedefSubeId === o.subeId) {
        return `${GUNLER[gunIdx]} günü saat ${timeStr}'de ${currentSubeName} sınıfında "${o.dersAdi}" dersi zaten mevcut!`;
      }
    }
  }

  return null; // No conflicts
};

/**
 * Calculates all active conflicts in the current schedule.
 */
export const calculateAllConflicts = (
  oturumlar: ProgramOturumu[],
  hocalar: Hoca[],
  subeler: Sube[],
  zoomlar: Zoom[]
): Conflict[] => {
  const list: Conflict[] = [];
  
  for (let i = 0; i < oturumlar.length; i++) {
    const o1 = oturumlar[i];
    const slots1 = Array.from({ length: o1.duration }).map((_, idx) => o1.startSlot + idx);
    
    for (let j = i + 1; j < oturumlar.length; j++) {
      const o2 = oturumlar[j];
      const slots2 = Array.from({ length: o2.duration }).map((_, idx) => o2.startSlot + idx);
      
      const overlappingSlot = slots1.find(s => slots2.includes(s));
      if (overlappingSlot !== undefined) {
        const timeStr = formatConflictTime(overlappingSlot);
        const s1Name = subeler.find(s => s.ID === o1.subeId)?.Ad || 'Sınıf';
        const s2Name = subeler.find(s => s.ID === o2.subeId)?.Ad || 'Sınıf';
        const gunIdx = Math.floor(overlappingSlot / GUNLUK_DERS);

        if (o1.hocaId && o2.hocaId && o1.hocaId === o2.hocaId) {
          const hName = hocalar.find(h => h.ID === o1.hocaId)?.Ad || 'Öğretmen';
          list.push({
            id1: o1.id,
            id2: o2.id,
            type: 'hoca',
            message: `${GUNLER[gunIdx]} günü saat ${timeStr}'de ${s1Name} sınıfındaki "${o1.dersAdi}" dersi ile ${s2Name} sınıfındaki "${o2.dersAdi}" dersi için öğretmen ${hName} çakışıyor.`,
            slot: overlappingSlot
          });
        }
        else if (o1.zoomId && o2.zoomId && o1.zoomId === o2.zoomId) {
          const zName = zoomlar.find(z => z.ID === o1.zoomId)?.Ad || 'Zoom';
          list.push({
            id1: o1.id,
            id2: o2.id,
            type: 'zoom',
            message: `${GUNLER[gunIdx]} günü saat ${timeStr}'de ${s1Name} sınıfındaki "${o1.dersAdi}" dersi ile ${s2Name} sınıfındaki "${o2.dersAdi}" dersi için ${zName} hesabı çakışıyor.`,
            slot: overlappingSlot
          });
        }
        else if (o1.subeId && o2.subeId && o1.subeId === o2.subeId) {
          list.push({
            id1: o1.id,
            id2: o2.id,
            type: 'sube',
            message: `${GUNLER[gunIdx]} günü saat ${timeStr}'de ${s1Name} sınıfında dersler çakışıyor ("${o1.dersAdi}" ve "${o2.dersAdi}").`,
            slot: overlappingSlot
          });
        }
      }
    }
  }
  return list;
};
