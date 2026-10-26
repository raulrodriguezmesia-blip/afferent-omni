import React, { useState, useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  streamFrames: any[];
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ streamFrames }) => {
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let raf: number;
    const tick = () => {
      frameCount.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (now - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = now;
        // @ts-ignore
        if (performance.memory) {
          // @ts-ignore
          setMemory(Math.round(performance.memory.usedJSHeapSize / 1048576));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  const metricStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', padding: '4px 0',
    fontSize: 11, borderBottom: '1px solid rgba(36,36,47,0.5)',
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        Performance Monitor
      </h3>
      <div style={metricStyle}>
        <span style={{ color: '#9ca3af' }}>FPS</span>
        <strong style={{ color: fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444' }}>{fps}</strong>
      </div>
      <div style={metricStyle}>
        <span style={{ color: '#9ca3af' }}>Memory (MB)</span>
        <strong style={{ color: '#c4b5fd' }}>{memory || 'N/A'}</strong>
      </div>
      <div style={metricStyle}>
        <span style={{ color: '#9ca3af' }}>Stream Frames</span>
        <strong style={{ color: '#c4b5fd' }}>{streamFrames.length}</strong>
      </div>
      <div style={metricStyle}>
        <span style={{ color: '#9ca3af' }}>WS Latency</span>
        <strong style={{ color: '#c4b5fd' }}>{streamFrames.length > 0 ? `${streamFrames[streamFrames.length - 1]?.t_ms?.toFixed(0) || 0} ms` : 'N/A'}</strong>
      </div>
      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
        Real-time performance metrics
      </div>
    </div>
  );
};
