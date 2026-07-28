import { useState } from 'react';
import { Takvim } from './Takvim';
import { VeriYonetimi } from './VeriYonetimi';
import { DersAtamalari } from './DersAtamalari';

export default function App() {
  const [activePage, setActivePage] = useState<'calendar' | 'data' | 'assignments'>('calendar');



  return (
    <div className="viewport-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header className="global-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        gap: '20px',
        flexShrink: 0,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        
        <nav style={{ display: 'flex', gap: '30px', height: '100%' }}>
          <button
            className={`nav-btn ${activePage === 'calendar' ? 'active' : ''}`}
            onClick={() => setActivePage('calendar')}
            style={{
              padding: '0 10px',
              border: 'none',
              borderBottom: activePage === 'calendar' ? '3px solid #3b82f6' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activePage === 'calendar' ? '#3b82f6' : '#4b5563',
              cursor: 'pointer',
              fontWeight: activePage === 'calendar' ? '600' : '500',
              transition: 'all 0.2s ease',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: '15px'
            }}
          >
            Ders Programı
          </button>

          <button
            className={`nav-btn ${activePage === 'data' ? 'active' : ''}`}
            onClick={() => setActivePage('data')}
            style={{
              padding: '0 10px',
              border: 'none',
              borderBottom: activePage === 'data' ? '3px solid #3b82f6' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activePage === 'data' ? '#3b82f6' : '#4b5563',
              cursor: 'pointer',
              fontWeight: activePage === 'data' ? '600' : '500',
              transition: 'all 0.2s ease',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: '15px'
            }}
          >
            Tanımlamalar
          </button>

          <button
            className={`nav-btn ${activePage === 'assignments' ? 'active' : ''}`}
            onClick={() => setActivePage('assignments')}
            style={{
              padding: '0 10px',
              border: 'none',
              borderBottom: activePage === 'assignments' ? '3px solid #3b82f6' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activePage === 'assignments' ? '#3b82f6' : '#4b5563',
              cursor: 'pointer',
              fontWeight: activePage === 'assignments' ? '600' : '500',
              transition: 'all 0.2s ease',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: '15px'
            }}
          >
            Ders Atamaları
          </button>
        </nav>
      </header>

      <main style={{ flex: 1, overflowY: activePage === 'calendar' ? 'hidden' : 'auto', position: 'relative' }}>
        {activePage === 'calendar' && <Takvim onNavigate={(page) => setActivePage(page as any)} activePage={activePage as any} />}
        {activePage === 'data' && <VeriYonetimi onNavigate={(page) => setActivePage(page as any)} activePage={activePage as any} />}
        {activePage === 'assignments' && <DersAtamalari onNavigate={(page) => setActivePage(page as any)} activePage={activePage as any} />}
      </main>
    </div>
  );
}

