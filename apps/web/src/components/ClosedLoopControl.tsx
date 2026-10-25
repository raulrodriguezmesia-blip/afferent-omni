interface Props {
  viewMode: '2d' | '3d';
  setViewMode: (m: '2d' | '3d') => void;
  streaming: boolean;
  setStreaming: (b: boolean) => void;
  connected: boolean;
  uThreshold: number;
  setUThreshold: (v: number) => void;
  fMax: number;
  setFMax: (v: number) => void;
  onParamsChange: (u: number, f: number) => void;
}

export default function ClosedLoopControl(props: Props) {
  const { viewMode, setViewMode, streaming, setStreaming, connected, uThreshold, setUThreshold, fMax, setFMax, onParamsChange } = props;

  return (
    <div className="panel">
      <h3>Closed-Loop Control • Sim2Real</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setViewMode('2d')}
          style={{ background: viewMode === '2d' ? 'linear-gradient(90deg,#8b5cf6,#a855f7)' : 'transparent', border: '1px solid var(--border)', color: viewMode === '2d' ? '#fff' : 'var(--text)' }}
        >2D Heatmap</button>
        <button
          onClick={() => setViewMode('3d')}
          style={{ background: viewMode === '3d' ? 'linear-gradient(90deg,#8b5cf6,#a855f7)' : 'transparent', border: '1px solid var(--border)', color: viewMode === '3d' ? '#fff' : 'var(--text)' }}
        >3D Gel Deformation</button>
      </div>

      <div className="row">
        <span>Stream Status</span>
        <span className={`badge ${connected ? 'ok' : 'warn'}`}>{connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
      </div>

      <button
        onClick={() => setStreaming(!streaming)}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {streaming ? 'Stop Live Stream' : 'Start Live Stream (WebSocket)'}
      </button>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--sub)', marginBottom: 4 }}>
          <span>Uncertainty Threshold (U_th)</span>
          <strong style={{ color: 'var(--text)' }}>{(uThreshold * 100).toFixed(0)}%</strong>
        </div>
        <input
          type="range" min={0} max={1} step={0.01} value={uThreshold}
          onChange={(e) => { const v = Number(e.target.value); setUThreshold(v); onParamsChange(v, fMax); }}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--sub)', marginBottom: 4 }}>
          <span>Max Force Cap (F_max)</span>
          <strong style={{ color: 'var(--text)' }}>{fMax.toFixed(2)} N</strong>
        </div>
        <input
          type="range" min={0.1} max={5} step={0.1} value={fMax}
          onChange={(e) => { const v = Number(e.target.value); setFMax(v); onParamsChange(uThreshold, v); }}
          style={{ width: '100%' }}
        />
      </div>

      {streaming && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--sub)', textAlign: 'center' }}>
          Live 50 Hz telemetry • 4-phase micro-contact exploration loop
        </div>
      )}
    </div>
  );
}
