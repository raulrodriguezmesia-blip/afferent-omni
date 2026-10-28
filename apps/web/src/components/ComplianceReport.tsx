import React, { useState } from 'react';

interface ComplianceReportProps {
  apiBase: string;
  context: any;
}

export const ComplianceReport: React.FC<ComplianceReportProps> = ({ apiBase, context }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/v1/compliance-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force_budget: context?.force_budget || {},
          neuromorphic_reflex: context?.neuromorphicReflex || {},
          tactile_reasoning_cot: context?.tactile_reasoning_cot || {},
          benchmark_telemetry: context?.benchmark_telemetry || {},
        }),
      });
      setReport(await res.json());
    } catch (e: any) {
      setError(e.message || 'Report generation failed');
    } finally {
      setLoading(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  const statusColor = (s: string) => s === 'PASS' ? '#10b981' : '#ef4444';

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        Compliance Report • ISO/IEC Certification
      </h3>
      <button
        onClick={generateReport}
        disabled={loading}
        style={{
          background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(90deg,#8b5cf6,#a855f7)',
          border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: 11, marginBottom: 12,
        }}
      >
        {loading ? 'Generating...' : 'Generate Compliance Report'}
      </button>
      {error && <div style={{ color: '#ef4444', fontSize: 11, marginBottom: 8 }}>{error}</div>}
      {report && (
        <div>
          <div style={{
            textAlign: 'center', padding: 10, borderRadius: 8, marginBottom: 12,
            background: report.conformity_status === 'CONFORMANT' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: report.conformity_status === 'CONFORMANT' ? '#10b981' : '#ef4444',
            fontWeight: 700, fontSize: 14,
          }}>
            {report.conformity_status} — {report.passed}/{report.total} ({report.score_percent}%)
          </div>
          {report.checks.map((c: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,36,47,0.5)', fontSize: 11 }}>
              <span style={{ color: '#d1d5db' }}>{c.standard}: {c.check}</span>
              <span style={{ color: statusColor(c.status), fontWeight: 600 }}>{c.status} ({c.value})</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 10, color: '#9ca3af' }}>
            Standards: {report.standards_evaluated.join(', ')}
          </div>
          <a
            href={`${apiBase}/api/v1/compliance/export-pdf?session_id=SESS-2026-NVIDIA-001&object_type=${encodeURIComponent(context?.objectLabel || 'Unknown')}&f_max=${context?.force_budget?.max_allowed_normal_force_N || 1.8}&u_th=${context?.tactile_reasoning_cot?.uncertainty_score || 0.09}&pass_status=${report.conformity_status === 'CONFORMANT'}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: 12, background: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '6px 14px',
              color: '#6ee7b7', cursor: 'pointer', fontSize: 11, textDecoration: 'none',
            }}
          >
            📄 Export Official ISO PDF Report
          </a>
        </div>
      )}
    </div>
  );
};
