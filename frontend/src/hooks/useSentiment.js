import { useState } from 'react';
import { fetchSentiment, analyzeCustomText } from '../api/sentiment';

export function useSentiment() {
  const [sentimentData,    setSentimentData]    = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [customResult,     setCustomResult]     = useState(null);
  const [customLoading,    setCustomLoading]    = useState(false);
  const [customError,      setCustomError]      = useState('');

  const loadSentiment = (query, limit) => {
    setSentimentLoading(true);
    fetchSentiment(query, limit)
      .then((data) => { setSentimentData(data); setSentimentLoading(false); })
      .catch(() => setSentimentLoading(false));
  };

  const analyzeText = (text) => {
    setCustomLoading(true);
    setCustomError('');
    setCustomResult(null);
    analyzeCustomText(text)
      .then((data) => { setCustomResult(data); setCustomLoading(false); })
      .catch(() => { setCustomError('Analysis failed.'); setCustomLoading(false); });
  };

  return {
    sentimentData, sentimentLoading, loadSentiment,
    customResult, customLoading, customError, analyzeText,
  };
}
