import React, { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../types/chat';
import { User, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (text: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);

  const isUser = message.sender === 'user';
  const isError = message.status === 'error';
  const isSending = message.status === 'sending';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'ai-row'}`}>
      <div className="message-wrapper">
        <div className={`avatar ${isUser ? 'user-avatar' : 'ai-avatar'}`}>
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>

        <div className="message-content">
          <div className="message-meta">
            <span className="sender-name">{isUser ? 'You' : 'AI Assistant'}</span>
            <span className="message-time">{message.timestamp}</span>
          </div>

          <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'} ${isError ? 'error-bubble' : ''}`}>
            {isSending ? (
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            ) : (
              <div className="message-text">
                {message.text.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < message.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {!isSending && (
            <div className="message-actions">
              {!isUser && !isError && (
                <button 
                  className="action-btn" 
                  onClick={handleCopy}
                  title="Copy message"
                >
                  {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              {isError && onRetry && (
                <button 
                  className="action-btn retry-btn"
                  onClick={() => onRetry(message.text)}
                >
                  <AlertCircle size={14} />
                  <span>Retry request</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
