import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Message AI Assistant...",
  autoFocus = true,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (trimmed && !isLoading) {
      onSendMessage(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className={`input-container ${isLoading ? 'is-loading' : ''}`}>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!text.trim() || isLoading}
          title="Send Message (Enter)"
        >
          {isLoading ? (
            <Loader2 size={18} className="spinner-icon" />
          ) : (
            <SendHorizontal size={18} />
          )}
        </button>
      </div>
      <p className="input-disclaimer">
        AI Assistant may display inaccurate info. Check important facts.
      </p>
    </form>
  );
};
