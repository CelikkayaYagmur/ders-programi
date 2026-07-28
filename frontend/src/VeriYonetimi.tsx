import React, { useEffect, useState } from 'react';
import { BookOpen, Tv, Plus, Trash2, BookMarked, Calendar, Users } from 'lucide-react';
import * as VeriService from '../bindings/changeme/veriservice';
import { Hoca, Sube, Zoom, ToplantiTuru, Ders } from '../bindings/changeme/internal/domain/models';
import { HocaDers } from '../bindings/changeme/models';

interface VeriYonetimiProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export function VeriYonetimi({ onNavigate, activePage }: VeriYonetimiProps) {
  // Veri listeleri
  const [hocalar, setHocalar] = useState<Hoca[]>([]);
  const [subeler, setSubeler] = useState<Sube[]>([]);
  const [zoomlar, setZoomlar] = useState<Zoom[]>([]);
  const [toplantiTurleri, setToplantiTurleri] = useState<ToplantiTuru[]>([]);
  const [dersler, setDersler] = useState<Ders[]>([]);
  const [hocaDersler, setHocaDersler] = useState<HocaDers[]>([]);

  // Arama filtreleri
  const [hocaSearch, setHocaSearch] = useState('');
  const [subeSearch, setSubeSearch] = useState('');
  const [zoomSearch, setZoomSearch] = useState('');
  const [toplantiSearch, setToplantiSearch] = useState('');
  const [dersSearch, setDersSearch] = useState('');

  // Form input durumları
  const [newHocaName, setNewHocaName] = useState('');
  const [newHocaSelectedDers, setNewHocaSelectedDers] = useState('');
  const [newSubeName, setNewSubeName] = useState('');
  const [newZoomName, setNewZoomName] = useState('');
  const [newToplantiName, setNewToplantiName] = useState('');
  const [newDersName, setNewDersName] = useState('');

  // Verileri Go backend servisinden yükle
  const loadData = async () => {
    try {
      const hList = await VeriService.HocaListele();
      const sList = await VeriService.SubeListele();
      const zList = await VeriService.ZoomListele();
      const tList = await VeriService.ToplantiTuruListele();
      const dList = await VeriService.DersListele();
      const hdList = await VeriService.HocaDersListele();
      setHocalar(hList || []);
      setSubeler(sList || []);
      setZoomlar(zList || []);
      setToplantiTurleri(tList || []);
      setDersler(dList || []);
      setHocaDersler(hdList || []);
    } catch (e) {
      console.error('Veriler yüklenirken hata oluştu:', e);
    }
  };

  useEffect(() => {
    if (activePage === 'data') {
      loadData();
    }
  }, [activePage]);

