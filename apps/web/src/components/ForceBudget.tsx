interface Props {
  forceBudget: any;
  physical: any;
}

export default function ForceBudget({ forceBudget, physical }: Props) {
  return (
    <div className="panel">
      <h3>Force Budget ? Fragility-Aware</h3>
      <div className="grid2">
        <div className="kpi"><span>F_max_allowed</span><strong>{forceBudget.max_allowed_normal_force_N} N</strong></div>
        <div className="kpi"><span>F_recommended</span><strong>{forceBudget.recommended_grasp_force_N} N</strong></div>
        <div className="kpi"><span>F_slip_min</span><strong>{forceBudget.minimum_slippage_threshold_N} N</strong></div>
        <div className="kpi"><span>Safety Margin</span><strong>{forceBudget.force_budget_margin_percent}%</strong></div>
      </div>
      <div className="row"><span>Fragility Score</span><strong>{(physical.fragility_score*100).toFixed(0)}%</strong></div>
      <div className="row"><span>Static ?</span><strong>{physical.friction_coefficient_static_mu}</strong></div>
    </div>
  );
}
