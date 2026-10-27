import React, { useState, useEffect } from 'react';

interface NvidiaModelStatusProps {
  apiBase: string;
}

export const NvidiaModelStatus: React.FC<NvidiaModelStatusProps> = ({ apiBase }) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/model-status`);
      if (res.ok) setStatus(await res.json());
      else setStatus({ connected: false, model: 'N/A', latency_ms: 0, provider: 'Nebius Token Factory' });
    } catch {
      setStatus({ connected: false, model: 'N/A', latency_ms: 0, provider: 'Nebius Token Factory' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkStatus(); }, []);

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  const connected = status?.connected ?? false;

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        NVIDIA Model Status • Nebius
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: connected ? '#10b981' : '#ef4444',
          boxShadow: connected ? '0 0 8px #10b981' : '0 0 8px #ef4444',
          animation: connected ? 'pulse 2s infinite' : 'none',
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: connected ? '#10b981' : '#ef4444' }}>
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#d1d5db' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(36,36,47,0.5)' }}>
          <span style={{ color: '#9ca3af' }}>Model</span>
          <strong>{status?.model || 'Nemotron 3 Super 120B'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(36,36,47,0.5)' }}>
          <span style={{ color: '#9ca3af' }}>Provider</span>
          <strong>{status?.provider || 'Nebius Token Factory'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(36,36,47,0.5)' }}>
          <span style={{ color: '#9ca3af' }}>Latency</span>
          <strong>{status?.latency_ms ? `${status.latency_ms} ms` : 'N/A'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <span style={{ color: '#9ca3af' }}>Tokens Processed</span>
          <strong>{status?.tokens_processed || 0}</strong>
        </div>
      </div>
      <button
        onClick={checkStatus}
        disabled={loading}
        style={{
          marginTop: 12, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 8, padding: '4px 12px', color: '#c4b5fd', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 10, width: '100%',
        }}
      >
        {loading ? 'Checking...' : 'Refresh Status'}
      </button>
      <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
        Powered by NVIDIA Nemotron on Nebius Token Factory
      </div>
    </div>
  );
};
