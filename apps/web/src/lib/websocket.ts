import { useCallback, useEffect, useRef, useState } from 'react';

export interface TactileStreamFrame {
  t_ms: number;
  phase: string;
  uncertainty_score: number;
  u_threshold: number;
  gating_decision: string;
  applied_force_n: number;
  f_max_n: number;
  shear_limit_n: number;
  material_class: string;
  stress_distribution_kpa: number[][];
  deformation_field_mm: number[][];
  grid_resolution: [number, number];
  neuromorphic_reflex?: {
    edge_latency_ms: number;
    slip_detected: boolean;
    reflex_override_engaged: boolean;
  };
  multi_digit_topology?: {
    active_digits: string[];
    center_of_pressure: number[];
    torque_balance_index: number;
  };
  acoustic_friction_profile?: {
    dominant_frequency_hz: number;
    stick_slip_energy: number;
    harmonic_spectrum: number[];
  };
}

export interface StreamControls {
  u_threshold?: number;
  f_max?: number;
  object_label?: string;
  active_digits?: string[];
  space_mode?: boolean;
}

export function useTactileStream(url: string) {
  const [frame, setFrame] = useState<TactileStreamFrame | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldConnect = useRef(true);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!shouldConnect.current) return;
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as TactileStreamFrame;
          setFrame(data);
        } catch (e) {
          setError('Failed to parse stream frame');
        }
      };
      ws.onerror = () => {
        setError('WebSocket error');
      };
      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (shouldConnect.current) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 8000);
          reconnectAttempts.current += 1;
          reconnectTimer.current = setTimeout(connect, delay);
        }
      };
    } catch (e: any) {
      setError(e?.message || 'Connection failed');
    }
  }, [url]);

  useEffect(() => {
    shouldConnect.current = true;
    connect();
    return () => {
      shouldConnect.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch { /* ignore */ }
      }
    };
  }, [connect]);

  const sendControls = useCallback((controls: StreamControls) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(controls));
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldConnect.current = false;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (wsRef.current) {
      try { wsRef.current.close(); } catch { /* ignore */ }
    }
  }, []);

  return { frame, connected, error, sendControls, disconnect };
}
