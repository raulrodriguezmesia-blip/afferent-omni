import { type TactileCell } from '../types/afferent';
import { useMemo } from 'react';

interface Props {
  cells: TactileCell[];
  gridSize?: [number, number];
}

export default function TactileHeatmap({ cells, gridSize = [32, 32] }: Props) {
  const [w, h] = gridSize;
  const cellMap = useMemo(() => {
    const map = new Map<string, TactileCell>();
    cells.forEach(c => map.set(`${c.x},${c.y}`, c));
    return map;
  }, [cells]);

  const getColor = (cell?: TactileCell) => {
    if (!cell) return 'transparent';
    if (cell.risk_level === 'DANGER') return 'rgba(239, 68, 68, 0.9)';
    if (cell.risk_level === 'CAUTION') return 'rgba(251, 191, 36, 0.8)';
    return 'rgba(16, 185, 129, 0.8)'; // SAFE
  };

  return (
    <div className="heatmap-container">
<div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${w}, 1fr)`, aspectRatio: '1/1' }}>
        {Array.from({ length: w * h }).map((_, i) => {
          const x = i % w;
          const y = Math.floor(i / w);
          const cell = cellMap.get(`${x},${y}`);
          return (
            <div
              key={i}
              className="heatmap-cell"
              style={{ backgroundColor: getColor(cell) }}
              title={cell ? `(${x},${y}) | P:${cell.max_pressure_kPa} kPa | R:${cell.rigidity_score} | ${cell.risk_level}` : 'out of mask'}
            />
          );
        })}
      </div>
      <div className="heatmap-legend">
        <span><span className="legend-dot safe" /> SAFE</span>
        <span><span className="legend-dot caution" /> CAUTION</span>
        <span><span className="legend-dot danger" /> DANGER</span>
      </div>
    </div>
  );
}
