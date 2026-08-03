import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage as ChatMessageType } from '../types/chat';
import { Copy, Check, AlertCircle } from 'lucide-react';

interface Props {
  message: ChatMessageType;
  onRetry?: (text: string) => void;
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

// ── Inline renderer (bold, inline-code) ──────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2)
      return <code key={i}>{tok.slice(1, -1)}</code>;
    if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4)
      return <strong key={i}>{tok.slice(2, -2)}</strong>;
    return tok;
  });
}

// ── Full AI markdown-like renderer ───────────────────────────────────────────
const AiBody: React.FC<{ text: string }> = ({ text }) => {
  // Split on fenced code blocks: ```lang\n...\n```
  const segments = text.split(/(```[\w]*\n[\s\S]*?```)/g);

  return (
    <div className="ai-body">
      {segments.map((seg, si) => {
        const codeMatch = seg.match(/^```([\w]*)\n([\s\S]*)```$/);
        if (codeMatch) {
          return (
            <CodeBlock
              key={si}
              lang={codeMatch[1].trim()}
              code={codeMatch[2].trimEnd()}
            />
          );
        }

        // Render text lines
        const lines = seg.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: React.ReactNode[] = [];
        let listType: 'ul' | 'ol' | null = null;

        const flushList = (idx: number) => {
          if (listItems.length > 0) {
            if (listType === 'ol') {
              elements.push(<ol key={`list-${idx}`}>{listItems}</ol>);
            } else {
              elements.push(<ul key={`list-${idx}`}>{listItems}</ul>);
            }
            listItems = [];
            listType = null;
          }
        };

        lines.forEach((line, li) => {
          const h1 = line.match(/^# (.+)/);
          const h2 = line.match(/^## (.+)/);
          const h3 = line.match(/^### (.+)/);
          const ul = line.match(/^[\-\*] (.+)/);
          const ol = line.match(/^(\d+)\. (.+)/);

          if (h1) { flushList(li); elements.push(<h1 key={li}>{renderInline(h1[1])}</h1>); return; }
          if (h2) { flushList(li); elements.push(<h2 key={li}>{renderInline(h2[1])}</h2>); return; }
          if (h3) { flushList(li); elements.push(<h3 key={li}>{renderInline(h3[1])}</h3>); return; }

          if (ul) {
            if (listType === 'ol') flushList(li);
            listType = 'ul';
            listItems.push(<li key={li}>{renderInline(ul[1])}</li>);
            return;
          }
          if (ol) {
            if (listType === 'ul') flushList(li);
            listType = 'ol';
            listItems.push(<li key={li}>{renderInline(ol[2])}</li>);
            return;
          }

          flushList(li);

          if (line.trim() === '') {
            // skip leading blanks
            if (elements.length > 0) elements.push(<br key={li} />);
            return;
          }

          elements.push(<p key={li}>{renderInline(line)}</p>);
        });

        flushList(lines.length);
        return <React.Fragment key={si}>{elements}</React.Fragment>;
      })}
    </div>
  );
};

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
      <div className="msg-label">{isUser ? 'You' : 'Psuedo Ai'}</div>

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
          {isError && onRetry && (
            <button className="action-btn" onClick={() => onRetry(message.text)}>
              <AlertCircle size={12} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
