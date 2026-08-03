import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from './types/chat';
import { sendChatMessage } from './services/api';
import { ChatInput } from './components/ChatInput';
import { ChatMessageItem } from './components/ChatMessage';
import { X, AlertTriangle, Plus } from 'lucide-react';
import './App.css';

export default function App() {
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [errorMessage, setError]    = useState<string | null>(null);
  const [kbHeight, setKbHeight]     = useState(0);   // keyboard offset in px
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ── Visual Viewport / keyboard detection ─────────────────────────────── */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onResize = () => {
      // difference between layout height and visible viewport height = keyboard
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKbHeight(offset);
    };

    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, []);

  /* ── Scroll to bottom when messages change ────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Send message ─────────────────────────────────────────────────────── */
  const handleSend = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;
    setError(null);

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: ts,
      status: 'sent',
    };
    const loadingMsg: ChatMessage = {
      id: `ai-loading-${Date.now()}`,
      sender: 'ai',
      text: '',
      timestamp: ts,
      status: 'sending',
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(promptText);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
      setMessages(prev => prev.map(m => m.id === loadingMsg.id ? aiMsg : m));
    } catch (err: any) {
      const msg = err.message || 'Failed to reach AI service.';
      setError(msg);
      const errMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Error: ${msg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
      };
      setMessages(prev => prev.map(m => m.id === loadingMsg.id ? errMsg : m));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    /*
     * paddingBottom pushes the whole app up by the exact keyboard height.
     * This keeps the input visible above the keyboard on every mobile browser.
     */
    <div className="app" style={{ paddingBottom: kbHeight }}>

      {/* Brand — fixed top-left */}
      <div className="brand">Psuedo Ai</div>

      {/* New chat — fixed top-right */}
      <button className="new-chat-btn" onClick={handleNewChat}>
        <Plus size={14} />
        <span>New Chat</span>
      </button>

      {/* Error toast */}
      {errorMessage && (
        <div className="error-toast">
          <AlertTriangle size={15} />
          <span style={{ flex: 1 }}>{errorMessage}</span>
          <button onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Middle — scrollable content */}
      <div className="middle">
        {messages.length === 0 ? (
          <div className="landing">
            <h1 className="landing-title">What can I help with?</h1>
            <p className="landing-desc">
              I know <strong>programming</strong> (Python, JS, Java, C++ and more),{' '}
              <strong>web dev</strong>, <strong>databases</strong>, <strong>DSA</strong>,{' '}
              <strong>OS &amp; networking</strong>, <strong>ML / AI</strong>,{' '}
              <strong>cybersecurity</strong>, <strong>cloud</strong>, and{' '}
              <strong>math &amp; stats</strong>.
            </p>
            <div className="landing-chips">
              <span className="chip">Code &amp; debug</span>
              <span className="chip">Explain concepts</span>
              <span className="chip">Design patterns</span>
              <span className="chip">Study help</span>
              <span className="chip">Best practices</span>
              <span className="chip">Career advice</span>
            </div>
          </div>
        ) : (
          <div className="messages-inner">
            {messages.map(msg => (
              <ChatMessageItem key={msg.id} message={msg} onRetry={handleSend} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input — always at bottom, centered */}
      <div className="input-area">
        <ChatInput onSendMessage={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
