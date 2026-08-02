import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from './types/chat';
import { sendChatMessage } from './services/api';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { ChatInput } from './components/ChatInput';
import { ChatMessageItem } from './components/ChatMessage';
import { AlertTriangle, X } from 'lucide-react';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    setErrorMessage(null);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: timeString,
      status: 'sent',
    };

    const loadingAiMsg: ChatMessage = {
      id: `ai-loading-${Date.now()}`,
      sender: 'ai',
      text: '',
      timestamp: timeString,
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMsg, loadingAiMsg]);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(promptText);

      const finalAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };

      setMessages((prev) => prev.map((msg) => (msg.id === loadingAiMsg.id ? finalAiMsg : msg)));
    } catch (err: any) {
      const errorText = err.message || 'Failed to reach AI service.';
      setErrorMessage(errorText);

      const errorAiMsg: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: `Error: ${errorText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
      };

      setMessages((prev) => prev.map((msg) => (msg.id === loadingAiMsg.id ? errorAiMsg : msg)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  const handleDismissError = () => {
    setErrorMessage(null);
  };

  return (
    <div className="app-container">
      <Header onNewChat={handleNewChat} hasMessages={messages.length > 0} />

      {errorMessage && (
        <div className="error-toast">
          <div className="error-toast-content">
            <AlertTriangle size={18} className="error-toast-icon" />
            <span>{errorMessage}</span>
          </div>
          <button className="error-toast-close" onClick={handleDismissError}>
            <X size={16} />
          </button>
        </div>
      )}

      <main className="main-content">
        {messages.length === 0 ? (
          <LandingView onSelectSuggestion={handleSendMessage}>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </LandingView>
        ) : (
          <div className="chat-flow-container">
            <div className="messages-list">
              {messages.map((msg) => (
                <ChatMessageItem 
                  key={msg.id} 
                  message={msg} 
                  onRetry={handleSendMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="sticky-input-wrapper">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
