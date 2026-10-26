"""Anomaly detection for telemetry streams.

Uses simple statistical heuristics (z-score, threshold checks) to detect
degradation in e-skin, actuator drift, or abnormal force patterns.
"""
import statistics
from typing import Dict, Any, List

def detect_anomalies(frames: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not frames:
        return {"status": "no_data", "anomalies": [], "risk_level": "unknown"}

    anomalies = []
    risk = "low"

    # Extract series
    forces = [f.get("applied_force_n", 0) for f in frames]
    uncertainties = [f.get("uncertainty_score", 0) for f in frames]
    latencies = [f.get("neuromorphic_reflex", {}).get("edge_latency_ms", 0) for f in frames]
    energies = [f.get("acoustic_friction_profile", {}).get("stick_slip_energy", 0) for f in frames]

    # Force spike detection
    if forces:
        mean_f = statistics.mean(forces)
        std_f = statistics.pstdev(forces) if len(forces) > 1 else 0
        if std_f > 0:
            for i, fv in enumerate(forces):
                if abs(fv - mean_f) > 3 * std_f:
                    anomalies.append({"type": "force_spike", "index": i, "value": fv, "severity": "high"})
                    risk = "high"

    # Uncertainty drift
    if len(uncertainties) > 10:
        recent = uncertainties[-10:]
        if statistics.mean(recent) > 0.35:
            anomalies.append({"type": "uncertainty_drift", "mean_recent": round(statistics.mean(recent), 3), "severity": "medium"})
            if risk != "high":
                risk = "medium"

    # Latency degradation
    if latencies:
        if max(latencies) > 25:
            anomalies.append({"type": "latency_degradation", "max_ms": max(latencies), "severity": "high"})
            risk = "high"

    # Stick-slip energy anomaly
    if energies:
        mean_e = statistics.mean(energies)
        if mean_e > 2.0:
            anomalies.append({"type": "excessive_stick_slip", "mean_energy": round(mean_e, 3), "severity": "medium"})
            if risk == "low":
                risk = "medium"

    # Force trend (increasing over time = possible actuator drift)
    if len(forces) > 20:
        first_half = forces[:len(forces)//2]
        second_half = forces[len(forces)//2:]
        if statistics.mean(second_half) > statistics.mean(first_half) * 1.3:
            anomalies.append({"type": "force_trend_increase", "severity": "medium"})
            if risk == "low":
                risk = "medium"

    return {
        "status": "analyzed",
        "frame_count": len(frames),
        "anomaly_count": len(anomalies),
        "risk_level": risk,
        "anomalies": anomalies,
        "summary": "No anomalies detected." if not anomalies else f"{len(anomalies)} anomaly/anomalies detected. Risk level: {risk}.",
    }
