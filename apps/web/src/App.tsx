import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { predictTactile } from './lib/api';
import { useTactileStream, type TactileStreamFrame } from './lib/websocket';
import { type AfferentResponse, type TactileCell, type NeuromorphicReflex, type MultiDigitTopology, type AcousticFrictionProfile } from './types/afferent';
import TactileHeatmap from './components/TactileHeatmap';
import TactileCoTPanel from './components/TactileCoTPanel';
import SafetyShield from './components/SafetyShield';
import ForceBudget from './components/ForceBudget';
import TactoEval from './components/TactoEval';
import MaterialInspector from './components/MaterialInspector';
import ClosedLoopControl from './components/ClosedLoopControl';
import MultiDigitSelector, { DIGIT_MAP } from './components/MultiDigitSelector';
import { ToastProvider, useToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/index.css';

const Tactile3DViewer = lazy(() => import('./components/Tactile3DViewer'));
const AcousticSpectrogram = lazy(() => import('./components/AcousticSpectrogram').then(m => ({ default: m.default })));
const NeuromorphicReflexHUD = lazy(() => import('./components/NeuromorphicReflexHUD').then(m => ({ default: m.default })));
const AfferentChatDrawer = lazy(() => import('./components/AfferentChatDrawer').then(m => ({ default: m.AfferentChatDrawer })));
const CustomDropdown = lazy(() => import('./components/CustomDropdown').then(m => ({ default: m.CustomDropdown })));
const SessionReplay = lazy(() => import('./components/SessionReplay').then(m => ({ default: m.SessionReplay })));
const MaterialCalibration = lazy(() => import('./components/MaterialCalibration').then(m => ({ default: m.MaterialCalibration })));
const ComplianceReport = lazy(() => import('./components/ComplianceReport').then(m => ({ default: m.ComplianceReport })));
const GraspPlanViewer = lazy(() => import('./components/GraspPlanViewer').then(m => ({ default: m.GraspPlanViewer })));
const AnomalyAlert = lazy(() => import('./components/AnomalyAlert').then(m => ({ default: m.AnomalyAlert })));
const LiveCharts = lazy(() => import('./components/LiveCharts').then(m => ({ default: m.LiveCharts })));
const DigitalTwin = lazy(() => import('./components/DigitalTwin').then(m => ({ default: m.DigitalTwin })));
const PresentationMode = lazy(() => import('./components/PresentationMode').then(m => ({ default: m.PresentationMode })));
const KeyboardShortcuts = lazy(() => import('./components/KeyboardShortcuts').then(m => ({ default: m.KeyboardShortcuts })));
const ShortcutHelp = lazy(() => import('./components/KeyboardShortcuts').then(m => ({ default: m.ShortcutHelp })));
const PerformanceMonitor = lazy(() => import('./components/PerformanceMonitor').then(m => ({ default: m.PerformanceMonitor })));
const SpaceMode = lazy(() => import('./components/SpaceMode').then(m => ({ default: m.SpaceMode })));
const SettingsPanel = lazy(() => import('./components/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const NvidiaModelStatus = lazy(() => import('./components/NvidiaModelStatus').then(m => ({ default: m.NvidiaModelStatus })));

function stressToCells(frame: TactileStreamFrame): TactileCell[] {
  const stress = frame.stress_distribution_kpa;
  const [w, h] = frame.grid_resolution;
  const flat = stress.flat();
  const max = flat.length ? Math.max(...flat) : 1;
  const cells: TactileCell[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = stress[y]?.[x] ?? 0;
      if (v <= 0.01) continue;
      const t = v / max;
      const risk: TactileCell['risk_level'] = t > 0.66 ? 'DANGER' : t > 0.33 ? 'CAUTION' : 'SAFE';
      cells.push({ x, y, max_pressure_kPa: Number(v.toFixed(2)), rigidity_score: Number((1 - t * 0.5).toFixed(2)), risk_level: risk });
    }
  }
  return cells;
}

function AppContent() {
  const toast = useToast();
  const [objectLabel, setObjectLabel] = useState('Wine Glass');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AfferentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [streaming, setStreaming] = useState(false);
  const [uThreshold, setUThreshold] = useState(0.25);
  const [fMax, setFMax] = useState(1.8);
  const [selectedDigit, setSelectedDigit] = useState('full');
  const [streamFrames, setStreamFrames] = useState<any[]>([]);
  const [apiBase, setApiBase] = useState('http://127.0.0.1:8002');
  const [presentationMode, setPresentationMode] = useState(false);
  const [shortcutHelp, setShortcutHelp] = useState(false);
  const [spaceMode, setSpaceMode] = useState(false);
  const [autoDemo, setAutoDemo] = useState(false);

  const { frame, connected, sendControls } = useTactileStream('ws://localhost:8002/ws/v1/tactile-stream');

  useEffect(() => {
    if (streaming) {
      sendControls({
        u_threshold: uThreshold, f_max: fMax, object_label: objectLabel,
        active_digits: DIGIT_MAP[selectedDigit] || ['thumb', 'index', 'middle'],
        space_mode: spaceMode,
      });
    }
  }, [uThreshold, fMax, objectLabel, streaming, selectedDigit, spaceMode, sendControls]);

  const runInference = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictTactile(objectLabel, 'dummy');
      setData(res);
      toast.addToast(`Inference complete: ${objectLabel} analyzed`, 'success');
    } catch (e: any) {
      setError(e.message);
      toast.addToast(`Inference failed: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const activeFrame = streaming ? frame : null;

  const heatmapCells = useMemo(() => {
    if (activeFrame) return stressToCells(activeFrame);
    return data?.tactile_spatial_heatmap.cells || [];
  }, [activeFrame, data]);

  const gridSize: [number, number] = activeFrame
    ? activeFrame.grid_resolution
    : data?.tactile_spatial_heatmap.grid_resolution || [32, 32];

  const deformationField = activeFrame ? activeFrame.deformation_field_mm : (data?.material_profile?.deformation_field_mm || null);
  const stressField = activeFrame ? activeFrame.stress_distribution_kpa : (data?.material_profile?.stress_distribution_kpa || null);

  const cotData = data ? data.tactile_reasoning_cot : null;
  const streamCot = activeFrame ? {
    target_class: objectLabel,
    tactile_chain_of_thought: [
      `Phase: ${activeFrame.phase}`,
      `Uncertainty ${(activeFrame.uncertainty_score * 100).toFixed(1)}% vs threshold ${(activeFrame.u_threshold * 100).toFixed(0)}%`,
      `Applied force ${activeFrame.applied_force_n.toFixed(2)} N / cap ${activeFrame.f_max_n.toFixed(2)} N`,
      `Shear limit ${activeFrame.shear_limit_n.toFixed(2)} N • ${activeFrame.material_class}`,
      activeFrame.gating_decision === 'TACTILE_EXPLORATION_REQUIRED'
        ? 'Micro-contact exploratory probe active (~0.2 N) to calibrate local stiffness.'
        : activeFrame.gating_decision === 'GRASP_DENIED'
        ? 'EMERGENCY ABORT: force/shear limit exceeded.'
        : 'Conservative grasp authorized with safety margin.',
    ],
    uncertainty_score: activeFrame.uncertainty_score,
    gating_decision: activeFrame.gating_decision as any,
  } : null;

  const displayCot = streamCot || cotData;

  // Collect stream frames for anomaly detection
  useEffect(() => {
    if (activeFrame) {
      setStreamFrames((prev) => {
        const next = [...prev, activeFrame];
        if (next.length > 200) return next.slice(-200);
        return next;
      });
    }
  }, [activeFrame]);

  const activeDigits = DIGIT_MAP[selectedDigit] || ['thumb', 'index', 'middle'];

  // Auto-Demo sequence
  useEffect(() => {
    if (!autoDemo) return;
    const sequence = async () => {
      setViewMode('3d');
      await new Promise((r) => setTimeout(r, 1000));
      runInference();
      await new Promise((r) => setTimeout(r, 3000));
      setStreaming(true);
      await new Promise((r) => setTimeout(r, 5000));
      setSelectedDigit('full');
      await new Promise((r) => setTimeout(r, 2000));
      setStreaming(false);
      setAutoDemo(false);
    };
    sequence();
  }, [autoDemo]);

  const shortcuts = [
    { key: ' ', action: () => setStreaming((p) => !p), description: 'Toggle live stream' },
    { key: '1', action: () => setSelectedDigit('thumb'), description: 'Select Thumb' },
    { key: '2', action: () => setSelectedDigit('index'), description: 'Select Index' },
    { key: '3', action: () => setSelectedDigit('middle'), description: 'Select Middle' },
    { key: '4', action: () => setSelectedDigit('full'), description: 'Select Full Hand' },
    { key: 'r', action: () => runInference(), description: 'Run inference' },
    { key: 'c', action: () => {}, description: 'Open chat (click button)' },
    { key: 'p', action: () => setPresentationMode(true), description: 'Presentation mode' },
    { key: '?', shift: true, action: () => setShortcutHelp(true), description: 'Show shortcuts' },
    { key: 'Escape', action: () => { setPresentationMode(false); setShortcutHelp(false); }, description: 'Close modals' },
  ];

  const presentationSteps = [
    { title: 'Welcome to Afferent-Omni', description: 'A causal vision-to-touch prior system for dexterous robotic manipulation. Let us walk through the key capabilities.', action: () => { setViewMode('3d'); } },
    { title: 'Tactile CoT & Afferent-Core', description: 'SAM 3.1 constructs a 32×32 spatial contact grid. Muse Wonder infers material properties and stress concentrations.', action: () => { runInference(); } },
    { title: 'Sim2Real Safety Shield', description: 'Dynamic force budget with uncertainty gating. Authorized safe grasp when uncertainty is below threshold.', action: () => { setStreaming(true); } },
    { title: '3D Gel Deformation', description: 'Real-time elastomer mesh deformation with glow spheres (green→red by force) and shear vector arrows.', action: () => { setViewMode('3d'); } },
    { title: 'Neuromorphic Reflex HUD', description: 'Edge computing reflex arc at <10 ms. Intercepts slip before central VLM processing.' },
    { title: 'Multi-Digit Topology', description: 'NASA JPL-style contact patches with torque balance index and center of pressure.', action: () => { setSelectedDigit('full'); } },
    { title: 'Acoustic-Slip Spectrogram', description: 'Stick-slip micro-vibration analysis at 314.3 Hz for surface discrimination.' },
    { title: 'Material Calibration', description: 'Bayesian micro-probe calibration for unknown materials.' },
    { title: 'Compliance Report', description: 'ISO 10218-1, ISO/TS 15066, IEC 61508 conformity validation.' },
    { title: 'Afferent-Omni Chat', description: 'AI copilot with real-time telemetry context, natural language queries, and suggested followups.' },
  ];

  // Omni telemetry resolution
  const neuromorphic: NeuromorphicReflex | null = activeFrame?.neuromorphic_reflex || data?.neuromorphic_reflex || null;
  const multiDigit: MultiDigitTopology | null = activeFrame?.multi_digit_topology || data?.multi_digit_topology || null;
  const acoustic: AcousticFrictionProfile | null = activeFrame?.acoustic_friction_profile || data?.acoustic_friction_profile || null;

  const materialProfile = data?.material_profile || (activeFrame ? {
    elastic_modulus_gpa: 0,
    static_friction_coeff: 0,
    shear_limit_n: activeFrame.shear_limit_n,
    material_class: activeFrame.material_class,
    slip_threshold_n: 0,
    safety_margin_percent: 0,
    stress_distribution_kpa: activeFrame.stress_distribution_kpa,
    deformation_field_mm: activeFrame.deformation_field_mm,
  } : null);

  const physical = data?.physical_matrix;

  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#9ca3af', fontSize: 14 }}>Loading Afferent-Omni...</div>}>
      <div className="app">
        <KeyboardShortcuts shortcuts={shortcuts} />
        <ShortcutHelp shortcuts={shortcuts} visible={shortcutHelp} onClose={() => setShortcutHelp(false)} />
        <PresentationMode active={presentationMode} onToggle={() => setPresentationMode(false)} steps={presentationSteps} />
      <header>
        <div className="logo">
          <div className="logo-dot" />
          <div>
            <h1>Afferent-Omni</h1>
            <p className="tagline">A Causal Vision-to-Touch Prior • Robots see, but do not feel. Afferent-Omni gives them the intuition of touch.</p>
          </div>
        </div>
        <div className="controls">
          <CustomDropdown
            options={['Igneous Rock', 'Tempered Glass', 'Biological Tissue', 'Wine Glass', 'Egg', 'Strawberry']}
            selected={objectLabel}
            onSelect={(opt) => setObjectLabel(opt)}
          />
          <input value={objectLabel} onChange={(e) => setObjectLabel(e.target.value)} placeholder="Or type a custom object label" />
          <button onClick={runInference} disabled={loading}>{loading ? 'Inferencing...' : 'Run Afferent Inference'}</button>
        </div>
      </header>
      <main>
        <div className="column">
          {displayCot && <TactileCoTPanel cot={displayCot} />}
          {displayCot && <SafetyShield gating={displayCot.gating_decision} uncertainty={displayCot.uncertainty_score} forceBudget={data?.force_budget} />}
          <ClosedLoopControl
            viewMode={viewMode}
            setViewMode={setViewMode}
            streaming={streaming}
            setStreaming={setStreaming}
            connected={connected}
            uThreshold={uThreshold}
            setUThreshold={setUThreshold}
            fMax={fMax}
            setFMax={setFMax}
            onParamsChange={(u, f) => sendControls({ u_threshold: u, f_max: f })}
          />
          <NeuromorphicReflexHUD reflex={neuromorphic} />
          <NvidiaModelStatus apiBase={apiBase} />
          <LiveCharts streamFrames={streamFrames} />
          <PerformanceMonitor streamFrames={streamFrames} />
          <SpaceMode active={spaceMode} onToggle={() => setSpaceMode(!spaceMode)} objectLabel={objectLabel} />
          <SettingsPanel apiBase={apiBase} onApiBaseChange={setApiBase} />
          <button
            onClick={() => setPresentationMode(true)}
            style={{ background: 'linear-gradient(90deg,#8b5cf6,#a855f7)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 11, width: '100%' }}
          >
            🎬 Presentation Mode
          </button>
          <button
            onClick={() => setAutoDemo(true)}
            disabled={autoDemo}
            style={{ background: autoDemo ? 'rgba(139,92,246,0.3)' : 'linear-gradient(90deg,#10b981,#059669)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: autoDemo ? 'not-allowed' : 'pointer', fontSize: 11, width: '100%' }}
          >
            {autoDemo ? '🎬 Running Auto-Demo...' : '🎬 Auto-Demo (for recording)'}
          </button>
          <button
            onClick={() => setShortcutHelp(true)}
            style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '8px 16px', color: '#c4b5fd', cursor: 'pointer', fontSize: 11, width: '100%' }}
          >
            ⌨️ Keyboard Shortcuts (?)
          </button>
        </div>
        <div className="column" style={{ alignItems: 'center', gap: 24 }}>
          <MultiDigitSelector selected={selectedDigit} onSelect={setSelectedDigit} topology={multiDigit} />
          {viewMode === '2d' ? (
            <TactileHeatmap cells={heatmapCells} gridSize={gridSize} />
          ) : (
            <ErrorBoundary name="3D Viewer">
              <Tactile3DViewer deformationField={deformationField} stressField={stressField} gridSize={gridSize} activeDigits={activeDigits} appliedForce={activeFrame ? activeFrame.applied_force_n : (data?.force_budget?.recommended_grasp_force_N || 1.1)} maxForceCap={activeFrame ? activeFrame.f_max_n : (data?.force_budget?.max_allowed_normal_force_N || 1.8)} />
            </ErrorBoundary>
          )}
          {data && <TactoEval telemetry={data.benchmark_telemetry} />}
          {activeFrame && (
            <div className="panel">
              <h3>Live Telemetry</h3>
              <div className="row"><span>Phase</span><strong>{activeFrame.phase}</strong></div>
              <div className="row"><span>t</span><strong>{activeFrame.t_ms.toFixed(0)} ms</strong></div>
              <div className="row"><span>Force</span><strong>{activeFrame.applied_force_n.toFixed(2)} N</strong></div>
              <div className="row"><span>Gating</span><span className="badge">{activeFrame.gating_decision}</span></div>
            </div>
          )}
          <AcousticSpectrogram profile={acoustic} />
        </div>
        <div className="column">
          {data && <ForceBudget forceBudget={data.force_budget} physical={data.physical_matrix} />}
          {(data || activeFrame) && <MaterialInspector materialProfile={materialProfile} physical={physical} />}
          {data && (
            <div className="panel">
              <h3>Model Stack</h3>
              <div className="cot-list">
                {data.metadata.model_stack.map((m, i) => <div key={i} className="cot-item"><span className="dot" />{m}</div>)}
              </div>
              <div className="status-bar" style={{ marginTop: 16 }}>Schema Validated • 32x32 Spatial Grid • Sim2Real Safety Shield • Omni-Tier Telemetry</div>
            </div>
          )}
          <MaterialCalibration apiBase="http://127.0.0.1:8002" objectLabel={objectLabel} />
          <GraspPlanViewer apiBase="http://127.0.0.1:8002" objectLabel={objectLabel} />
          <DigitalTwin apiBase="http://127.0.0.1:8002" objectLabel={objectLabel} />
          <AnomalyAlert apiBase="http://127.0.0.1:8002" context={{ streamFrames }} />
          <ComplianceReport apiBase="http://127.0.0.1:8002" context={{ force_budget: data?.force_budget, neuromorphicReflex: neuromorphic, tactile_reasoning_cot: data?.tactile_reasoning_cot, benchmark_telemetry: data?.benchmark_telemetry }} />
          <SessionReplay apiBase="http://127.0.0.1:8002" />
        </div>
      </main>
      {error && <div style={{ textAlign: 'center', color: 'var(--danger)', marginBottom: 24 }}>{error}</div>}
      <AfferentChatDrawer
        currentContext={{
          materialProfile,
          neuromorphicReflex: neuromorphic,
          multiDigitTopology: multiDigit,
          acousticFrictionProfile: acoustic,
        }}
      />
      </div>
      </Suspense>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
