import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import * as VeriService from '../bindings/changeme/veriservice';
import { Sube } from '../bindings/changeme/internal/domain/models';
import { DersYuku } from '../bindings/changeme/models';

interface DersAtamalariProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export function DersAtamalari({ onNavigate, activePage }: DersAtamalariProps) {
  const [subeler, setSubeler] = useState<Sube[]>([]);
  const [dersYukleri, setDersYukleri] = useState<DersYuku[]>([]);
  const [dersler, setDersler] = useState<any[]>([]);

  // Form datası şube ID'sine göre tutuluyor
  const [formData, setFormData] = useState<{ [subeId: number]: { dersAdi: string, duration: number } }>({});

  const loadData = async () => {
    try {
      const sList = await VeriService.SubeListele();
      const dyList = await VeriService.DersYukuListele();
      const dList = await VeriService.DersListele();
      setSubeler(sList || []);
      setDersYukleri(dyList || []);
      setDersler(dList || []);
    } catch (e) {
      console.error('Veriler yüklenirken hata oluştu:', e);
    }
  };

  useEffect(() => {
    if (activePage === 'assignments') {
      loadData();
    }
  }, [activePage]);

  const handleFormChange = (subeId: number, field: 'dersAdi' | 'duration', value: any) => {
    setFormData(prev => ({
      ...prev,
      [subeId]: {
        ...(prev[subeId] || { dersAdi: '', duration: 1 }),
        [field]: value
      }
    }));
  };

  const handleAddDersYuku = async (subeId: number) => {
    const data = formData[subeId];
    if (!data || !data.dersAdi) return;

    const duration = data.duration || 1;

    try {
      await VeriService.DersYukuEkle(data.dersAdi, subeId, duration);
      // Reset form fields
      handleFormChange(subeId, 'dersAdi', '');
      handleFormChange(subeId, 'duration', 1);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDersYuku = async (id: number) => {
    try {
      await VeriService.DersYukuSil(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-section" style={{ background: '#f8fafc' }}>
      <header className="page-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="header-left">

          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Sınıfların (şubelerin) ders programı yüklerini yönetin.
          </span>
        </div>

        <div className="header-right" style={{ display: 'flex', gap: '10px' }}>
        </div>
      </header>

      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {subeler.map(sube => {
          const subeYukleri = dersYukleri.filter(dy => dy.subeId === sube.ID);
          const totalHours = subeYukleri.reduce((sum, dy) => sum + dy.duration, 0);

          return (
            <div key={sube.ID} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

              <div style={{ padding: '12px 16px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{sube.Ad}</h3>
                <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  {totalHours} Saat
                </span>
              </div>

              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', maxHeight: '400px' }}>
                {subeYukleri.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '20px 0' }}>Henüz ders atanmamış.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {subeYukleri.map(dy => {
                      return (
                        <div key={dy.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{dy.dersAdi}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{dy.duration} Saat</span>
                          </div>
                          <button onClick={() => handleDeleteDersYuku(dy.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Sil">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '8px' }}>
                <select
                  className="text-input"
                  style={{ flex: 1 }}
                  value={formData[sube.ID]?.dersAdi || ''}
                  onChange={(e) => handleFormChange(sube.ID, 'dersAdi', e.target.value)}
                >
                  <option value="">Ders Seç...</option>
                  {dersler.map(d => {
                    return <option key={d.ID} value={d.Ad}>{d.Ad}</option>;
                  })}
                </select>
                <input
                  type="number"
                  min="1" max="40"
                  className="text-input"
                  style={{ width: '60px' }}
                  placeholder="Saat"
                  value={formData[sube.ID]?.duration || 1}
                  onChange={(e) => handleFormChange(sube.ID, 'duration', Number(e.target.value))}
                />
                <button
                  className="primary-btn"
                  style={{ background: '#8b5cf6', color: '#fff' }}
                  onClick={() => handleAddDersYuku(sube.ID)}
                >
                  <Plus size={16} />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
