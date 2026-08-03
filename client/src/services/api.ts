import axios from 'axios';
import type { ChatApiRequest, ChatApiResponse } from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, //    30 seconds timeout
});

export const sendChatMessage = async (prompt: string): Promise<string> => {
  try {
    const payload: ChatApiRequest = {
      prompt,
      message: prompt, // Sending both to ensure compatibility with backend
    };

    const response = await apiClient.post<ChatApiResponse>('/chat', payload);

    if (response.data) {
      if (response.data.success === false && response.data.error) {
        throw new Error(response.data.error);
      }

      const replyText = response.data.reply || response.data.response;
      if (replyText) {
        return replyText;
      }
    }

    // Fallback if data is a raw string or under different property
    if (typeof response.data === 'string') {
      return response.data;
    }

    return "No response received from AI service.";
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. The server took too long to respond.');
      }
      if (error.response) {
        const serverError = error.response.data?.error || error.response.data?.message;
        throw new Error(serverError || `Server error (${error.response.status})`);
      } else if (error.request) {
        throw new Error('Unable to connect to the AI service. Please try again.');
      }
    }
    throw new Error(error.message || 'An unexpected error occurred while sending your message.');
  }
};
