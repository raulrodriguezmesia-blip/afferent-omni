interface Props {
  gating: string;
  uncertainty: number;
  forceBudget: any;
}

export default function SafetyShield({ gating }: Props) {
  const isExploring = gating === 'TACTILE_EXPLORATION_REQUIRED';
  return (
    <div className="panel shield">
      <h3>Sim2Real Safety Shield</h3>
      <div className={`shield-status ${isExploring ? 'explore' : 'safe'}`}>
        {isExploring ? 'TACTILE_EXPLORATION_REQUIRED' : 'AUTHORIZED_SAFE_GRASP'}
      </div>
<p className="shield-text">
        {isExploring 
          ? 'Uncertainty % > 40%: Executing micro-contact exploratory probe at ~ N before final grasp.'
          : 'Uncertainty % below threshold: Conservative grasp authorized with safety margin.'}
      </p>
    </div>
  );
}
