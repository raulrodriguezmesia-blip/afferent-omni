interface Props {
  telemetry: any;
}

export default function TactoEval({ telemetry }: Props) {
  return (
    <div className="panel eval">
      <h3>TactoEval Benchmark</h3>
      <div className="grid2">
        <div className="kpi"><span>Damage Prevention Confidence</span><strong>{telemetry.damage_prevention_confidence}</strong></div>
        <div className="kpi"><span>Damage Avoidance Index</span><strong>{telemetry.damage_avoidance_index_percent}%</strong></div>
        <div className="kpi"><span>Force Over-tightening Reduction</span><strong>{telemetry.force_over_tightening_reduction_percent}%</strong></div>
        <div className="kpi"><span>Cross-Modal Latency</span><strong>{telemetry.estimated_latency_ms} ms</strong></div>
      </div>
    </div>
  );
}
