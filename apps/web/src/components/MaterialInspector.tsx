interface Props {
  materialProfile: any;
  physical: any;
}

export default function MaterialInspector({ materialProfile, physical }: Props) {
  const mp = materialProfile || {};
  const E = mp.elastic_modulus_gpa ?? physical?.bulk_modulus_GPa ?? 0;
  const mu = mp.static_friction_coeff ?? physical?.friction_coefficient_static_mu ?? 0;
  const shear = mp.shear_limit_n ?? 0;
  const cls = mp.material_class ?? 'unknown';
  const slip = mp.slip_threshold_n ?? 0;
  const margin = mp.safety_margin_percent ?? 0;
  const stress: number[][] = mp.stress_distribution_kpa ?? [];
  // Flatten stress to find max for bar viz
  const flat = stress.flat();
  const maxStress = flat.length ? Math.max(...flat) : 1;

  return (
    <div className="panel">
      <h3>Material Inspector • Tribological Profile</h3>
      <div className="row"><span>Material Class</span><span className="badge ok">{cls}</span></div>
      <div className="row"><span>Young's Modulus (E)</span><strong>{Number(E).toFixed(1)} GPa</strong></div>
      <div className="row"><span>Static Friction (μ)</span><strong>{Number(mu).toFixed(3)}</strong></div>
      <div className="row"><span>Shear Limit (F_shear)</span><strong>{Number(shear).toFixed(2)} N</strong></div>
      <div className="row"><span>Slip Threshold</span><strong>{Number(slip).toFixed(3)} N</strong></div>
      <div className="row"><span>Safety Margin</span><strong>{Number(margin).toFixed(1)} %</strong></div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Stress Distribution (peak {maxStress.toFixed(1)} kPa)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, height: 80 }}>
          {Array.from({ length: 8 }).map((_, gy) =>
            Array.from({ length: 8 }).map((_, gx) => {
              // downsample 32->8
              const sy = Math.floor((gy / 8) * 32);
              const sx = Math.floor((gx / 8) * 32);
              const v = stress[sy]?.[sx] ?? 0;
              const t = Math.min(1, v / maxStress);
              const r = Math.round(30 + t * 225);
              const g = Math.round(60 + (1 - t) * 120);
              const b = Math.round(140 - t * 100);
              return <div key={`${gx}-${gy}`} style={{ background: `rgb(${r},${g},${b})`, borderRadius: 2 }} />;
            })
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Safety Margin Bar
        </div>
        <div style={{ height: 10, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, margin)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #8b5cf6)' }} />
        </div>
      </div>
    </div>
  );
}
