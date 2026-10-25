export interface TactileCell {
  x: number;
  y: number;
  max_pressure_kPa: number;
  rigidity_score: number;
  risk_level: 'SAFE' | 'CAUTION' | 'DANGER';
}

export interface MaterialProfile {
  elastic_modulus_gpa: number;
  static_friction_coeff: number;
  shear_limit_n: number;
  material_class: string;
  slip_threshold_n: number;
  safety_margin_percent: number;
  stress_distribution_kpa: number[][];
  deformation_field_mm: number[][];
}

export interface NeuromorphicReflex {
  edge_latency_ms: number;
  slip_detected: boolean;
  reflex_override_engaged: boolean;
}

export interface MultiDigitTopology {
  active_digits: string[];
  center_of_pressure: number[];
  torque_balance_index: number;
}

export interface AcousticFrictionProfile {
  dominant_frequency_hz: number;
  stick_slip_energy: number;
  harmonic_spectrum: number[];
}

export interface AfferentResponse {
  metadata: {
    project: string;
    system_status: string;
    timestamp_utc: string;
    model_stack: string[];
  };
  tactile_reasoning_cot: {
    target_class: string;
    tactile_chain_of_thought: string[];
    uncertainty_score: number;
    gating_decision: 'AUTHORIZED_SAFE_GRASP' | 'TACTILE_EXPLORATION_REQUIRED' | 'GRASP_DENIED';
  };
  physical_matrix: {
    surface_roughness_ra_um: number;
    friction_coefficient_static_mu: number;
    bulk_modulus_GPa: number;
    fragility_score: number;
    elastic_modulus_gpa: number;
    static_friction_coeff: number;
    shear_limit_n: number;
    material_class: string;
  };
  material_profile?: MaterialProfile;
  force_budget: {
    unit: string;
    max_allowed_normal_force_N: number;
    recommended_grasp_force_N: number;
    minimum_slippage_threshold_N: number;
    force_budget_margin_percent: number;
  };
  tactile_spatial_heatmap: {
    grid_resolution: [number, number];
    cells: TactileCell[];
    safe_zones: any[];
    prohibited_zones: any[];
  };
  benchmark_telemetry: {
    damage_prevention_confidence: string;
    estimated_latency_ms: number;
    force_over_tightening_reduction_percent: number;
    damage_avoidance_index_percent: number;
  };
  neuromorphic_reflex?: NeuromorphicReflex;
  multi_digit_topology?: MultiDigitTopology;
  acoustic_friction_profile?: AcousticFrictionProfile;
}

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
  neuromorphic_reflex?: NeuromorphicReflex;
  multi_digit_topology?: MultiDigitTopology;
  acoustic_friction_profile?: AcousticFrictionProfile;
}
