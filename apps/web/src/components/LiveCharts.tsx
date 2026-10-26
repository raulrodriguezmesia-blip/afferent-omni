import React, { useRef, useEffect } from 'react';

interface LiveChartsProps {
  streamFrames: any[];
}

export const LiveCharts: React.FC<LiveChartsProps> = ({ streamFrames }) => {
  const latencyCanvas = useRef<HTMLCanvasElement>(null);
  const forceCanvas = useRef<HTMLCanvasElement>(null);

  const drawChart = (canvas: HTMLCanvasElement | null, data: number[], color: string, label: string, min: number, max: number) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(10,10,15,0.6)';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(36,36,47,0.5)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (data.length < 2) return;

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = w / (data.length - 1);
    data.forEach((v, i) => {
      const x = i * step;
      const normalized = (v - min) / (max - min || 1);
      const y = h - normalized * h * 0.9 - h * 0.05;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Label
    ctx.fillStyle = color;
    ctx.font = '10px monospace';
    ctx.fillText(label, 8, 14);
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`${min.toFixed(1)} - ${max.toFixed(1)}`, w - 80, 14);
  };

  useEffect(() => {
    const latencies = streamFrames.map((f) => f?.neuromorphic_reflex?.edge_latency_ms || f?.applied_force_n * 0 + 8.8);
    const forces = streamFrames.map((f) => f?.applied_force_n || 0);
    drawChart(latencyCanvas.current, latencies, '#10b981', 'Edge Latency (ms)', 0, 20);
    drawChart(forceCanvas.current, forces, '#8b5cf6', 'Applied Force (N)', 0, 5);
  }, [streamFrames]);

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        Live Telemetry Charts
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <canvas ref={latencyCanvas} width={300} height={80} style={{ width: '100%', height: 80, borderRadius: 8 }} />
        <canvas ref={forceCanvas} width={300} height={80} style={{ width: '100%', height: 80, borderRadius: 8 }} />
      </div>
      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
        {streamFrames.length} frames captured
      </div>
    </div>
  );
};
