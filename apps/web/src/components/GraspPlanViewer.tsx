import React, { useState } from 'react';

interface GraspPlanViewerProps {
  apiBase: string;
  objectLabel: string;
}

export const GraspPlanViewer: React.FC<GraspPlanViewerProps> = ({ apiBase, objectLabel }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const planGrasp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/v1/plan-grasp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ object_label: objectLabel }),
      });
      setPlan(await res.json());
    } catch (e: any) {
      setError(e.message || 'Planning failed');
    } finally {
      setLoading(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  const strategyColor: Record<string, string> = {
    precision_pinch: '#10b981',
    power_grasp: '#f59e0b',
    gentle_cradle: '#8b5cf6',
    soft_pinch: '#ec4899',
    adaptive_precision: '#06b6d4',
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        Zero-Shot Grasp Plan • Vision Prior
      </h3>
      <button
        onClick={planGrasp}
        disabled={loading}
        style={{
          background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(90deg,#8b5cf6,#a855f7)',
          border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: 11, marginBottom: 12,
        }}
      >
        {loading ? 'Planning...' : 'Plan Grasp'}
      </button>
      {error && <div style={{ color: '#ef4444', fontSize: 11, marginBottom: 8 }}>{error}</div>}
      {plan && (
        <div style={{ fontSize: 11, color: '#d1d5db', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10 }}>
          <div style={{ marginBottom: 6 }}>
            Strategy: <strong style={{ color: strategyColor[plan.strategy] || '#c4b5fd' }}>{plan.strategy}</strong>
          </div>
          <div>Orientation: {plan.orientation}</div>
          <div>Fingers: {plan.active_fingers.join(', ')}</div>
          <div>Predicted Force: <strong>{plan.predicted_force_n} N</strong></div>
          <div>Confidence: {(plan.confidence * 100).toFixed(1)}%</div>
          <div style={{ marginTop: 6, color: '#9ca3af', fontSize: 10 }}>{plan.reasoning}</div>
          <div style={{ marginTop: 8 }}>
            {plan.contact_points.map((cp: any, i: number) => (
              <div key={i} style={{ fontSize: 10, color: '#9ca3af' }}>
                {cp.digit}: pos=[{cp.position.join(',')}], pressure={cp.predicted_pressure_kpa} kPa
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
