import json

SCHEMA = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://afferent.dev/schemas/v2/god_tier_tactile_prior.json",
    "title": "Afferent Tactile Prior Schema",
    "description": "Causal Vision-to-Touch Prior with Spatial Matrix, Safety Shield, and TactoEval",
    "type": "object",
    "required": [
        "metadata", "tactile_reasoning_cot", "physical_matrix",
        "force_budget", "tactile_spatial_heatmap", "benchmark_telemetry"
    ],
    "additionalProperties": False,
    "properties": {}
}

# metadata
SCHEMA["properties"]["metadata"] = {
    "type": "object",
    "required": ["project", "system_status", "timestamp_utc", "model_stack"],
    "additionalProperties": False,
    "properties": {
        "project": {"type": "string", "const": "Afferent"},
        "system_status": {"type": "string", "enum": ["OPERATIONAL", "EXPLORING", "ERROR"]},
        "timestamp_utc": {"type": "string", "format": "date-time"},
        "model_stack": {"type": "array", "items": {"type": "string"}}
    }
}

# tactile_reasoning_cot
SCHEMA["properties"]["tactile_reasoning_cot"] = {
    "type": "object",
    "required": ["target_class", "tactile_chain_of_thought", "uncertainty_score", "gating_decision"],
    "additionalProperties": False,
    "properties": {
        "target_class": {"type": "string"},
        "tactile_chain_of_thought": {"type": "array", "items": {"type": "string"}},
        "uncertainty_score": {"type": "number", "minimum": 0, "maximum": 1},
        "gating_decision": {"type": "string", "enum": ["AUTHORIZED_SAFE_GRASP", "TACTILE_EXPLORATION_REQUIRED", "GRASP_DENIED"]}
    }
}

# physical_matrix
SCHEMA["properties"]["physical_matrix"] = {
    "type": "object",
    "required": ["surface_roughness_ra_um", "friction_coefficient_static_mu", "bulk_modulus_GPa", "fragility_score"],
    "additionalProperties": False,
    "properties": {
        "surface_roughness_ra_um": {"type": "number"},
        "friction_coefficient_static_mu": {"type": "number"},
        "bulk_modulus_GPa": {"type": "number"},
        "fragility_score": {"type": "number", "minimum": 0, "maximum": 1}
    }
}

# force_budget
SCHEMA["properties"]["force_budget"] = {
    "type": "object",
    "required": ["unit", "max_allowed_normal_force_N", "recommended_grasp_force_N", "minimum_slippage_threshold_N", "force_budget_margin_percent"],
    "additionalProperties": False,
    "properties": {
        "unit": {"type": "string", "const": "Newtons"},
        "max_allowed_normal_force_N": {"type": "number"},
        "recommended_grasp_force_N": {"type": "number"},
        "minimum_slippage_threshold_N": {"type": "number"},
        "force_budget_margin_percent": {"type": "number"}
    }
}

# tactile_spatial_heatmap
heatmap_props = {
    "type": "object",
    "required": ["grid_resolution", "cells", "safe_zones", "prohibited_zones"],
    "additionalProperties": False,
    "properties": {
        "grid_resolution": {"type": "array", "items": {"type": "number"}, "minItems": 2, "maxItems": 2},
        "cells": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["x", "y", "max_pressure_kPa", "rigidity_score", "risk_level"],
                "additionalProperties": False,
                "properties": {
                    "x": {"type": "number"},
                    "y": {"type": "number"},
                    "max_pressure_kPa": {"type": "number"},
                    "rigidity_score": {"type": "number", "minimum": 0, "maximum": 1},
                    "risk_level": {"type": "string", "enum": ["SAFE", "CAUTION", "DANGER"]}
                }
            }
        },
        "safe_zones": {"type": "array"},
        "prohibited_zones": {"type": "array"}
    }
}
SCHEMA["properties"]["tactile_spatial_heatmap"] = heatmap_props

# benchmark_telemetry
SCHEMA["properties"]["benchmark_telemetry"] = {
    "type": "object",
    "required": ["damage_prevention_confidence", "estimated_latency_ms", "force_over_tightening_reduction_percent", "damage_avoidance_index_percent"],
    "additionalProperties": False,
    "properties": {
        "damage_prevention_confidence": {"type": "string"},
        "estimated_latency_ms": {"type": "number"},
        "force_over_tightening_reduction_percent": {"type": "number"},
        "damage_avoidance_index_percent": {"type": "number"}
    }
}

with open("C:/dev/afferent/packages/schema/tactoforge.schema.json", "w", encoding="utf-8") as f:
    json.dump(SCHEMA, f, indent=2)

print("Schema written successfully")
