import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '../types/chat';
import { Copy, Check, AlertCircle } from 'lucide-react';

interface Props {
  message: ChatMessageType;
  onRetry?: (message: ChatMessageType) => void;
}

// ── VSCode-style code block ───────────────────────────────────────────────────
const CodeBlock: React.FC<{ lang: string; code: string }> = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const language = lang || 'text';

  return (
    <div className="code-block">
      <div className="code-header">
        <span>{language}</span>
        <button className={`copy-code-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#1e1e1e',
          padding: '14px 16px',
          fontSize: '0.84rem',
          lineHeight: '1.6',
        }}
        codeTagProps={{
          style: {
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          },
        }}
        showLineNumbers={false}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// ── Markdown rendering (GFM: tables, quotes, links, task lists…) ─────────────

// Flatten rendered children back to plain text (used for code blocks)
function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

// The model often writes <br> inside table cells. Raw HTML is otherwise shown
// as plain text (safe), so turn only those tags into real line breaks.
type HastNode = { type: string; value?: string; children?: HastNode[] } & Record<string, unknown>;

function rehypeBrTags() {
  const walk = (node: HastNode) => {
    node.children?.forEach((child, i, siblings) => {
      if (child.type === 'raw' && /^<br\s*\/?>$/i.test(child.value?.trim() ?? '')) {
        siblings[i] = { type: 'element', tagName: 'br', properties: {}, children: [] };
      } else {
        walk(child);
      }
    });
  };
  return walk;
}

const markdownComponents: Components = {
  // Fenced code → VSCode-style block with copy button
  pre: ({ children }) => {
    const codeEl = React.Children.toArray(children)[0];
    const className = React.isValidElement<{ className?: string }>(codeEl)
      ? codeEl.props.className ?? ''
      : '';
    const lang = /language-(\S+)/.exec(className)?.[1] ?? '';
    return <CodeBlock lang={lang} code={textOf(children).replace(/\n$/, '')} />;
  },
  // Wide tables scroll sideways instead of breaking the layout
  table: ({ children }) => (
    <div className="table-wrap">
      <table>{children}</table>
    </div>
  ),
  a: ({ href, title, children }) => (
    <a href={href} title={title} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const AiBody: React.FC<{ text: string }> = ({ text }) => (
  <div className="ai-body">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeBrTags]}
      components={markdownComponents}
    >
      {text}
    </ReactMarkdown>
  </div>
);

// ── Main message item ─────────────────────────────────────────────────────────
export const ChatMessageItem: React.FC<Props> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);

  const isUser    = message.sender === 'user';
  const isError   = message.status === 'error';
  const isSending = message.status === 'sending';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`msg-row ${isUser ? 'user' : 'ai'}`}>
      <div className="msg-label">{isUser ? 'You' : 'Pseudo AI'}</div>

      <div className={`bubble ${isUser ? 'user' : 'ai'} ${isError ? 'error-bubble' : ''}`}>
        {isSending ? (
          <div className="typing">
            <span /><span /><span />
          </div>
        ) : isUser ? (
          <span>{message.text}</span>
        ) : (
          <AiBody text={message.text} />
        )}
      </div>

      {!isSending && !isUser && (
        <div className="msg-actions">
          {!isError && (
            <button
              className={`action-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
          {isError && onRetry && message.retryPrompt && (
            <button className="action-btn" onClick={() => onRetry(message)}>
              <AlertCircle size={12} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
