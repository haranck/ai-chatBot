import axios, { type InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  ChatApiResponse,
  Conversation,
  StoredMessage,
} from '../types/chat';

// Production builds fall back to the deployed Render API if the env var isn't set
const rawApiUrl: string =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://ai-chatbot-gbzb.onrender.com/api' : 'http://localhost:3000/api');

// Accept the env value with or without a trailing "/" or "/api"
const trimmedApiUrl = rawApiUrl.trim().replace(/\/+$/, '');
const API_BASE_URL = trimmedApiUrl.endsWith('/api') ? trimmedApiUrl : `${trimmedApiUrl}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // sends the httpOnly refresh-token cookie
  timeout: 60000, //    60 seconds timeout
});

/* ── Access token: kept in memory only (never localStorage) ─────────────── */
let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

/* ── Refresh, one at a time ─────────────────────────────────────────────────
   Each refresh replaces the cookie, so parallel refreshes would race.
   Calls in this tab share one request; other tabs wait on a Web Lock. */
let refreshPromise: Promise<AuthResponse> | null = null;

const requestRefresh = async (): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
  setAccessToken(data.accessToken);
  return data;
};

export function refreshSession(): Promise<AuthResponse> {
  refreshPromise ??= (
    navigator.locks ? navigator.locks.request('auth-refresh', requestRefresh) : requestRefresh()
  ).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

// Access token expired (401)? Refresh once and replay the request.
apiClient.interceptors.response.use(undefined, async (error) => {
  const original = error?.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  const isAuthCall = original?.url?.startsWith('/auth/');

  if (error?.response?.status === 401 && original && !original._retried && !isAuthCall) {
    original._retried = true;
    try {
      await refreshSession();
    } catch {
      setAccessToken(null);
      onSessionExpired?.();
      return Promise.reject(error);
    }
    return apiClient(original);
  }
  return Promise.reject(error);
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. The server took too long to respond.';
    }
    const serverError = error.response?.data?.error;
    if (serverError) return serverError;
    if (error.response) return `Server error (${error.response.status})`;
    return 'Unable to connect to the server. Please try again.';
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

/* ── Auth ─────────────────────────────────────────────────────────────────── */
export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/google', { credential });
  setAccessToken(data.accessToken);
  return data;
}

export async function logoutSession(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

/* ── Chat & history ───────────────────────────────────────────────────────── */
export async function sendChatMessage(
  message: string,
  conversationId: string | null,
): Promise<ChatApiResponse> {
  const { data } = await apiClient.post<ChatApiResponse>('/chat', { message, conversationId });
  return data;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<{ conversations: Conversation[] }>('/conversations');
  return data.conversations;
}

export async function fetchMessages(conversationId: string): Promise<StoredMessage[]> {
  const { data } = await apiClient.get<{ messages: StoredMessage[] }>(
    `/conversations/${conversationId}/messages`,
  );
  return data.messages;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await apiClient.delete(`/conversations/${conversationId}`);
}
