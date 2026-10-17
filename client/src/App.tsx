import { Loader2 } from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { ChatPage } from './components/ChatPage';
import './App.css';

export default function App() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="splash">
        <Loader2 size={22} className="spin" />
      </div>
    );
  }

  return status === 'signedIn' && user
    ? <ChatPage key={user.id} user={user} />
    : <LoginScreen />;
}
