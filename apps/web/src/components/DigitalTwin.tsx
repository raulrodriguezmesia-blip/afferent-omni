import React, { useState } from 'react';

interface DigitalTwinProps {
  apiBase: string;
  objectLabel: string;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ apiBase, objectLabel }) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/plan-grasp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ object_label: objectLabel }),
      });
      const plan = await res.json();
      setPrediction({
        strategy: plan.strategy,
        predictedForce: plan.predicted_force_n,
        contactPoints: plan.contact_points,
        confidence: plan.confidence,
        predictedDeformation: plan.contact_points.map((cp: any) => ({
          digit: cp.digit,
          pressure: cp.predicted_pressure_kpa,
          displacement: (cp.predicted_pressure_kpa / 100).toFixed(3),
        })),
        riskAssessment: plan.predicted_force_n > 2.0 ? 'HIGH' : plan.predicted_force_n > 1.0 ? 'MODERATE' : 'LOW',
      });
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  const riskColor = (r: string) => r === 'HIGH' ? '#ef4444' : r === 'MODERATE' ? '#f59e0b' : '#10b981';

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        Digital Twin • Pre-Contact Simulation
      </h3>
      <button
        onClick={simulate}
        disabled={loading}
        style={{
          background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(90deg,#8b5cf6,#a855f7)',
          border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: 11, marginBottom: 12, width: '100%',
        }}
      >
        {loading ? 'Simulating...' : 'Run Pre-Contact Simulation'}
      </button>
      {prediction && (
        <div style={{ fontSize: 11, color: '#d1d5db', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10 }}>
          <div style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: 6 }}>Prediction Complete</div>
          <div>Strategy: <strong>{prediction.strategy}</strong></div>
          <div>Predicted Force: <strong>{prediction.predictedForce} N</strong></div>
          <div>Confidence: {(prediction.confidence * 100).toFixed(1)}%</div>
          <div>Risk: <strong style={{ color: riskColor(prediction.riskAssessment) }}>{prediction.riskAssessment}</strong></div>
          <div style={{ marginTop: 8, color: '#9ca3af', fontSize: 10 }}>Predicted Deformation:</div>
          {prediction.predictedDeformation.map((d: any, i: number) => (
            <div key={i} style={{ fontSize: 10, color: '#9ca3af' }}>
              {d.digit}: pressure={d.pressure} kPa, displacement={d.displacement} mm
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 10, color: '#10b981' }}>
            Simulation ready. Actual contact will be compared against prediction.
          </div>
        </div>
      )}
      {!prediction && !loading && (
        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', padding: 8 }}>
          Run simulation to predict contact deformation before physical interaction.
        </div>
      )}
    </div>
  );
};
