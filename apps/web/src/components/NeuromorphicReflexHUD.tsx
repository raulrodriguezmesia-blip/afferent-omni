import { useEffect, useState } from 'react';
import { type NeuromorphicReflex } from '../types/afferent';

interface Props {
  reflex: NeuromorphicReflex | null | undefined;
}

export default function NeuromorphicReflexHUD({ reflex }: Props) {
  const [log, setLog] = useState<string[]>([]);
  useEffect(() => {
    if (!reflex) return;
    const entry = reflex.reflex_override_engaged
      ? `[${new Date().toLocaleTimeString()}] NEUROMORPHIC_INTERCEPT: micro-lock override engaged`
      : reflex.slip_detected
      ? `[${new Date().toLocaleTimeString()}] SLIP DETECTED: corrective force applied`
      : `[${new Date().toLocaleTimeString()}] Edge latency ${reflex.edge_latency_ms} ms • nominal`;
    setLog((prev) => [entry, ...prev].slice(0, 6));
  }, [reflex]);

  const intercept = reflex?.reflex_override_engaged;
  const slip = reflex?.slip_detected;

  return (
    <div className="panel">
      <h3>Neuromorphic Reflex HUD • Edge Computing</h3>
      <div className="row">
        <span>Edge Latency</span>
        <strong style={{ color: 'var(--accent)' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--safe)', marginRight: 6, animation: 'pulse 1.2s infinite' }} />
          {reflex ? `${reflex.edge_latency_ms} ms` : '—'}
        </strong>
      </div>
      <div className="row">
        <span>Slip Intercept</span>
        <span className={`badge ${intercept ? 'bad' : slip ? 'warn' : 'ok'}`} style={intercept ? { boxShadow: '0 0 16px #ff00ff', background: 'rgba(255,0,255,0.2)', color: '#ff00ff' } : {}}>
          {intercept ? 'NEUROMORPHIC_INTERCEPT_TRIGGERED' : slip ? 'SLIP_DETECTED' : 'SAFE'}
        </span>
      </div>
      <div className="row">
        <span>Reflex Override</span>
        <strong>{reflex ? (reflex.reflex_override_engaged ? 'ENGAGED' : 'STANDBY') : '—'}</strong>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Event Log Ticker</div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text)', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 8, minHeight: 90 }}>
          {log.map((l, i) => <div key={i} style={{ opacity: 1 - i * 0.12 }}>{l}</div>)}
          {log.length === 0 && <div style={{ color: 'var(--sub)' }}>Awaiting telemetry…</div>}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
