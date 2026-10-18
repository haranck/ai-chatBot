import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { History, Loader2, MessageSquareText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../services/api';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleCredential = async (credential?: string) => {
    if (!credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(credential);
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="login-eyebrow">Welcome to</p>
        <h1 className="login-wordmark">
          Pseudo <span>AI</span>
        </h1>
        <p className="login-subtitle">
          Sign in to start chatting. Your conversations are saved, so you can pick up where you
          left off on any device.
        </p>

        <div className="login-google">
          {busy ? (
            <div className="login-busy">
              <Loader2 size={18} className="spin" /> Signing you in…
            </div>
          ) : (
            <GoogleLogin
              onSuccess={(res) => void handleCredential(res.credential)}
              onError={() => setError('Google sign-in was cancelled or failed. Please try again.')}
              theme="filled_black"
              shape="pill"
              size="large"
              text="continue_with"
              width={280}
            />
          )}
        </div>

        {error && <p className="login-error">{error}</p>}

        <ul className="login-features">
          <li><MessageSquareText size={15} /> Ask about code, concepts, writing and more</li>
          <li><History size={15} /> Your chat history, always in the sidebar</li>
          <li><ShieldCheck size={15} /> Secure sign-in with your Google account</li>
        </ul>
      </div>
    </div>
  );
}
