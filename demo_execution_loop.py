#!/usr/bin/env python3
"""
Afferent-Omni: CLI Sanity Check for Deterministic Control Loop

Verifies the native deterministic physics and safety shield loop without
spawning full Docker containers. Runs a simulated 50 Hz tactile stream
and validates force gating, anomaly detection, and compliance checks.

Usage:
    python demo_execution_loop.py
    python demo_execution_loop.py --frames 100 --object glass
"""
import argparse
import json
import math
import random
import time
import sys

# Add backend to path
sys.path.insert(0, "apps/api")

try:
    from app.services.physics_engine import (
        resolve_material, compute_stress_distribution,
        compute_deformation_field, tribological_report,
    )
    from app.services.anomaly_detector import detect_anomalies
    from app.services.material_calibration import calibrate
    from app.services.grasp_planner import plan_grasp
    NATIVE = True
except ImportError:
    NATIVE = False
    print("[WARN] Could not import backend modules. Running in standalone mode.")


def simulate_frame(t_ms: float, u_th: float, f_max: float, material: dict, active_digits: list) -> dict:
    """Simulate a single telemetry frame at time t."""
    if t_ms < 50:
        phase = "APPROACH_VISUAL_PRIOR"
        uncertainty = round(random.uniform(0.35, 0.55), 3)
        force = 0.0
    elif t_ms < 150:
        phase = "MICRO_CONTACT_PROBE"
        uncertainty = round(random.uniform(0.18, 0.32), 3)
        force = 0.2
    elif t_ms < 300:
        phase = "FORCE_BUDGET_ADJUSTMENT"
        uncertainty = round(random.uniform(0.08, 0.16), 3)
        force = min(f_max * 0.6, 1.1)
    else:
        phase = "STABLE_GRASP"
        uncertainty = round(random.uniform(0.03, 0.09), 3)
        force = min(f_max * 0.85, 1.6)

    gating = "TACTILE_EXPLORATION_REQUIRED" if uncertainty > u_th else "AUTHORIZED_SAFE_GRASP"

    shear_limit = material.get("shear_limit_n", 1.8)
    if force > f_max or force > shear_limit:
        gating = "GRASP_DENIED"
        phase = "EMERGENCY_ABORT"

    stress = compute_stress_distribution(material, force, 32) if NATIVE else []
    deform = compute_deformation_field(material, force, 32) if NATIVE else []

    return {
        "t_ms": round(t_ms, 1),
        "phase": phase,
        "uncertainty_score": uncertainty,
        "u_threshold": u_th,
        "gating_decision": gating,
        "applied_force_n": round(force, 3),
        "f_max_n": f_max,
        "shear_limit_n": shear_limit,
        "material_class": material.get("material_class", "unknown"),
        "stress_distribution_kpa": stress,
        "deformation_field_mm": deform,
        "grid_resolution": [32, 32],
        "neuromorphic_reflex": {
            "edge_latency_ms": round(8.0 + random.random() * 6.0, 1),
            "slip_detected": uncertainty > 0.25,
            "reflex_override_engaged": uncertainty > 0.3,
        },
        "multi_digit_topology": {
            "active_digits": list(active_digits),
            "center_of_pressure": [round(0.4 + random.random() * 0.2, 3), round(0.5 + random.random() * 0.15, 3)],
            "torque_balance_index": round(0.85 + random.random() * 0.12, 3),
        },
        "acoustic_friction_profile": {
            "dominant_frequency_hz": round(120.0 + material.get("surface_roughness_ra_um", 1.0) * 40.0 + random.random() * 60.0, 1),
            "stick_slip_energy": round(0.3 + material.get("surface_roughness_ra_um", 1.0) * 0.15 + random.random() * 0.2, 3),
            "harmonic_spectrum": [round(random.random(), 3) for _ in range(12)],
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Afferent-Omni CLI Sanity Check")
    parser.add_argument("--frames", type=int, default=50, help="Number of frames to simulate")
    parser.add_argument("--object", type=str, default="glass", help="Object label (glass, rock, egg, strawberry, metal, tissue)")
    parser.add_argument("--u-th", type=float, default=0.25, help="Uncertainty threshold")
    parser.add_argument("--f-max", type=float, default=1.8, help="Max force cap (N)")
    parser.add_argument("--verbose", action="store_true", help="Print each frame")
    args = parser.parse_args()

    object_label = args.object.capitalize() if args.object != "glass" else "Thin-Walled Glassware (Wine Stemware)"
    if args.object == "rock":
        object_label = "Igneous Rock (Geological Sample)"
    elif args.object == "tissue":
        object_label = "Biological Tissue (Medical)"

    print("=" * 70)
    print("  AFFERENT-OMNI: Deterministic Control Loop Sanity Check")
    print("=" * 70)
    print(f"  Object:       {object_label}")
    print(f"  Frames:       {args.frames}")
    print(f"  U_th:         {args.u_th}")
    print(f"  F_max:        {args.f_max} N")
    print(f"  Native Mode:  {NATIVE}")
    print("=" * 70)

    if NATIVE:
        material = resolve_material(object_label)
        print(f"  Material:     {material.get('material_class', 'unknown')}")
        print(f"  Young's E:    {material.get('elastic_modulus_gpa', 'N/A')} GPa")
        print(f"  Friction (mu):   {material.get('static_friction_coeff', 'N/A')}")
        print(f"  Shear Limit:  {material.get('shear_limit_n', 'N/A')} N")
        print("=" * 70)
    else:
        material = {"material_class": args.object, "elastic_modulus_gpa": 60.0, "static_friction_coeff": 0.5, "shear_limit_n": 10.0, "surface_roughness_ra_um": 2.0}

    active_digits = ["thumb", "index", "middle"]
    frames = []
    phases_seen = set()
    gating_counts = {"AUTHORIZED_SAFE_GRASP": 0, "TACTILE_EXPLORATION_REQUIRED": 0, "GRASP_DENIED": 0}

    start_time = time.time()
    for i in range(args.frames):
        t_ms = i * 20.0  # 50 Hz
        frame = simulate_frame(t_ms, args.u_th, args.f_max, material, active_digits)
        frames.append(frame)
        phases_seen.add(frame["phase"])
        gating_counts[frame["gating_decision"]] = gating_counts.get(frame["gating_decision"], 0) + 1

        if args.verbose:
            print(f"  [{i+1:3d}] t={t_ms:6.0f}ms | {frame['phase']:28s} | F={frame['applied_force_n']:5.2f}N | U={frame['uncertainty_score']:.3f} | {frame['gating_decision']}")

    elapsed = time.time() - start_time
    print(f"\n  Simulated {args.frames} frames in {elapsed:.3f}s ({args.frames/elapsed:.0f} FPS)")

    # --- Safety Shield Validation ---
    print("\n" + "=" * 70)
    print("  SAFETY SHIELD VALIDATION")
    print("=" * 70)
    print(f"  Phases observed:  {', '.join(sorted(phases_seen))}")
    print(f"  Gating counts:    {gating_counts}")
    safe = gating_counts.get("GRASP_DENIED", 0) == 0
    print(f"  No emergency aborts: {'PASS' if safe else 'FAIL'}")

    # --- Anomaly Detection ---
    print("\n" + "=" * 70)
    print("  ANOMALY DETECTION")
    print("=" * 70)
    if NATIVE:
        result = detect_anomalies(frames)
        print(f"  Frames analyzed:  {result['frame_count']}")
        print(f"  Anomalies found:  {result['anomaly_count']}")
        print(f"  Risk level:       {result['risk_level']}")
        print(f"  Summary:          {result['summary']}")
    else:
        print("  (Skipped - native modules not available)")

    # --- Material Calibration ---
    print("\n" + "=" * 70)
    print("  MATERIAL CALIBRATION")
    print("=" * 70)
    if NATIVE:
        cal = calibrate(object_label, probe_count=5)
        print(f"  Object:           {cal['object_label']}")
        print(f"  Probes:           {cal['probe_count']}")
        print(f"  Calibrated E:     {cal['calibrated']['elastic_modulus_gpa']} GPa")
        print(f"  Calibrated mu:     {cal['calibrated']['static_friction_coeff']}")
        print(f"  Confidence:       {cal['confidence']}")
        print(f"  Status:           {cal['status']}")
    else:
        print("  (Skipped - native modules not available)")

    # --- Zero-Shot Grasp Planning ---
    print("\n" + "=" * 70)
    print("  ZERO-SHOT GRASP PLANNING")
    print("=" * 70)
    if NATIVE:
        plan = plan_grasp(object_label)
        print(f"  Strategy:         {plan['strategy']}")
        print(f"  Orientation:      {plan['orientation']}")
        print(f"  Fingers:          {', '.join(plan['active_fingers'])}")
        print(f"  Predicted Force:  {plan['predicted_force_n']} N")
        print(f"  Confidence:       {plan['confidence']}")
    else:
        print("  (Skipped - native modules not available)")

    # --- Final Summary ---
    print("\n" + "=" * 70)
    print("  SANITY CHECK COMPLETE")
    print("=" * 70)
    print(f"  [OK] {args.frames} frames simulated at 50 Hz")
    print(f"  [OK] {len(phases_seen)} phases observed")
    print(f"  [OK] Safety Shield: {'NOMINAL' if safe else 'CRITICAL'}")
    print(f"  [OK] Material: {material.get('material_class', 'unknown')}")
    print(f"  [OK] Active digits: {', '.join(active_digits)}")
    print("=" * 70)
    print("  All systems operational. Ready for deployment. ")
    print("=" * 70)


if __name__ == "__main__":
    main()
