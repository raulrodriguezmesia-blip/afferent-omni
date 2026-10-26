"""Compliance & Safety Certification Report generator.

Validates telemetry against ISO 10218 / ISO/TS 15066 thresholds and
generates a conformity report.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter(prefix="/api/v1", tags=["Compliance & Safety Certification"])

class ComplianceReq(BaseModel):
    force_budget: Dict[str, Any] = {}
    neuromorphic_reflex: Dict[str, Any] = {}
    tactile_reasoning_cot: Dict[str, Any] = {}
    benchmark_telemetry: Dict[str, Any] = {}

@router.post("/compliance-report")
async def compliance_report(payload: ComplianceReq):
    checks = []
    passed = 0
    total = 0

    # ISO/TS 15066: max force for collaborative robots (simplified)
    fb = payload.force_budget or {}
    maxf = fb.get("max_allowed_normal_force_N", 0)
    total += 1
    if maxf <= 2.0:
        checks.append({"standard": "ISO/TS 15066", "check": "Max force <= 2.0 N (collaborative)", "status": "PASS", "value": maxf})
        passed += 1
    else:
        checks.append({"standard": "ISO/TS 15066", "check": "Max force <= 2.0 N (collaborative)", "status": "FAIL", "value": maxf})

    # Safety margin >= 10%
    margin = fb.get("force_budget_margin_percent", 0)
    total += 1
    if margin >= 10:
        checks.append({"standard": "ISO 10218-1", "check": "Safety margin >= 10%", "status": "PASS", "value": margin})
        passed += 1
    else:
        checks.append({"standard": "ISO 10218-1", "check": "Safety margin >= 10%", "status": "FAIL", "value": margin})

    # Edge latency <= 15 ms
    reflex = payload.neuromorphic_reflex or {}
    lat = reflex.get("edge_latency_ms", 999)
    total += 1
    if lat <= 15:
        checks.append({"standard": "IEC 61508", "check": "Edge reflex latency <= 15 ms", "status": "PASS", "value": lat})
        passed += 1
    else:
        checks.append({"standard": "IEC 61508", "check": "Edge reflex latency <= 15 ms", "status": "FAIL", "value": lat})

    # Uncertainty below threshold
    cot = payload.tactile_reasoning_cot or {}
    unc = cot.get("uncertainty_score", 1.0)
    total += 1
    if unc <= 0.25:
        checks.append({"standard": "Sim2Real", "check": "Uncertainty <= 25%", "status": "PASS", "value": round(unc*100,1)})
        passed += 1
    else:
        checks.append({"standard": "Sim2Real", "check": "Uncertainty <= 25%", "status": "FAIL", "value": round(unc*100,1)})

    # Damage prevention confidence >= 95%
    bt = payload.benchmark_telemetry or {}
    dpc = bt.get("damage_prevention_confidence", "0%")
    try:
        dpc_val = float(str(dpc).replace("%", ""))
    except:
        dpc_val = 0
    total += 1
    if dpc_val >= 95:
        checks.append({"standard": "TactoEval", "check": "Damage prevention confidence >= 95%", "status": "PASS", "value": dpc})
        passed += 1
    else:
        checks.append({"standard": "TactoEval", "check": "Damage prevention confidence >= 95%", "status": "FAIL", "value": dpc})

    conformity = "CONFORMANT" if passed == total else "NON-CONFORMANT"
    return {
        "conformity_status": conformity,
        "passed": passed,
        "total": total,
        "score_percent": round(passed / total * 100, 1) if total else 0,
        "checks": checks,
        "standards_evaluated": ["ISO 10218-1", "ISO/TS 15066", "IEC 61508", "Sim2Real", "TactoEval"],
    }
