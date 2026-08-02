import React from 'react';
import { Sparkles, Code2, Compass, Lightbulb, MessageSquareText } from 'lucide-react';

interface LandingViewProps {
  onSelectSuggestion: (promptText: string) => void;
  children?: React.ReactNode;
}

interface SuggestionCard {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  prompt: string;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSelectSuggestion, children }) => {
  const suggestions: SuggestionCard[] = [
    {
      icon: <Code2 size={20} className="card-icon code" />,
      title: "Write a React Hook",
      subtitle: "Custom hook for local storage state management",
      prompt: "Write a clean React custom hook in TypeScript for syncing state with localStorage.",
    },
    {
      icon: <Lightbulb size={20} className="card-icon idea" />,
      title: "Brainstorm Ideas",
      subtitle: "Innovative feature ideas for an AI app",
      prompt: "Give me 5 creative ideas for an AI-powered developer productivity tool.",
    },
    {
      icon: <Compass size={20} className="card-icon explain" />,
      title: "Explain Concept",
      subtitle: "Quantum Computing in simple terms",
      prompt: "Explain the fundamentals of Quantum Computing like I'm 12 years old.",
    },
    {
      icon: <MessageSquareText size={20} className="card-icon draft" />,
      title: "Draft an Email",
      subtitle: "Professional follow-up after project kickoff",
      prompt: "Draft a concise, professional follow-up email after a successful project kickoff call.",
    },
  ];

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <div className="sparkle-glow">
          <Sparkles className="hero-icon" size={36} />
        </div>
        <h2 className="landing-title">What would you like to know today?</h2>
        <p className="landing-subtitle">
          Your intelligent assistant is ready to help with coding, writing, research, and analysis.
        </p>
      </div>

      <div className="landing-input-wrapper">
        {children}
      </div>

      <div className="suggestions-grid">
        {suggestions.map((item, index) => (
          <button
            key={index}
            className="suggestion-card"
            onClick={() => onSelectSuggestion(item.prompt)}
          >
            <div className="suggestion-header">
              {item.icon}
              <span className="suggestion-title">{item.title}</span>
            </div>
            <p className="suggestion-subtitle">{item.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
