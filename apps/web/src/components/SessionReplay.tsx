import React, { useState, useEffect, useRef } from 'react';

interface SessionReplayProps {
  apiBase: string;
}

interface Session {
  id: string;
  object_label: string;
  created_at: number;
  frame_count: number;
}

export const SessionReplay: React.FC<SessionReplayProps> = ({ apiBase }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [frame, setFrame] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  // loading state removed (unused)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/sessions`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchSessions(); }, []);

  const loadSession = async (sid: string) => {
    setSelectedSession(sid);
    setFrameIndex(0);
    try {
      const res = await fetch(`${apiBase}/api/v1/sessions/${sid}`);
      const data = await res.json();
      setTotalFrames(data.frame_count || 0);
      if (data.frame_count > 0) {
        const fRes = await fetch(`${apiBase}/api/v1/sessions/${sid}/frame/0`);
        setFrame(await fRes.json());
      }
    } catch { /* ignore */ }
  };

  const loadFrame = async (idx: number) => {
    if (!selectedSession) return;
    try {
      const res = await fetch(`${apiBase}/api/v1/sessions/${selectedSession}/frame/${idx}`);
      if (res.ok) {
        setFrame(await res.json());
        setFrameIndex(idx);
      }
    } catch { /* ignore */ }
  };

  const togglePlay = () => {
    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      timerRef.current = setInterval(() => {
        setFrameIndex((prev) => {
          const next = prev + 1;
          if (next >= totalFrames) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPlaying(false);
            return prev;
          }
          loadFrame(next);
          return next;
        });
      }, 50);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const panelStyle: React.CSSProperties = {
    background: 'rgba(15,15,23,0.85)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: 12 }}>
        Session Replay • Data Logger
      </h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={fetchSessions} style={{ background: 'linear-gradient(90deg,#8b5cf6,#a855f7)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 11 }}>
          Refresh
        </button>
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => loadSession(s.id)}
            style={{
              background: selectedSession === s.id ? 'rgba(124,58,237,0.4)' : 'rgba(30,30,46,0.6)',
              border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '6px 10px',
              color: '#e5e7eb', cursor: 'pointer', fontSize: 10,
            }}
          >
            {s.object_label} ({s.frame_count}f)
          </button>
        ))}
      </div>
      {selectedSession && totalFrames > 0 && (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <button onClick={togglePlay} style={{ background: playing ? '#ef4444' : 'linear-gradient(90deg,#8b5cf6,#a855f7)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: 11 }}>
              {playing ? '⏸ Pause' : '▶ Play'}
            </button>
            <input
              type="range" min={0} max={totalFrames - 1} value={frameIndex}
              onChange={(e) => loadFrame(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#8b5cf6' }}
            />
            <span style={{ fontSize: 11, color: '#9ca3af', minWidth: 60 }}>Frame {frameIndex + 1}/{totalFrames}</span>
          </div>
          {frame && (
            <div style={{ fontSize: 11, color: '#d1d5db', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 8 }}>
              <div>Phase: <strong>{frame.phase}</strong> | t: {frame.t_ms} ms | Force: {frame.applied_force_n} N</div>
              <div>Gating: {frame.gating_decision} | Uncertainty: {(frame.uncertainty_score * 100).toFixed(1)}%</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <a
              href={`${apiBase}/api/v1/sessions/${selectedSession}/export`}
              download={`session_${selectedSession}.json`}
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '6px 12px', color: '#c4b5fd', cursor: 'pointer', fontSize: 11, textDecoration: 'none', display: 'inline-block' }}
            >
              📥 Export JSON
            </a>
            <a
              href={`${apiBase}/api/v1/sessions/${selectedSession}/export/csv`}
              download={`session_${selectedSession}.csv`}
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '6px 12px', color: '#c4b5fd', cursor: 'pointer', fontSize: 11, textDecoration: 'none', display: 'inline-block' }}
            >
              📊 Export CSV
            </a>
          </div>
        </>
      )}
      {sessions.length === 0 && (
        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', padding: 12 }}>
          No sessions recorded. Start a live stream to begin logging.
        </div>
      )}
    </div>
  );
};
