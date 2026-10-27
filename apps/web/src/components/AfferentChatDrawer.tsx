import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  provider?: string;
  providerColor?: string;
}

interface AfferentChatDrawerProps {
  currentContext: {
    materialProfile?: any;
    neuromorphicReflex?: any;
    multiDigitTopology?: any;
    acousticFrictionProfile?: any;
  };
}

export const AfferentChatDrawer: React.FC<AfferentChatDrawerProps> = ({ currentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hola. Soy Afferent-Omni Chat, tu asistente somatosensorial. Pregúntame sobre física tribológica, reflejos neuromórficos o telemetría en tiempo real.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([
    '¿Qué significa el Módulo de Young?',
    'Explica el Arco Reflejo Neuromórfico',
    'Analizar espectrograma acústico'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Map camelCase context to snake_case keys expected by backend
    const context = {
      material_profile: currentContext.materialProfile,
      neuromorphic_reflex: currentContext.neuromorphicReflex,
      multi_digit_topology: currentContext.multiDigitTopology,
      acoustic_friction_profile: currentContext.acousticFrictionProfile,
    };

    try {
      const res = await fetch('http://127.0.0.1:8002/api/v1/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, context })
      });

      const data = await res.json();

      const provider = data.category === 'nemotron' ? 'NVIDIA Nemotron' : data.category === 'llm' ? 'LLM' : 'Keyword';
      const providerColor = data.category === 'nemotron' ? '#76B900' : data.category === 'llm' ? '#8b5cf6' : '#9ca3af';

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider,
        providerColor,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (data.suggested_followups) {
        setSuggestedFollowups(data.suggested_followups);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Error de conexión con el backend de Afferent-Omni Chat.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    width: 380,
    height: 520,
    background: 'rgba(15, 15, 23, 0.95)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
            color: '#fff', padding: '12px 20px', borderRadius: 999,
            border: '1px solid rgba(139,92,246,0.4)',
            boxShadow: '0 20px 40px -10px rgba(124,58,237,0.5)',
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
            transition: 'transform 0.15s',
          }}
        >
          <Sparkles style={{ width: 18, height: 18 }} />
          <span>Afferent-Omni Chat</span>
        </button>
      )}

      {isOpen && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: 'rgba(30,30,46,0.8)',
            borderBottom: '1px solid rgba(139,92,246,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', animation: 'ping 1.5s infinite' }} />
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Afferent-Omni Chat
                </h3>
                <p style={{ fontSize: 10, color: '#c4b5fd', margin: 0 }}>Somatosensorial AI Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', gap: 8, justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.sender === 'assistant' && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot style={{ width: 14, height: 14, color: '#c4b5fd' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: 12, borderRadius: 12,
                  background: m.sender === 'user' ? '#7c3aed' : 'rgba(30,30,46,0.9)',
                  color: m.sender === 'user' ? '#fff' : '#e2e8f0',
                  border: m.sender === 'user' ? 'none' : '1px solid rgba(139,92,246,0.2)',
                  borderBottomRightRadius: m.sender === 'user' ? 4 : 12,
                  borderBottomLeftRadius: m.sender === 'assistant' ? 4 : 12,
                }}>
                  <p style={{ lineHeight: 1.6, margin: 0 }}>{m.text}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    {m.provider && m.sender === 'assistant' && (
                      <span style={{
                        fontSize: 8, padding: '1px 6px', borderRadius: 4,
                        background: `${m.providerColor}20`, color: m.providerColor,
                        border: `1px solid ${m.providerColor}40`, fontWeight: 600,
                      }}>
                        {m.provider === 'NVIDIA Nemotron' ? '⚡ NVIDIA Nemotron' : m.provider}
                      </span>
                    )}
                    <span style={{ fontSize: 9, opacity: 0.6 }}>{m.timestamp}</span>
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User style={{ width: 14, height: 14, color: '#c7d2fe' }} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#c4b5fd', fontSize: 12, fontStyle: 'italic' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 1s infinite' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 1s infinite 0.2s' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 1s infinite 0.4s' }} />
                <span>Analizando telemetría somatosensorial...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Followups Chips */}
          {suggestedFollowups.length > 0 && (
            <div style={{ padding: '8px 12px', background: 'rgba(10,10,15,0.6)', borderTop: '1px solid rgba(139,92,246,0.1)', display: 'flex', gap: 6, overflowX: 'auto' }}>
              {suggestedFollowups.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  style={{
                    background: 'rgba(88,28,135,0.4)', color: '#c4b5fd',
                    border: '1px solid rgba(139,92,246,0.3)', fontSize: 10,
                    padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div style={{ padding: 12, background: 'rgba(30,30,46,0.6)', borderTop: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregúntale al sistema..."
              style={{
                flex: 1, background: 'rgba(15,15,23,0.9)', border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fff', outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              style={{ background: '#7c3aed', color: '#fff', padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer' }}
            >
              <Send style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%,100% { transform: scale(2); opacity: 0; } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
};
