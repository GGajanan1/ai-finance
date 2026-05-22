import { useState, useCallback, useEffect } from 'react';
import { sendMessage, getChatHistory, appendChatHistory, clearChatHistory } from '../api/chat';
import { useAuth } from '../context/AuthContext';

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // Load saved history from DB on mount
  useEffect(() => {
    if (!user) return;
    getChatHistory()
      .then(({ chatHistory }) => {
        if (chatHistory?.length) setMessages(chatHistory);
      })
      .catch(() => {});
  }, [user]);

  const send = useCallback(async (text) => {
    if (!text.trim()) return;
    setError('');

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const next    = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      // Send last 20 messages as history context
      const history = next.slice(-20).map(({ role, content }) => ({ role, content }));
      const res = await sendMessage(text, history.slice(0, -1)); // exclude the new message itself

      const aiMsg = {
        role:       'assistant',
        content:    res.response,
        tools_used: res.tools_used || [],
        timestamp:  new Date().toISOString(),
      };

      const final = [...next, aiMsg];
      setMessages(final);

      // Persist both turns to DB
      if (user) {
        appendChatHistory([
          { role: 'user',      content: text },
          { role: 'assistant', content: res.response },
        ]).catch(() => {});
      }
    } catch (e) {
      setError('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [messages, user]);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    if (user) clearChatHistory().catch(() => {});
  }, [user]);

  return { messages, loading, error, send, clearHistory };
}
