import React from 'react';
import { Bot, Plus, Sparkles } from 'lucide-react';

interface HeaderProps {
  onNewChat: () => void;
  hasMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewChat, hasMessages }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-container">
          <Bot className="logo-icon" size={24} />
        </div>
        <div className="header-title-container">
          <h1 className="header-title">AI Assistant</h1>
          <span className="header-badge">
            <Sparkles size={11} className="badge-icon" /> Online
          </span>
        </div>
      </div>

      {hasMessages && (
        <button 
          className="new-chat-btn"
          onClick={onNewChat}
          title="Start new conversation"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      )}
    </header>
  );
};
