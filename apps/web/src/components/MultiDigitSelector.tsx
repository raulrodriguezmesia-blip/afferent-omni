import { type MultiDigitTopology } from '../types/afferent';

const DIGITS = [
  { id: 'thumb', label: 'Thumb' },
  { id: 'index', label: 'Index' },
  { id: 'middle', label: 'Middle' },
  { id: 'full', label: 'Full Hand' },
];

const DIGIT_MAP: Record<string, string[]> = {
  thumb: ['thumb'],
  index: ['index'],
  middle: ['middle'],
  full: ['thumb', 'index', 'middle', 'ring', 'pinky'],
};

interface Props {
  selected: string;
  onSelect: (id: string) => void;
  topology: MultiDigitTopology | null | undefined;
}

export default function MultiDigitSelector({ selected, onSelect, topology }: Props) {
  return (
    <div className="panel">
      <h3>Multi-Digit Selector • Dexterous Manipulator</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {DIGITS.map((d) => (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            style={{
              background: selected === d.id ? 'linear-gradient(90deg,#8b5cf6,#a855f7)' : 'transparent',
              border: '1px solid var(--border)',
              color: selected === d.id ? '#fff' : 'var(--text)',
              padding: '8px 14px',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {d.label}
          </button>
        ))}
      </div>
      {topology && (
        <>
          <div className="row"><span>Active Digits</span><strong>{topology.active_digits.join(', ')}</strong></div>
          <div className="row"><span>Center of Pressure</span><strong>[{topology.center_of_pressure.map((v) => v.toFixed(3)).join(', ')}]</strong></div>
          <div className="row"><span>Torque Balance Index</span><strong>{topology.torque_balance_index.toFixed(3)}</strong></div>
        </>
      )}
    </div>
  );
}

export { DIGIT_MAP };
