import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Copy, ExternalLink, History, Loader2, MessageSquareText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../services/api';

// In-app browsers (Instagram, Facebook, LinkedIn, Android WebViews, iOS app views)
// can't open Google's sign-in popup, and Google blocks sign-in inside them anyway.
const ua = navigator.userAgent;
const isAndroid = /Android/i.test(ua);
const isInAppBrowser =
  /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Snapchat|Line\/|MicroMessenger|musical_ly|BytedanceWebview|Twitter/i.test(ua) ||
  (isAndroid && /; wv\)/.test(ua)) ||
  (/iPhone|iPad|iPod/i.test(ua) && !/Safari\//.test(ua));

// Android: hands the current page to Chrome
const chromeIntentUrl = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=https;package=com.android.chrome;end`;

export function LoginScreen() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
    } catch {
      setError(`Copy this link and open it in your browser: ${location.href}`);
    }
  };

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

        {isInAppBrowser && (
          <div className="login-inapp">
            <p>
              Google sign-in doesn't work inside this app. Open this page in{' '}
              {isAndroid ? 'Chrome' : 'Safari'} to sign in.
            </p>
            <div className="login-inapp-actions">
              {isAndroid && (
                <a className="login-inapp-btn primary" href={chromeIntentUrl}>
                  <ExternalLink size={14} /> Open in Chrome
                </a>
              )}
              <button type="button" className="login-inapp-btn" onClick={() => void copyLink()}>
                <Copy size={14} /> {copied ? 'Link copied' : 'Copy link'}
              </button>
            </div>
            <p className="login-inapp-hint">
              Or tap the app's ⋯ menu and choose "Open in browser".
            </p>
          </div>
        )}

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
