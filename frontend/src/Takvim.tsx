import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as VeriService from '../bindings/changeme/veriservice';
import { Hoca, Sube, Zoom, ToplantiTuru, Ders } from '../bindings/changeme/internal/domain/models';
import { ProgramOturumu } from '../bindings/changeme/models';
import { AlertTriangle, Printer, X } from 'lucide-react';
import { TakvimFilterBar } from './components/TakvimFilterBar';
import { TakvimModal } from './components/TakvimModal';
import { TakvimOturumCard } from './components/TakvimOturumCard';
import { GUNLER, GUNLUK_DERS, checkSingleConflict, calculateAllConflicts } from './utils/conflict';
import './takvim.css';

const SAATLER = [
  { label: '07:00' }, { label: '08:00' }, { label: '09:00' }, { label: '10:00' },
  { label: '11:00' }, { label: '12:00' }, { label: '13:00' }, { label: '14:00' },
  { label: '15:00' }, { label: '16:00' }, { label: '17:00' }, { label: '18:00' },
  { label: '19:00' }, { label: '20:00' }, { label: '21:00' }, { label: '22:00' },
];

interface TakvimProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

interface DragState {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hoverDay: number | null;
  hoverSaat: number | null;
  duration: number;
  clickOffsetY: number;
}

interface ResizeState {
  id: number;
  startSlot: number;
  initialDuration: number;
  startY: number;
  currentDuration: number;
}

