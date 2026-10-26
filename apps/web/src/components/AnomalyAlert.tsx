import React, { useState, useEffect } from 'react';

interface AnomalyAlertProps {
  apiBase: string;
  context: any;
}

export const AnomalyAlert: React.FC<AnomalyAlertProps> = ({ apiBase, context }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    try {
      const frames = context?.streamFrames || [];
      const res = await fetch(`${apiBase}/api/v1/anomaly-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames }),
      });
      setResult(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(check, 10000);
    check();
    return () => clearInterval(interval);
  }, []);

  const riskColor = (r: string) => r === 'high' ? '#ef4444' : r === 'medium' ? '#f59e0b' : '#10b981';

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        Anomaly Detection • Predictive Maintenance
      </h3>
      <button
        onClick={check}
        disabled={loading}
        style={{
          background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(90deg,#8b5cf6,#a855f7)',
          border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: 11, marginBottom: 12,
        }}
      >
        {loading ? 'Checking...' : 'Run Anomaly Check'}
      </button>
      {result && (
        <div>
          <div style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 999, marginBottom: 8,
            background: `${riskColor(result.risk_level)}20`, color: riskColor(result.risk_level),
            fontWeight: 600, fontSize: 11, border: `1px solid ${riskColor(result.risk_level)}40`,
          }}>
            Risk: {result.risk_level.toUpperCase()} • {result.anomaly_count} anomalies
          </div>
          <div style={{ fontSize: 11, color: '#d1d5db', marginBottom: 8 }}>{result.summary}</div>
          {result.anomalies.map((a: any, i: number) => (
            <div key={i} style={{ fontSize: 10, color: '#9ca3af', padding: '4px 0', borderBottom: '1px solid rgba(36,36,47,0.5)' }}>
              [{a.severity.toUpperCase()}] {a.type} {a.value !== undefined ? `— ${a.value}` : ''}
            </div>
          ))}
          {result.anomalies.length === 0 && (
            <div style={{ fontSize: 10, color: '#10b981' }}>All systems nominal. No degradation detected.</div>
          )}
        </div>
      )}
    </div>
  );
};
