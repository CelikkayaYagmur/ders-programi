import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2 } from 'lucide-react';
import { Hoca, Sube, Zoom, ToplantiTuru, Ders } from '../../bindings/changeme/internal/domain/models';
import { HocaDers } from '../../bindings/changeme/models';

interface TakvimModalProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  mode: 'add' | 'edit';
  handleSave: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  
  dersAdi: string;
  setDersAdi: (val: string) => void;
  hocaId: number;
  setHocaId: (val: number) => void;
  subeId: number;
  setSubeId: (val: number) => void;
  zoomId: number;
  setZoomId: (val: number) => void;
  turId: number;
  setTurId: (val: number) => void;
  
  hocalar: Hoca[];
  subeler: Sube[];
  zoomlar: Zoom[];
  toplantiTurleri: ToplantiTuru[];
  dersler: Ders[];
  hocaDersler: HocaDers[];
}

export function TakvimModal({
  isOpen, setIsOpen, mode, handleSave, handleDelete,
  dersAdi, setDersAdi, hocaId, setHocaId, subeId, setSubeId,
  zoomId, setZoomId, turId, setTurId,
  hocalar, subeler, zoomlar, toplantiTurleri, dersler, hocaDersler
}: TakvimModalProps) {
  const overlayMouseDownRef = useRef(false);

  const filteredHocalar = React.useMemo(() => {
    if (!dersAdi) return hocalar;

    const assignedTeacherIds = hocaDersler
      .filter(hd => hd.dersAdi === dersAdi)
      .map(hd => hd.hocaId);

    const allAssignedTeacherIds = new Set(hocaDersler.map(hd => hd.hocaId));
    
    return hocalar.filter(h => 
      assignedTeacherIds.includes(h.ID) || !allAssignedTeacherIds.has(h.ID)
    );
  }, [hocalar, hocaDersler, dersAdi]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="takvim-modal-overlay" 
      onMouseDown={(e) => {
        overlayMouseDownRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && overlayMouseDownRef.current) {
          setIsOpen(false);
        }
      }}
    >
      <div className="takvim-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-baslik">
          <span>{mode === 'add' ? 'Yeni Ders Ekle' : 'Dersi Düzenle'}</span>
          <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSave}>
          <div className="modal-form-grup">
            <label>Ders (Branş)</label>
            <select 
              className="modal-select"
              required
              value={dersAdi}
              onChange={(e) => setDersAdi(e.target.value)}
            >
              <option value="" disabled>Ders Seçiniz</option>
              {dersler.map(d => (
                <option key={d.ID} value={d.Ad}>{d.Ad}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-grup">
            <label>Sınıf / Şube</label>
            <select 
              className="modal-select"
              value={subeId}
              onChange={(e) => setSubeId(Number(e.target.value))}
            >
              <option value={0} disabled>Seçiniz</option>
              {subeler.map(s => (
                <option key={s.ID} value={s.ID}>{s.Ad}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-grup">
            <label>Öğretmen</label>
            <select 
              className="modal-select"
              value={hocaId}
              onChange={(e) => setHocaId(Number(e.target.value))}
            >
              <option value={0}>Seçilmedi</option>
              {filteredHocalar.map(h => (
                <option key={h.ID} value={h.ID}>{h.Ad}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-grup">
            <label>Zoom Hesabı (Opsiyonel)</label>
            <select 
              className="modal-select"
              value={zoomId}
              onChange={(e) => setZoomId(Number(e.target.value))}
            >
              <option value={0}>Seçilmedi</option>
              {zoomlar.map(z => (
                <option key={z.ID} value={z.ID}>{z.Ad}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-grup">
            <label>Toplantı / Oturum Türü</label>
            <select 
              className="modal-select"
              value={turId}
              onChange={(e) => setTurId(Number(e.target.value))}
            >
              <option value={0}>Seçilmedi</option>
              {toplantiTurleri.map(t => (
                <option key={t.ID} value={t.ID}>{t.Ad}</option>
              ))}
            </select>
          </div>

          <div className="modal-butonlar">
            {mode === 'edit' && (
              <button 
                type="button" 
                className="modal-btn-sil"
                onClick={handleDelete}
              >
                <Trash2 size={14} style={{ marginRight: '4px', display: 'inline' }} /> Sil
              </button>
            )}
            
            <button 
              type="button" 
              className="modal-btn-iptal"
              onClick={() => setIsOpen(false)}
            >
              İptal
            </button>

            <button 
              type="submit" 
              className="modal-btn-kaydet"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
