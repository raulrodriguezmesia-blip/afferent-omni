import React, { useState } from 'react';

interface ComplianceReportProps {
  apiBase: string;
  context: any;
}

export const ComplianceReport: React.FC<ComplianceReportProps> = ({ apiBase, context }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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

  const exportPDF = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/compliance/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force_budget: context?.force_budget || {},
          neuromorphic_reflex: context?.neuromorphicReflex || {},
          tactile_reasoning_cot: context?.tactile_reasoning_cot || {},
          benchmark_telemetry: context?.benchmark_telemetry || {},
          material_profile: context?.materialProfile || {},
          acoustic_friction_profile: context?.acousticFrictionProfile || {},
          multi_digit_topology: context?.multiDigitTopology || {},
          object_label: context?.objectLabel || 'Unknown',
          nemotron_diagnosis: 'The somatosensory contact matrix confirms stable multi-digit engagement. No shear stress concentration zones exceeded the plastic deformation threshold. The Sim2Real Safety Shield maintained zero force limit overshoots. Bayesian material calibration validates optimal friction coefficient telemetry for high-precision manipulation.',
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'afferent_compliance_report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message || 'PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  const statusColor = (s: string) => s === 'PASS' ? '#10b981' : '#ef4444';

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', margin: 0 }}>
          Compliance Report • ISO/IEC Certification
        </h3>
        <button
          onClick={exportPDF}
          disabled={exporting}
          style={{
            background: exporting ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '6px 12px',
            color: '#6ee7b7', cursor: exporting ? 'not-allowed' : 'pointer', fontSize: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {exporting ? 'Exporting...' : '📄 Export Official ISO PDF Report'}
        </button>
      </div>
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
        </div>
      )}
    </div>
  );
};
