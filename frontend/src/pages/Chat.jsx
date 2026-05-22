import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, User, Loader2, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../hooks/useChat';
import '../styles/pages/Chat.css';

const SUGGESTED = [
  'Analyze AAPL fundamentals',
  "What's the macro outlook for India?",
  'Compare MSFT vs GOOGL',
  'Explain yield curve inversion',
];

const Chat = () => {
  const { messages, loading, error, send, clearHistory } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    send(input.trim());
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="chat-page">
      <header className="page-header chat-page-header">
        <div>
          <h1>AI Chat Assistant</h1>
          <p>Powered by Groq · LangChain · FinBERT tools</p>
        </div>
        {messages.length > 0 && (
          <button className="btn-secondary" onClick={clearHistory}>
            <Trash2 size={15} /> Clear history
          </button>
        )}
      </header>

      {/* Message area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon"><Bot size={40} /></div>
            <h3>How can I help you today?</h3>
            <p>Ask me anything about stocks, markets, or economics.</p>
            <div className="chat-suggestions">
              {SUGGESTED.map((s) => (
                <button key={s} className="chat-suggestion-btn" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-wrap chat-bubble-wrap--${msg.role}`}>
              <div className={`chat-avatar chat-avatar--${msg.role}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`chat-bubble chat-bubble--${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <>
                    <div className="markdown-body chat-markdown">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.tools_used?.length > 0 && (
                      <div className="chat-tools-used">
                        <Zap size={11} />
                        {msg.tools_used.map((t) => (
                          <span key={t} className="chat-tool-badge">{t.replace(/_/g, ' ')}</span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="chat-bubble-wrap chat-bubble-wrap--assistant">
            <div className="chat-avatar chat-avatar--assistant"><Bot size={16} /></div>
            <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        {error && <p style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '0.85rem' }}>{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about any stock, market, or economic concept…"
          rows={1}
          className="chat-input"
          disabled={loading}
        />
        <button type="submit" className="chat-send-btn" disabled={!input.trim() || loading}>
          {loading ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};

export default Chat;
