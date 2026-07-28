import { BookOpen } from 'lucide-react';
import { Hoca, Sube, Zoom } from '../../bindings/changeme/internal/domain/models';

interface TakvimFilterBarProps {
  filterType: 'sube' | 'hoca' | 'zoom' | 'ders';
  setFilterType: (val: 'sube' | 'hoca' | 'zoom' | 'ders') => void;
  subeler: Sube[];
  seciliSubeId: number | null;
  setSeciliSubeId: (val: number | null) => void;
  hocalar: Hoca[];
  seciliHocaId: number | null;
  setSeciliHocaId: (val: number | null) => void;
  zoomlar: Zoom[];
  seciliZoomId: number | null;
  setSeciliZoomId: (val: number | null) => void;
  aramaDersAdi: string;
  setAramaDersAdi: (val: string) => void;
}

export function TakvimFilterBar({
  filterType, setFilterType,
  subeler, seciliSubeId, setSeciliSubeId,
  hocalar, seciliHocaId, setSeciliHocaId,
  zoomlar, seciliZoomId, setSeciliZoomId,
  aramaDersAdi, setAramaDersAdi
}: TakvimFilterBarProps) {
  return (
    <div className="sube-secici-bar" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={16} style={{ color: '#4c7ef3' }} />
        <span className="sube-secici-label">Filtreleme Türü:</span>
        <select 
          className="sube-secici-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="sube">Sınıf / Şube</option>
          <option value="hoca">Öğretmen</option>
          <option value="zoom">Zoom Hesabı</option>
        </select>
      </div>

      {filterType === 'sube' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sube-secici-label">Gösterilen Sınıf:</span>
          <select 
            className="sube-secici-select"
            value={seciliSubeId || ''}
            onChange={(e) => setSeciliSubeId(Number(e.target.value))}
          >
            {subeler.map(s => (
              <option key={s.ID} value={s.ID}>{s.Ad}</option>
            ))}
          </select>
          {subeler.length === 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Lütfen önce veri yönetiminden bir şube oluşturun!</span>}
        </div>
      )}

      {filterType === 'hoca' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sube-secici-label">Gösterilen Öğretmen:</span>
          <select 
            className="sube-secici-select"
            value={seciliHocaId || ''}
            onChange={(e) => setSeciliHocaId(Number(e.target.value))}
          >
            {hocalar.map(h => (
              <option key={h.ID} value={h.ID}>{h.Ad}</option>
            ))}
          </select>
          {hocalar.length === 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Lütfen önce veri yönetiminden bir öğretmen oluşturun!</span>}
        </div>
      )}

      {filterType === 'zoom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="sube-secici-label">Gösterilen Zoom Hesabı:</span>
          <select 
            className="sube-secici-select"
            value={seciliZoomId || ''}
            onChange={(e) => setSeciliZoomId(Number(e.target.value))}
          >
            {zoomlar.map(z => (
              <option key={z.ID} value={z.ID}>{z.Ad}</option>
            ))}
          </select>
          {zoomlar.length === 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Lütfen önce veri yönetiminden bir Zoom odası oluşturun!</span>}
        </div>
      )}

    </div>
  );
}
