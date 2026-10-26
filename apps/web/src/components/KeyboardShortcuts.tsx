import React, { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ shortcuts }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      for (const s of shortcuts) {
        if (
          e.key.toLowerCase() === s.key.toLowerCase() &&
          !!e.ctrlKey === !!s.ctrl &&
          !!e.shiftKey === !!s.shift
        ) {
          e.preventDefault();
          s.action();
          break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);

  return null;
};

export const ShortcutHelp: React.FC<{ shortcuts: Shortcut[]; visible: boolean; onClose: () => void }> = ({ shortcuts, visible, onClose }) => {
  if (!visible) return null;
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,10,15,0.85)',
    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ background: 'rgba(19,17,28,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: 24, minWidth: 320 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 14, color: '#c4b5fd', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Keyboard Shortcuts</h3>
        {shortcuts.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(36,36,47,0.5)', fontSize: 12 }}>
            <span style={{ color: '#d1d5db' }}>{s.description}</span>
            <kbd style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 4, padding: '2px 8px', color: '#c4b5fd', fontSize: 11, fontFamily: 'monospace' }}>
              {s.ctrl ? 'Ctrl+' : ''}{s.shift ? 'Shift+' : ''}{s.key.toUpperCase()}
            </kbd>
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 16, background: 'linear-gradient(90deg,#8b5cf6,#a855f7)', border: 'none', borderRadius: 8, padding: '6px 16px', color: '#fff', cursor: 'pointer', fontSize: 11, width: '100%' }}>
          Close
        </button>
      </div>
    </div>
  );
};