export function Takvim({ onNavigate, activePage }: TakvimProps) {
  const wasDraggedRef = useRef(false);

  // Veri durumları
  const [hocalar, setHocalar] = useState<Hoca[]>([]);
  const [subeler, setSubeler] = useState<Sube[]>([]);
  const [zoomlar, setZoomlar] = useState<Zoom[]>([]);
  const [toplantiTurleri, setToplantiTurleri] = useState<ToplantiTuru[]>([]);
  const [dersler, setDersler] = useState<Ders[]>([]);
  const [oturumlar, setOturumlar] = useState<ProgramOturumu[]>([]);
  const [hocaDersler, setHocaDersler] = useState<any[]>([]);

  // Arayüz filtreleri
  const [filterType, setFilterType] = useState<'sube' | 'hoca' | 'zoom' | 'ders'>('sube');
  const [seciliSubeId, setSeciliSubeId] = useState<number | null>(null);
  const [seciliHocaId, setSeciliHocaId] = useState<number | null>(null);
  const [seciliZoomId, setSeciliZoomId] = useState<number | null>(null);
  const [aramaDersAdi, setAramaDersAdi] = useState<string>('');

  // Sürükle ve Yeniden Boyutlandır durumları
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

  // Modal Durumları
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingOturumId, setEditingOturumId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);

  const [dersAdi, setDersAdi] = useState('');
  const [hocaId, setHocaId] = useState<number>(0);
  const [modalSubeId, setModalSubeId] = useState<number>(0);
  const [zoomId, setZoomId] = useState<number>(0);
  const [turId, setTurId] = useState<number>(0);
  const [duration, setDuration] = useState<number>(4);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      const hList = await VeriService.HocaListele();
      const sList = await VeriService.SubeListele();
      const zList = await VeriService.ZoomListele();
      const tList = await VeriService.ToplantiTuruListele();
      const dList = await VeriService.DersListele();
      const oList = await VeriService.ProgramOturumListele();
      const hdList = await VeriService.HocaDersListele();

      setHocalar(hList || []);
      setSubeler(sList || []);
      setZoomlar(zList || []);
      setToplantiTurleri(tList || []);
      setDersler(dList || []);
      setOturumlar(oList || []);
      setHocaDersler(hdList || []);

      if (sList && sList.length > 0) {
        if (seciliSubeId === null || !sList.some(s => s.ID === seciliSubeId)) setSeciliSubeId(sList[0].ID);
      } else setSeciliSubeId(null);

      if (hList && hList.length > 0) {
        if (seciliHocaId === null || !hList.some(h => h.ID === seciliHocaId)) setSeciliHocaId(hList[0].ID);
      } else setSeciliHocaId(null);

      if (zList && zList.length > 0) {
        if (seciliZoomId === null || !zList.some(z => z.ID === seciliZoomId)) setSeciliZoomId(zList[0].ID);
      } else setSeciliZoomId(null);
    } catch (e) {
      console.error('Veriler yüklenirken hata oluştu:', e);
    }
  };

  useEffect(() => {
    if (activePage === 'calendar') loadAllData();
  }, [activePage]);

  // Sürükleme ve Boyutlandırma takibi
  useEffect(() => {
    if (!dragState && !resizeState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragState) {
        if (Math.abs(e.clientX - dragState.startX) > 5 || Math.abs(e.clientY - dragState.startY) > 5) {
          wasDraggedRef.current = true;
        }
        const cols = document.querySelectorAll('.takvim-gun-kolon');
        let hoverDay: number | null = dragState.hoverDay;
        let hoverSaat: number | null = dragState.hoverSaat;

        cols.forEach((col) => {
          const rect = col.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right) {
            hoverDay = parseInt(col.getAttribute('data-gun') || '0', 10);
            const relativeY = (e.clientY - dragState.clickOffsetY) - rect.top;
            let calculatedSaat = Math.round(relativeY / 72);
            if (calculatedSaat < 0) calculatedSaat = 0;
            if (calculatedSaat > GUNLUK_DERS - dragState.duration) calculatedSaat = GUNLUK_DERS - dragState.duration;
            hoverSaat = calculatedSaat;
          }
        });

        setDragState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY, hoverDay, hoverSaat } : null);
      }

      if (resizeState) {
        if (Math.abs(e.clientY - resizeState.startY) > 5) wasDraggedRef.current = true;
        const deltaY = e.clientY - resizeState.startY;
        const slotDelta = Math.round(deltaY / 72);
        const maxDuration = GUNLUK_DERS - (resizeState.startSlot % GUNLUK_DERS);
        let newDuration = resizeState.initialDuration + slotDelta;
        if (newDuration < 1) newDuration = 1;
        if (newDuration > maxDuration) newDuration = maxDuration;

        setResizeState(prev => prev ? { ...prev, currentDuration: newDuration } : null);
      }
    };

    const handleMouseUp = async () => {
      if (dragState && dragState.hoverDay !== null && dragState.hoverSaat !== null) {
        const targetSlot = dragState.hoverDay * GUNLUK_DERS + dragState.hoverSaat;
        const original = oturumlar.find(o => o.id === dragState.id);

        if (original && original.startSlot !== targetSlot) {
          const conflictMsg = checkSingleConflict(
            oturumlar, hocalar, subeler, zoomlar,
            original.id, original.hocaId, original.zoomId, original.subeId, original.dersAdi,
            targetSlot, original.duration
          );

          if (conflictMsg) {
            setToastMessage(`Çakışma Tespit Edildi!\n${conflictMsg}`);
          } else {
            try {
              await VeriService.ProgramOturumGuncelle(
                original.id, original.dersAdi, original.hocaId, original.subeId,
                original.zoomId, original.turId, targetSlot, original.duration
              );
              await loadAllData();
            } catch (err: any) {
              console.error(err);
              setToastMessage("Hata (Güncelleme): " + String(err));
            }
          }
        }
        setDragState(null);
      }

      if (resizeState) {
        const original = oturumlar.find(o => o.id === resizeState.id);
        if (original && original.duration !== resizeState.currentDuration) {
          const conflictMsg = checkSingleConflict(
            oturumlar, hocalar, subeler, zoomlar,
            original.id, original.hocaId, original.zoomId, original.subeId, original.dersAdi,
            original.startSlot, resizeState.currentDuration
          );

          if (conflictMsg) {
            setToastMessage(`Çakışma Tespit Edildi!\n${conflictMsg}`);
          } else {
            try {
              await VeriService.ProgramOturumGuncelle(
                original.id, original.dersAdi, original.hocaId, original.subeId,
                original.zoomId, original.turId, original.startSlot, resizeState.currentDuration
              );
              await loadAllData();
            } catch (err) { console.error(err); }
          }
        }
        setResizeState(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, resizeState, oturumlar, hocalar, subeler, zoomlar]);

  // Memoized active conflicts
  const activeConflicts = React.useMemo(() => {
    return calculateAllConflicts(oturumlar, hocalar, subeler, zoomlar);
  }, [oturumlar, hocalar, zoomlar, subeler]);

  const conflictingOturumIds = React.useMemo(() => {
    const set = new Set<number>();
    activeConflicts.forEach(c => { set.add(c.id1); set.add(c.id2); });
    return set;
  }, [activeConflicts]);

  const seciliOturumlar = React.useMemo(() => {
    if (filterType === 'sube') return oturumlar.filter(o => o.subeId === seciliSubeId);
    if (filterType === 'hoca') return oturumlar.filter(o => o.hocaId === seciliHocaId);
    if (filterType === 'zoom') return oturumlar.filter(o => o.zoomId === seciliZoomId);
    if (filterType === 'ders') return oturumlar.filter(o => o.dersAdi.toLowerCase().includes(aramaDersAdi.toLowerCase()));
    return oturumlar;
  }, [oturumlar, filterType, seciliSubeId, seciliHocaId, seciliZoomId, aramaDersAdi]);

  // Yazdırma (PDF) için dinamik yükseklik hesaplama (en son biten derse göre)
  const printMaxSlot = React.useMemo(() => {
    const maxEndSlot = seciliOturumlar.reduce((max, o) => {
      const end = (o.startSlot % GUNLUK_DERS) + o.duration;
      return end > max ? end : max;
    }, 0);
    // En az 16 slot (4 saat) gösterelim. Çıktıda altta biraz boşluk için +2 ekliyoruz.
    return Math.max(16, maxEndSlot + 2);
  }, [seciliOturumlar]);

  // Yazdırma (PDF) için dinamik başlangıç hesaplama (en erken başlayan derse göre)
  const printStartSlot = React.useMemo(() => {
    if (seciliOturumlar.length === 0) return 0;
    const minStart = seciliOturumlar.reduce((min, o) => {
      const start = o.startSlot % GUNLUK_DERS;
      return start < min ? start : min;
    }, GUNLUK_DERS);
    // Saatin başına yuvarla (örneğin 08:15 ise 08:00'dan başlat)
    return Math.floor(minStart / 4) * 4;
  }, [seciliOturumlar]);

  // Mouse event handlers
  const handleCardMouseDown = (e: React.MouseEvent, o: ProgramOturumu) => {
    if ((e.target as HTMLElement).closest('.kart-resize-kulp')) return;
    e.preventDefault();
    wasDraggedRef.current = false;
    const cardRect = e.currentTarget.getBoundingClientRect();
    const clickOffsetY = e.clientY - cardRect.top;

    setDragState({
      id: o.id, startX: e.clientX, startY: e.clientY,
      currentX: e.clientX, currentY: e.clientY,
      hoverDay: Math.floor(o.startSlot / GUNLUK_DERS),
      hoverSaat: o.startSlot % GUNLUK_DERS,
      duration: o.duration, clickOffsetY,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, o: ProgramOturumu) => {
    e.stopPropagation(); e.preventDefault();
    setResizeState({
      id: o.id, startSlot: o.startSlot,
      initialDuration: o.duration, startY: e.clientY,
      currentDuration: o.duration,
    });
  };

  const handleCellClick = (gunIdx: number, saatIdx: number) => {
    const slot = gunIdx * GUNLUK_DERS + saatIdx;
    setModalMode('add');
    setSelectedSlot(slot);
    setDersAdi('');
    setHocaId(filterType === 'hoca' && seciliHocaId ? seciliHocaId : 0);
    setZoomId(filterType === 'zoom' && seciliZoomId ? seciliZoomId : 0);
    setModalSubeId(seciliSubeId || (subeler[0]?.ID || 0));
    setTurId(0);
    setDuration(4);
    setModalOpen(true);
  };

  const handleCardClick = (e: React.MouseEvent, o: ProgramOturumu) => {
    e.stopPropagation();
    if (wasDraggedRef.current) { wasDraggedRef.current = false; return; }
    setModalMode('edit');
    setEditingOturumId(o.id);
    setSelectedSlot(o.startSlot);
    setDersAdi(o.dersAdi);
    setHocaId(o.hocaId);
    setModalSubeId(o.subeId);
    setZoomId(o.zoomId);
    setTurId(o.turId);
    setDuration(o.duration);
    setModalOpen(true);
  };

  const handleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dersAdi.trim() || modalSubeId === 0) {
      setToastMessage('Lütfen geçerli bir ders adı yazın ve sınıf seçin.');
      return;
    }

    const conflictMsg = checkSingleConflict(
      oturumlar, hocalar, subeler, zoomlar,
      modalMode === 'edit' ? editingOturumId : null,
      hocaId, zoomId, modalSubeId, dersAdi.trim(),
      selectedSlot, duration
    );

    if (conflictMsg) {
      setToastMessage(`Çakışma Tespit Edildi!\n${conflictMsg} Kaydedilemez.`);
      return;
    }

    try {
      if (modalMode === 'add') {
        await VeriService.ProgramOturumEkle(
          dersAdi.trim(), hocaId, modalSubeId, zoomId, turId, selectedSlot, duration
        );
      } else if (modalMode === 'edit' && editingOturumId !== null) {
        await VeriService.ProgramOturumGuncelle(
          editingOturumId, dersAdi.trim(), hocaId, modalSubeId, zoomId, turId, selectedSlot, duration
        );
      }
      setModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      setToastMessage("Hata (Kaydetme): " + String(err));
    }
  };

  const handleDelete = async () => {
    if (modalMode === 'edit' && editingOturumId !== null) {
      try {
        await VeriService.ProgramOturumSil(editingOturumId);
        setModalOpen(false);
        await loadAllData();
      } catch (err) { console.error(err); }
    }
  };

  const handleAutoGenerate = async () => {
    try {
      setToastMessage("Program oluşturuluyor, lütfen bekleyin...");
      // Let React render the toast first
      setTimeout(async () => {
        try {
          await VeriService.OtomatikOlustur();
          await loadAllData();
          setToastMessage("Program başarıyla oluşturuldu.");
        } catch (e: any) {
          setToastMessage("Oluşturma hatası: " + e);
        }
      }, 100);
    } catch (e: any) {
              setToastMessage("Hata: " + e);
    }
  };

  return (
    <div className="takvim-sayfa" style={{ 
      '--print-slots': printMaxSlot,
      '--print-start-slot': printStartSlot 
    } as React.CSSProperties}>
      <header className="takvim-baslik" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="nav-toggle-btn"
            style={{ backgroundColor: '#ffffff', color: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleAutoGenerate}
          >
            Otomatik Oluştur
          </button>
          <button
            className="nav-toggle-btn"
            style={{ backgroundColor: '#ffffff', color: '#3b82f6', borderColor: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => window.print()}
          >
            <Printer size={15} /> Yazdır
          </button>
        </div>
      </header>

      <div className="print-header" style={{ display: 'none' }}>
        <h2>Ders Programı Çizelgesi</h2>
      </div>

      <TakvimFilterBar
        filterType={filterType} setFilterType={setFilterType}
        subeler={subeler} seciliSubeId={seciliSubeId} setSeciliSubeId={setSeciliSubeId}
        hocalar={hocalar} seciliHocaId={seciliHocaId} setSeciliHocaId={setSeciliHocaId}
        zoomlar={zoomlar} seciliZoomId={seciliZoomId} setSeciliZoomId={setSeciliZoomId}
        aramaDersAdi={aramaDersAdi} setAramaDersAdi={setAramaDersAdi}
      />

      <div className="takvim-tablo">
        <div className="takvim-kose"></div>
        {GUNLER.map(g => <div key={g} className="takvim-gun-baslik">{g}</div>)}

        <div className="takvim-timeline-kolon">
          {SAATLER.map((s, idx) => (
            <div key={idx} className="takvim-saat-etiket-grubu">
              <div className="takvim-saat-etiket-sub main-saat"><span>{s.label}</span></div>
              <div className="takvim-saat-etiket-sub tick-saat"><span>-</span></div>
              <div className="takvim-saat-etiket-sub tick-saat"><span>-</span></div>
              <div className="takvim-saat-etiket-sub tick-saat"><span>-</span></div>
            </div>
          ))}
        </div>

        {GUNLER.map((g, gunIdx) => (
          <div key={gunIdx} className="takvim-gun-kolon" data-gun={gunIdx}>
            {Array.from({ length: GUNLUK_DERS }).map((_, subIdx) => {
              const quarterIdx = subIdx % 4;
              return (
                <div
                  key={subIdx}
                  className={`takvim-kolon-arka-plan-hucre-sub ${quarterIdx === 3 ? 'saat-siniri' : 'quarter-siniri'}`}
                  onClick={() => handleCellClick(gunIdx, subIdx)}
                />
              );
            })}

            {seciliOturumlar
              .filter(o => {
                if (dragState && dragState.id === o.id) return dragState.hoverDay === gunIdx;
                return Math.floor(o.startSlot / GUNLUK_DERS) === gunIdx;
              })
              .map(o => (
                <TakvimOturumCard
                  key={o.id} o={o}
                  hocalar={hocalar} subeler={subeler} zoomlar={zoomlar} toplantiTurleri={toplantiTurleri}
                  isConflicting={conflictingOturumIds.has(o.id)}
                  isBeingDragged={dragState?.id === o.id}
                  isBeingResized={resizeState?.id === o.id}
                  dragStateHoverSaat={dragState?.id === o.id && dragState ? dragState.hoverSaat : null}
                  resizeStateCurrentDuration={resizeState?.id === o.id && resizeState ? resizeState.currentDuration : 0}
                  handleCardMouseDown={handleCardMouseDown}
                  handleCardClick={handleCardClick}
                  handleResizeMouseDown={handleResizeMouseDown}
                />
              ))
            }
          </div>
        ))}
      </div>

      {activeConflicts.length > 0 && (
        <div className="cakismalar-kutusu">
          <div className="cakismalar-baslik">
            <AlertTriangle size={16} />
            Programda Çakışmalar Tespit Edildi ({activeConflicts.length})
          </div>
          <ul className="cakisma-liste">
            {activeConflicts.map((c, idx) => (
              <li key={idx} className="cakisma-madde">• {c.message}</li>
            ))}
          </ul>
        </div>
      )}

      <TakvimModal
        isOpen={modalOpen} setIsOpen={setModalOpen} mode={modalMode}
        handleSave={handleModalSave} handleDelete={handleDelete}
        dersAdi={dersAdi} setDersAdi={setDersAdi}
        hocaId={hocaId} setHocaId={setHocaId}
        subeId={modalSubeId} setSubeId={setModalSubeId}
        zoomId={zoomId} setZoomId={setZoomId}
        turId={turId} setTurId={setTurId}
        hocalar={hocalar} subeler={subeler} zoomlar={zoomlar} toplantiTurleri={toplantiTurleri} dersler={dersler} hocaDersler={hocaDersler}
      />

      {toastMessage && createPortal(
        <div className="takvim-toast">
          <span className="takvim-toast-mesaj">{toastMessage}</span>
          <button className="takvim-toast-kapat" onClick={() => setToastMessage(null)}><X size={14} /></button>
        </div>,
        document.body
      )}
    </div>
  );
}
