import React from 'react';

interface SpaceModeProps {
  active: boolean;
  onToggle: () => void;
  objectLabel: string;
}

export const SpaceMode: React.FC<SpaceModeProps> = ({ active, onToggle, objectLabel }) => {
  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', margin: 0 }}>
          Space Exploration Mode
        </h3>
        <button
          onClick={onToggle}
          style={{
            background: active ? 'linear-gradient(90deg,#10b981,#059669)' : 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '4px 12px',
            color: active ? '#fff' : '#c4b5fd', cursor: 'pointer', fontSize: 10, fontWeight: 600,
          }}
        >
          {active ? 'ACTIVE' : 'INACTIVE'}
        </button>
      </div>
      {active && (
        <div style={{ fontSize: 11, color: '#d1d5db', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10 }}>
          <div style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: 6 }}>Microgravity Simulation Active</div>
          <div>Object: {objectLabel} (Regolith Sample)</div>
          <div>Comm Delay: 2.4s (simulated Earth-Moon)</div>
          <div>Gravity: 0.16g (Lunar)</div>
          <div>Force Scaling: 0.3x (reduced grip)</div>
          <div style={{ marginTop: 6, color: '#9ca3af', fontSize: 10 }}>
            Latency compensation active. Force thresholds adjusted for microgravity.
          </div>
        </div>
      )}
      {!active && (
        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', padding: 8 }}>
          Enable for lunar/microgravity simulation parameters.
        </div>
      )}
    </div>
  );
};
