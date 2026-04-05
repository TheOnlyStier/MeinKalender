import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../api/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: '👋 Hey Nils! Was kann ich für dich planen?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const data = await api.post<{ response: string }>('/chat', {
        message: text,
        sessionId: 'web-default',
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verbindung fehlgeschlagen';
      setMessages((prev) => [...prev, { role: 'assistant', text: `❌ ${errorMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    await api.delete('/chat?sessionId=web-default').catch(() => {});
    setMessages([{ role: 'assistant', text: '🔄 Konversation zurückgesetzt. Wie kann ich helfen?' }]);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827' }}>KI Assistent</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Powered by Claude</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={clearChat}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '12px',
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                ...(msg.role === 'user'
                  ? { backgroundColor: '#2563eb', color: '#ffffff', borderBottomRightRadius: '4px' }
                  : { backgroundColor: '#f3f4f6', color: '#111827', borderBottomLeftRadius: '4px' }),
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#f3f4f6',
                color: '#9ca3af',
                fontSize: '14px',
              }}
            >
              Denke nach...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht an den Assistenten..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 16px',
            backgroundColor: loading || !input.trim() ? '#93c5fd' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
};
