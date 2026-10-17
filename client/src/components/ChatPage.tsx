import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Conversation, User } from '../types/chat';
import {
  deleteConversation,
  fetchConversations,
  fetchMessages,
  getErrorMessage,
  sendChatMessage,
} from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { ChatInput } from './ChatInput';
import { ChatMessageItem } from './ChatMessage';
import { Sidebar } from './Sidebar';
import {
  X, AlertTriangle, Menu, SquarePen, Loader2,
  CodeXml, Bug, Lightbulb, CircleHelp, FileText, Languages, Mail, Network,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ── Starter prompts shown on the empty screen ──────────────────────────── */
const SUGGESTIONS: { icon: LucideIcon; title: string; subtitle: string; prompt: string }[] = [
  {
    icon: CodeXml,
    title: 'Write code',
    subtitle: 'A Python function to check prime numbers',
    prompt: 'Write a Python function that checks whether a number is prime, with a short explanation.',
  },
  {
    icon: Bug,
    title: 'Debug an error',
    subtitle: 'Why "undefined is not a function" happens',
    prompt: 'In JavaScript, what causes "TypeError: undefined is not a function" and how do I fix it?',
  },
  {
    icon: Lightbulb,
    title: 'Explain a concept',
    subtitle: 'How the internet works, in simple terms',
    prompt: 'Explain how the internet works in simple terms, step by step.',
  },
  {
    icon: CircleHelp,
    title: 'Ask anything',
    subtitle: 'What causes the seasons on Earth?',
    prompt: 'What causes the seasons on Earth?',
  },
  {
    icon: FileText,
    title: 'Write docs',
    subtitle: 'A README for a React + Node.js chat app',
    prompt: 'Write a README.md for a full-stack AI chat app built with React, Node.js, Express and MongoDB.',
  },
  {
    icon: Languages,
    title: 'Translate',
    subtitle: '"Good morning, how are you?" into 3 languages',
    prompt: 'Translate "Good morning, how are you?" into French, Hindi and Tamil.',
  },
  {
    icon: Mail,
    title: 'Draft an email',
    subtitle: 'Ask my manager for a day off',
    prompt: 'Draft a short, polite email to my manager asking for a day off next Friday.',
  },
  {
    icon: Network,
    title: 'Design a system',
    subtitle: 'Architecture for a URL shortener',
    prompt: 'How would you design a URL shortener like bit.ly? Cover the database, API and scaling.',
  },
];

let idCounter = 0;
const newId = (prefix: string) => `${prefix}-${++idCounter}`;
const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const timeNow = () => formatTime(new Date());
const nowIso = () => new Date().toISOString();

export function ChatPage({ user }: { user: User }) {
  const { signOut } = useAuth();
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId]           = useState<string | null>(null);
  const [listLoading, setListLoading]     = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [errorMessage, setError]          = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [kbHeight, setKbHeight]           = useState(0);   // keyboard offset in px
  const bottomRef = useRef<HTMLDivElement>(null);
  // Bumped when the user switches chats, so late responses for the old one are ignored
  const viewRef = useRef(0);

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

  /* ── Sidebar history ──────────────────────────────────────────────────── */
  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setListLoading(false));
  }, []);

  const startNewChat = () => {
    viewRef.current++;
    setActiveId(null);
    setMessages([]);
    setError(null);
    setHistoryLoading(false);
    setSidebarOpen(false);
  };

  const openChat = async (id: string) => {
    setSidebarOpen(false);
    if (id === activeId) return;

    const view = ++viewRef.current;
    setActiveId(id);
    setMessages([]);
    setError(null);
    setHistoryLoading(true);

    try {
      const stored = await fetchMessages(id);
      if (view !== viewRef.current) return;
      setMessages(stored.map((m) => ({
        id: m.id,
        sender: m.role === 'user' ? 'user' : 'ai',
        text: m.content,
        timestamp: formatTime(new Date(m.createdAt)),
        status: 'sent',
      })));
    } catch (err) {
      if (view === viewRef.current) setError(getErrorMessage(err));
    } finally {
      if (view === viewRef.current) setHistoryLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const chat = conversations.find((c) => c.id === id);
    if (!window.confirm(`Delete "${chat?.title ?? 'this chat'}"? This can't be undone.`)) return;

    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeId) startNewChat();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  /* ── Send message ─────────────────────────────────────────────────────── */
  const handleSend = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;
    setError(null);

    const view = viewRef.current;
    const ts = timeNow();
    const loadingId = newId('ai-loading');

    setMessages(prev => [
      ...prev,
      { id: newId('u'), sender: 'user', text: promptText, timestamp: ts, status: 'sent' },
      { id: loadingId, sender: 'ai', text: '', timestamp: ts, status: 'sending' },
    ]);
    setIsLoading(true);

    try {
      const { reply, conversationId, title } = await sendChatMessage(promptText, activeId);

      // New chat goes to the top of the sidebar; an existing one moves up
      setConversations(prev => [
        { id: conversationId, title, updatedAt: nowIso() },
        ...prev.filter(c => c.id !== conversationId),
      ]);

      if (view !== viewRef.current) return; // user opened another chat meanwhile
      setActiveId(conversationId);
      setMessages(prev => prev.map(m => m.id === loadingId
        ? { id: newId('ai'), sender: 'ai', text: reply, timestamp: timeNow(), status: 'sent' }
        : m));
    } catch (err) {
      if (view !== viewRef.current) return;
      const msg = getErrorMessage(err);
      setError(msg);
      setMessages(prev => prev.map(m => m.id === loadingId
        ? {
            id: newId('ai-err'),
            sender: 'ai',
            text: `Error: ${msg}`,
            timestamp: timeNow(),
            status: 'error',
            retryPrompt: promptText,
          }
        : m));
    } finally {
      setIsLoading(false);
    }
  };

  // Drop the failed question and its error, then ask again
  const handleRetry = (failed: ChatMessage) => {
    if (!failed.retryPrompt) return;
    setMessages(prev => {
      const i = prev.findIndex(m => m.id === failed.id);
      return i > 0 ? [...prev.slice(0, i - 1), ...prev.slice(i + 1)] : prev;
    });
    void handleSend(failed.retryPrompt);
  };

  const activeTitle = conversations.find(c => c.id === activeId)?.title;
  const firstName = user.name.split(' ')[0];

  return (
    /*
     * paddingBottom pushes the whole app up by the exact keyboard height.
     * This keeps the input visible above the keyboard on every mobile browser.
     */
    <div className="app" style={{ paddingBottom: kbHeight }}>

      <Sidebar
        user={user}
        conversations={conversations}
        activeId={activeId}
        loading={listLoading}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onSelect={(id) => void openChat(id)}
        onDelete={(id) => void handleDelete(id)}
        onSignOut={() => void signOut()}
      />

      <main className="chat-main">
        {/* Top bar — mobile only */}
        <header className="chat-topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open chat history">
            <Menu size={20} />
          </button>
          <span className="topbar-title">{activeTitle ?? 'Psuedo Ai'}</span>
          <button className="icon-btn" onClick={startNewChat} aria-label="New chat">
            <SquarePen size={18} />
          </button>
        </header>

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
          {historyLoading ? (
            <div className="history-loading">
              <Loader2 size={22} className="spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="landing">
              <h1 className="landing-title">Hi {firstName}, what can I help with?</h1>
              <p className="landing-desc">
                Pick a starter below or type your own question.
              </p>
              <div className="suggestions-grid">
                {SUGGESTIONS.map(({ icon: Icon, title, subtitle, prompt }) => (
                  <button
                    key={title}
                    className="suggestion-card"
                    onClick={() => void handleSend(prompt)}
                    disabled={isLoading}
                  >
                    <Icon size={18} className="suggestion-icon" />
                    <span className="suggestion-title">{title}</span>
                    <span className="suggestion-subtitle">{subtitle}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-inner">
              {messages.map(msg => (
                <ChatMessageItem key={msg.id} message={msg} onRetry={handleRetry} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input — always at bottom, centered */}
        <div className="input-area">
          <ChatInput onSendMessage={(text) => void handleSend(text)} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
