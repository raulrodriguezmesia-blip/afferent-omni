interface Props {
  cot: {
    target_class: string;
    tactile_chain_of_thought: string[];
    uncertainty_score: number;
    gating_decision: string;
  };
}

export default function TactileCoTPanel({ cot }: Props) {
  return (
    <div className="panel">
      <h3>Tactile CoT • Afferent-Core</h3>
      <div className="row"><span>Target Class</span><strong>{cot.target_class}</strong></div>
      <div className="row"><span>Uncertainty</span><strong>{(cot.uncertainty_score * 100).toFixed(1)}%</strong></div>
      <div className="row"><span>Gating Decision</span><span className="badge">{cot.gating_decision}</span></div>
      <div className="cot-list">
        {cot.tactile_chain_of_thought.map((step, i) => (
          <div key={i} className="cot-item"><span className="dot" />{step}</div>
        ))}
      </div>
    </div>
  );
}
