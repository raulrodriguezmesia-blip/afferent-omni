import React, { useState, useRef, useEffect } from 'react';

interface CustomDropdownProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: 220,
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    display: 'inline-flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    color: '#e5e7eb',
    background: 'rgba(19, 17, 28, 0.8)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    marginTop: 8,
    width: '100%',
    borderRadius: 12,
    background: 'rgba(19, 17, 28, 0.95)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(16px)',
    padding: '6px 0',
    zIndex: 50,
    transformOrigin: 'top right',
    animation: 'fadeInZoom 0.15s ease-out',
  };

  const itemBase: React.CSSProperties = {
    width: '100%',
    textAlign: 'left',
    padding: '10px 16px',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    borderLeft: '2px solid transparent',
  };

  return (
    <div style={containerStyle} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.6)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.3)'; }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          style={{ marginLeft: 8, color: '#a78bfa', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div style={menuStyle}>
          {options.map((option) => {
            const isSelected = selected === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                style={{
                  ...itemBase,
                  background: isSelected ? 'rgba(124, 58, 237, 0.3)' : 'transparent',
                  color: isSelected ? '#c4b5fd' : '#d1d5db',
                  fontWeight: isSelected ? 600 : 400,
                  borderLeftColor: isSelected ? '#8b5cf6' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(88, 28, 135, 0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                onMouseLeave={(e) => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'; } }}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
      <style>{`
        @keyframes fadeInZoom {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
