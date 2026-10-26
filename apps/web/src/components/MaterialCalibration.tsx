import React, { useState } from 'react';

interface MaterialCalibrationProps {
  apiBase: string;
  objectLabel: string;
  onCalibrated?: (result: any) => void;
}

export const MaterialCalibration: React.FC<MaterialCalibrationProps> = ({ apiBase, objectLabel, onCalibrated }) => {
  const [probes, setProbes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runCalibration = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/v1/calibrate-material`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ object_label: objectLabel, probe_count: probes }),
      });
      const data = await res.json();
      setResult(data);
      if (onCalibrated) onCalibrated(data);
    } catch (e: any) {
      setError(e.message || 'Calibration failed');
    } finally {
      setLoading(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        Material Calibration • Bayesian Probe
      </h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>Probes:</span>
        <input
          type="range" min={3} max={10} value={probes}
          onChange={(e) => setProbes(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#8b5cf6' }}
        />
        <span style={{ fontSize: 11, color: '#e5e7eb', minWidth: 20 }}>{probes}</span>
        <button
          onClick={runCalibration}
          disabled={loading}
          style={{
            background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(90deg,#8b5cf6,#a855f7)',
            border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: 11,
          }}
        >
          {loading ? 'Calibrating...' : 'Run Calibration'}
        </button>
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: 11, marginBottom: 8 }}>{error}</div>}
      {result && (
        <div style={{ fontSize: 11, color: '#d1d5db', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10 }}>
          <div style={{ marginBottom: 6, color: '#c4b5fd', fontWeight: 600 }}>
            Status: {result.status} • Confidence: {(result.confidence * 100).toFixed(1)}%
          </div>
          <div>Elastic Modulus: <strong>{result.calibrated.elastic_modulus_gpa} GPa</strong></div>
          <div>Static Friction: <strong>{result.calibrated.static_friction_coeff}</strong></div>
          <div>Shear Limit: <strong>{result.calibrated.shear_limit_n} N</strong></div>
          <div style={{ marginTop: 6, color: '#9ca3af' }}>Probes executed: {result.probe_count}</div>
        </div>
      )}
    </div>
  );
};
