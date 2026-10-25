import { useEffect, useRef } from 'react';
import { type AcousticFrictionProfile } from '../types/afferent';

interface Props {
  profile: AcousticFrictionProfile | null | undefined;
}

export default function AcousticSpectrogram({ profile }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<number[]>(new Array(12).fill(0));

  useEffect(() => {
    if (profile?.harmonic_spectrum) {
      spectrumRef.current = profile.harmonic_spectrum.slice();
    }
  }, [profile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = 'rgba(10,10,15,0.25)';
      ctx.fillRect(0, 0, w, h);
      const spec = spectrumRef.current;
      const barW = w / spec.length;
      spec.forEach((v, i) => {
        // animated jitter
        const jitter = (Math.sin(Date.now() / 200 + i) * 0.05);
        const val = Math.max(0, v + jitter);
        const barH = val * h * 0.9;
        const x = i * barW;
        const grad = ctx.createLinearGradient(0, h - barH, 0, h);
        grad.addColorStop(0, '#ff00ff');
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, h - barH, barW - 4, barH);
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="panel">
      <h3>Acoustic-Slip Spectrogram • E-Skin</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 12, color: 'var(--sub)' }}>
        <div>Dominant Freq: <strong style={{ color: 'var(--text)' }}>{profile ? `${profile.dominant_frequency_hz} Hz` : '—'}</strong></div>
        <div>Stick-Slip Energy: <strong style={{ color: 'var(--text)' }}>{profile ? profile.stick_slip_energy.toFixed(3) : '—'}</strong></div>
      </div>
      <canvas ref={canvasRef} width={320} height={120} style={{ width: '100%', height: 120, borderRadius: 8, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 6 }}>Stick-slip micro-vibrations • harmonic spectrum (12 bins)</div>
    </div>
  );
}