  // CRUD Eylemleri
  const handleAddHoca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHocaName.trim()) return;
    try {
      const hoca = await VeriService.HocaEkle(newHocaName.trim());
      // Bindings use uppercase for struct fields unless tagged otherwise. domain.Hoca has ID field.
      const hocaId = (hoca as any).ID || (hoca as any).id || 0;
      if (newHocaSelectedDers && hocaId) {
        await VeriService.HocaDersEkle(hocaId, newHocaSelectedDers);
      }
      setNewHocaName('');
      setNewHocaSelectedDers('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHoca = async (id: number) => {
    try {
      await VeriService.HocaSil(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubeName.trim()) return;
    try {
      await VeriService.SubeEkle(newSubeName.trim());
      setNewSubeName('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSube = async (id: number) => {
    try {
      await VeriService.SubeSil(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddZoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoomName.trim()) return;
    try {
      await VeriService.ZoomEkle(newZoomName.trim(), '');
      setNewZoomName('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteZoom = async (id: number) => {
    try {
      await VeriService.ZoomSil(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToplanti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToplantiName.trim()) return;
    try {
      await VeriService.ToplantiTuruEkle(newToplantiName.trim());
      setNewToplantiName('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteToplanti = async (id: number) => {
    try {
      await VeriService.ToplantiTuruSil(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDersName.trim()) return;
    try {
      await VeriService.DersEkle(newDersName.trim());
      setNewDersName('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDers = async (id: number) => {
    try {
      await VeriService.DersSil(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHocaDers = async (id: number) => {
    try {
      await VeriService.HocaDersSil(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-section" style={{ background: '#f4f6fb' }}>
      <header className="page-header">
        <div className="header-left">

          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Öğretmen, ders, şube, Zoom odası ve toplantı türü tanımlarını girin.
          </span>
        </div>

        <div className="header-right" style={{ display: 'flex', gap: '10px' }}>
        </div>
      </header>

      <div className="data-workspace" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>

        {/* Column 0: Dersler (Branşlar) */}
        <div className="data-card-column">
          <div className="column-header">
            <span className="column-title"><BookMarked size={16} /> Dersler</span>
            <span className="column-count">{dersler.length}</span>
          </div>
          <form onSubmit={handleAddDers} className="data-form">
            <input
              type="text"
              placeholder="Ders Adı (örn: Matematik)"
              className="text-input"
              value={newDersName}
              onChange={(e) => setNewDersName(e.target.value)}
            />
            <button type="submit" className="primary-btn">
              <Plus size={14} /> Ekle
            </button>
          </form>
          <input
            type="text"
            placeholder="Ders ara..."
            className="column-search-input"
            value={dersSearch}
            onChange={(e) => setDersSearch(e.target.value)}
          />
          <div className="column-item-list">
            {dersler
              .filter(d => d.Ad.toLowerCase().includes(dersSearch.toLowerCase()))
              .map(d => (
                <div key={d.ID} className="list-item">
                  <span className="item-name">{d.Ad}</span>
                  <button className="delete-btn" onClick={() => handleDeleteDers(d.ID)} title="Sil">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Column 1: Teachers */}
        <div className="data-card-column">
          <div className="column-header">
            <span className="column-title"><Users size={16} /> Öğretmenler</span>
            <span className="column-count">{hocalar.length}</span>
          </div>
          <form onSubmit={handleAddHoca} className="data-form" style={{ flexDirection: 'column' }}>
            <input
              type="text"
              placeholder="Öğretmen Adı"
              className="text-input"
              value={newHocaName}
              onChange={(e) => setNewHocaName(e.target.value)}
            />
            <select className="text-input" value={newHocaSelectedDers} onChange={e => setNewHocaSelectedDers(e.target.value)}>
              <option value="">Branş/Ders (Opsiyonel)...</option>
              {dersler.map(d => <option key={d.ID} value={d.Ad}>{d.Ad}</option>)}
            </select>
            <button type="submit" className="primary-btn">
              <Plus size={14} /> Ekle
            </button>
          </form>
          <input
            type="text"
            placeholder="Öğretmen ara..."
            className="column-search-input"
            value={hocaSearch}
            onChange={(e) => setHocaSearch(e.target.value)}
          />
          <div className="column-item-list">
            {hocalar
              .filter(h => h.Ad.toLowerCase().includes(hocaSearch.toLowerCase()))
              .map(h => (
                <div key={h.ID} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span className="item-name">{h.Ad}</span>
                    <button className="delete-btn" onClick={() => handleDeleteHoca(h.ID)} title="Sil">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'gray', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {hocaDersler.filter(hd => hd.hocaId === h.ID).map(hd => (
                      <span key={hd.id} style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {hd.dersAdi}
                        <Trash2 size={10} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDeleteHocaDers(hd.id)} />
                      </span>
                    ))}
                    <select
                      className="text-input"
                      style={{ fontSize: '0.7rem', padding: '2px 4px', border: '1px dashed #ccc', borderRadius: '4px', outline: 'none', cursor: 'pointer', width: 'auto' }}
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          VeriService.HocaDersEkle(h.ID, e.target.value).then(loadData);
                        }
                      }}
                    >
                      <option value="">+ Branş Ekle</option>
                      {dersler.map(d => <option key={d.ID} value={d.Ad}>{d.Ad}</option>)}
                    </select>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Column 2: Sections/Classes */}
        <div className="data-card-column">
          <div className="column-header">
            <span className="column-title"><BookOpen size={16} /> Şubeler</span>
            <span className="column-count">{subeler.length}</span>
          </div>
          <form onSubmit={handleAddSube} className="data-form">
            <input
              type="text"
              placeholder="Şube Adı (örn: 9-A)"
              className="text-input"
              value={newSubeName}
              onChange={(e) => setNewSubeName(e.target.value)}
            />
            <button type="submit" className="primary-btn">
              <Plus size={14} /> Ekle
            </button>
          </form>
          <input
            type="text"
            placeholder="Şube ara..."
            className="column-search-input"
            value={subeSearch}
            onChange={(e) => setSubeSearch(e.target.value)}
          />
          <div className="column-item-list">
            {subeler
              .filter(s => s.Ad.toLowerCase().includes(subeSearch.toLowerCase()))
              .map(s => (
                <div key={s.ID} className="list-item">
                  <span className="item-name">{s.Ad}</span>
                  <button className="delete-btn" onClick={() => handleDeleteSube(s.ID)} title="Sil">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Column 3: Zoom Rooms */}
        <div className="data-card-column">
          <div className="column-header">
            <span className="column-title"><Tv size={16} /> Zoom Adresleri</span>
            <span className="column-count">{zoomlar.length}</span>
          </div>
          <form onSubmit={handleAddZoom} className="data-form">
            <input
              type="text"
              placeholder="Hesap Adı (örn: Zoom-1)"
              className="text-input"
              value={newZoomName}
              onChange={(e) => setNewZoomName(e.target.value)}
            />
            <button type="submit" className="primary-btn">
              <Plus size={14} /> Ekle
            </button>
          </form>
          <input
            type="text"
            placeholder="Zoom ara..."
            className="column-search-input"
            value={zoomSearch}
            onChange={(e) => setZoomSearch(e.target.value)}
          />
          <div className="column-item-list">
            {zoomlar
              .filter(z => z.Ad.toLowerCase().includes(zoomSearch.toLowerCase()))
              .map(z => (
                <div key={z.ID} className="list-item">
                  <div style={{ overflow: 'hidden' }}>
                    <div className="item-name">{z.Ad}</div>
                  </div>
                  <button className="delete-btn" onClick={() => handleDeleteZoom(z.ID)} title="Sil">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Column 4: Meeting/Toplantı Types */}
        <div className="data-card-column">
          <div className="column-header">
            <span className="column-title"><Calendar size={16} /> Toplantı Türleri</span>
            <span className="column-count">{toplantiTurleri.length}</span>
          </div>
          <form onSubmit={handleAddToplanti} className="data-form">
            <input
              type="text"
              placeholder="Tür Adı (örn: Veli)"
              className="text-input"
              value={newToplantiName}
              onChange={(e) => setNewToplantiName(e.target.value)}
            />
            <button type="submit" className="primary-btn">
              <Plus size={14} /> Ekle
            </button>
          </form>
          <input
            type="text"
            placeholder="Tür ara..."
            className="column-search-input"
            value={toplantiSearch}
            onChange={(e) => setToplantiSearch(e.target.value)}
          />
          <div className="column-item-list">
            {toplantiTurleri
              .filter(t => t.Ad.toLowerCase().includes(toplantiSearch.toLowerCase()))
              .map(t => (
                <div key={t.ID} className="list-item">
                  <span className="item-name">{t.Ad}</span>
                  <button className="delete-btn" onClick={() => handleDeleteToplanti(t.ID)} title="Sil">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}
