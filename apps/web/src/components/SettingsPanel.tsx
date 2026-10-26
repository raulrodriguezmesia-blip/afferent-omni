import React, { useState } from 'react';

interface SettingsPanelProps {
  apiBase: string;
  onApiBaseChange: (url: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ apiBase, onApiBaseChange }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(apiBase);
  const [uTh, setUTh] = useState(25);
  const [fMax, setFMax] = useState(1.8);

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: open ? 12 : 0 }}>
        <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', margin: 0 }}>
          Settings
        </h3>
        <button
          onClick={() => setOpen(!open)}
          style={{ background: 'transparent', border: 'none', color: '#c4b5fd', cursor: 'pointer', fontSize: 12 }}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, color: '#9ca3af', display: 'block', marginBottom: 4 }}>API Base URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => onApiBaseChange(url)}
              style={{ width: '100%', background: 'rgba(15,15,23,0.9)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '6px 10px', color: '#e5e7eb', fontSize: 11 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Default U_th (%)</label>
            <input type="range" min={5} max={90} value={uTh} onChange={(e) => setUTh(Number(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            <span style={{ fontSize: 10, color: '#c4b5fd' }}>{uTh}%</span>
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Default F_max (N)</label>
            <input type="range" min={0.5} max={5} step={0.1} value={fMax} onChange={(e) => setFMax(Number(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            <span style={{ fontSize: 10, color: '#c4b5fd' }}>{fMax.toFixed(1)} N</span>
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
            Grid: 32×32 • Stream: 50 Hz • Theme: Dark Glassmorphism
          </div>
        </div>
      )}
    </div>
  );
};
