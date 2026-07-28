import React from 'react';
import { Users, BookOpen, Video, Layers, AlertCircle } from 'lucide-react';
import { Hoca, Sube, Zoom, ToplantiTuru } from '../../bindings/changeme/internal/domain/models';
import { ProgramOturumu } from '../../bindings/changeme/models';
import { getSlotTimeRange } from '../utils/conflict';

interface TakvimOturumCardProps {
  o: ProgramOturumu;
  hocalar: Hoca[];
  subeler: Sube[];
  zoomlar: Zoom[];
  toplantiTurleri: ToplantiTuru[];
  isConflicting: boolean;
  isBeingDragged: boolean;
  isBeingResized: boolean;
  dragStateHoverSaat: number | null;
  resizeStateCurrentDuration: number;
  handleCardMouseDown: (e: React.MouseEvent, o: ProgramOturumu) => void;
  handleCardClick: (e: React.MouseEvent, o: ProgramOturumu) => void;
  handleResizeMouseDown: (e: React.MouseEvent, o: ProgramOturumu) => void;
}

const GUNLUK_DERS = 64;

const getCardTheme = (name: string) => {
  const distinctThemes = [
    { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd', accent: '#0ea5e9' }, // Light Blue
    { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', accent: '#f43f5e' }, // Rose/Red
    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', accent: '#22c55e' }, // Green
    { bg: '#fffbeb', text: '#b45309', border: '#fef3c7', accent: '#f59e0b' }, // Amber/Yellow
    { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', accent: '#8b5cf6' }, // Violet
    { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', accent: '#f97316' }, // Orange
    { bg: '#f0fdfa', text: '#0f766e', border: '#ccfbf1', accent: '#14b8a6' }, // Teal
    { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8', accent: '#ec4899' }, // Pink
    { bg: '#f8fafc', text: '#334155', border: '#cbd5e1', accent: '#64748b' }, // Slate/Gray
    { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc', accent: '#06b6d4' }, // Cyan
    { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', accent: '#ef4444' }, // Red (alternative)
    { bg: '#f7fee7', text: '#4d7c0f', border: '#d9f99d', accent: '#84cc16' }, // Lime
    { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff', accent: '#a855f7' }, // Purple
    { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe', accent: '#6366f1' }, // Indigo
    { bg: '#fdf4ff', text: '#a21caf', border: '#f5d0fe', accent: '#d946ef' }, // Fuchsia
    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', accent: '#3b82f6' }, // Blue
    { bg: '#fffce8', text: '#a16207', border: '#fef08a', accent: '#eab308' }, // Yellow
    { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', accent: '#10b981' }, // Emerald
  ];

  // Hardcode common subjects to ensure they never collide and always look distinct
  const commonMap: { [key: string]: number } = {
    'matematik': 0, // Light Blue
    'math': 0,
    'fizik': 5,     // Orange
    'physics': 5,
    'kimya': 12,    // Purple
    'chemistry': 12,
    'biyoloji': 2,  // Green
    'biology': 2,
    'tarih': 3,     // Amber
    'history': 3,
    'coğrafya': 6,  // Teal
    'geography': 6,
    'edebiyat': 1,  // Rose
    'türkçe': 1,
    'ingilizce': 13, // Indigo
    'english': 13,
    'felsefe': 8,   // Slate
    'beden': 11,    // Lime
    'müzik': 14,    // Fuchsia
    'görsel': 7,    // Pink
    'din': 9,       // Cyan
  };

  const normalized = name.toLowerCase().trim();
  if (commonMap[normalized] !== undefined) {
    return distinctThemes[commonMap[normalized]];
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % distinctThemes.length;
  return distinctThemes[index];
};

export function TakvimOturumCard({
  o, hocalar, subeler, zoomlar, toplantiTurleri,
  isConflicting, isBeingDragged, isBeingResized,
  dragStateHoverSaat, resizeStateCurrentDuration,
  handleCardMouseDown, handleCardClick, handleResizeMouseDown
}: TakvimOturumCardProps) {
  const startSaat = isBeingDragged && dragStateHoverSaat !== null ? dragStateHoverSaat : o.startSlot % GUNLUK_DERS;
  const currentDuration = isBeingResized ? resizeStateCurrentDuration : o.duration;

  // CSS Pozisyon Hesapları
  const top = `calc(var(--slot-size) * ${startSaat} + 4px)`;
  const height = `calc(var(--slot-size) * ${currentDuration} - 8px)`;
  const theme = getCardTheme(o.dersAdi);

  const getHocaName = (id: number) => hocalar.find(h => h.ID === id)?.Ad || '';
  const getZoomName = (id: number) => zoomlar.find(z => z.ID === id)?.Ad || '';
  const getTurName = (id: number) => toplantiTurleri.find(t => t.ID === id)?.Ad || '';

  // Sürükleme anındaki stil
  const dragStyle: React.CSSProperties = isBeingDragged ? {
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    opacity: 0.9,
  } : {};

  return (
    <div
      className={`oturum-kart ${isBeingDragged ? 'dragging' : ''} ${isConflicting ? 'cakisma' : ''} ${currentDuration <= 4 ? 'kisa-kart' : ''} ${currentDuration <= 2 ? 'cok-kisa-kart' : ''}`}
      style={{
        top: top,
        height: height,
        backgroundColor: isConflicting ? '#fef2f2' : theme.bg,
        borderColor: isConflicting ? '#fca5a5' : theme.border,
        ...dragStyle
      }}
      onMouseDown={(e) => handleCardMouseDown(e, o)}
      onClick={(e) => handleCardClick(e, o)}
    >
      <div 
        className="oturum-kart-accent" 
        style={{ backgroundColor: isConflicting ? '#ef4444' : theme.accent }} 
      />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
        <span className="oturum-ders" style={{ color: isConflicting ? '#991b1b' : theme.text }}>
          {o.dersAdi}
        </span>
        {isConflicting && (
          <span style={{ display: 'inline-flex', flexShrink: 0 }} title="Çakışma var!">
            <AlertCircle size={14} style={{ color: '#ef4444' }} />
          </span>
        )}
      </div>

      {/* Kart detaylarını göster */}
      <div className="oturum-detaylar">
        <span className="oturum-detay-satir" style={{ fontWeight: 700, fontSize: '11px', color: isConflicting ? '#b91c1c' : theme.text, opacity: 0.9 }}>
          {getSlotTimeRange(o.startSlot, currentDuration)}
        </span>
        {o.subeId > 0 && (
          <span className="oturum-detay-satir" style={{ fontWeight: 700 }}>
            <BookOpen size={10} style={{ opacity: 0.7 }} /> {subeler.find(s => s.ID === o.subeId)?.Ad || ''}
          </span>
        )}
        {o.hocaId > 0 && (
          <span className="oturum-detay-satir">
            <Users size={10} style={{ opacity: 0.7 }} /> {getHocaName(o.hocaId)}
          </span>
        )}
        {o.zoomId > 0 && (
          <span className="oturum-detay-satir">
            <Video size={10} style={{ opacity: 0.7 }} /> {getZoomName(o.zoomId)}
          </span>
        )}
        {o.turId > 0 && (
          <span className="oturum-detay-satir">
            <Layers size={10} style={{ opacity: 0.7 }} /> {getTurName(o.turId)}
          </span>
        )}
      </div>

      {/* Yeniden Boyutlandırma Kulpu */}
      <div 
        className="kart-resize-kulp"
        onMouseDown={(e) => handleResizeMouseDown(e, o)}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
