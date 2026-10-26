import React, { useState, useEffect } from 'react';

interface PresentationModeProps {
  active: boolean;
  onToggle: () => void;
  steps: { title: string; description: string; action?: () => void }[];
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ active, onToggle, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (active && steps[currentStep]?.action) {
      steps[currentStep].action!();
    }
  }, [active, currentStep]);

  if (!active) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(8px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div style={overlayStyle}>
      <div style={{ maxWidth: 600, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 12, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}>
          Step {currentStep + 1} of {steps.length}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          {steps[currentStep]?.title}
        </h2>
        <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, marginBottom: 32 }}>
          {steps[currentStep]?.description}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0}
            style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '8px 20px', color: '#c4b5fd', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', opacity: currentStep === 0 ? 0.4 : 1 }}
          >
            ← Previous
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((p) => p + 1)}
              style={{ background: 'linear-gradient(90deg,#8b5cf6,#a855f7)', border: 'none', borderRadius: 8, padding: '8px 20px', color: '#fff', cursor: 'pointer' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onToggle}
              style={{ background: 'linear-gradient(90deg,#10b981,#059669)', border: 'none', borderRadius: 8, padding: '8px 20px', color: '#fff', cursor: 'pointer' }}
            >
              Finish Demo
            </button>
          )}
        </div>
        <button
          onClick={onToggle}
          style={{ marginTop: 24, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 12 }}
        >
          Exit Presentation Mode (Esc)
        </button>
      </div>
    </div>
  );
};
