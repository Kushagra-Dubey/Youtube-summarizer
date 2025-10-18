import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader, Copy, Check, LogOut, User } from 'lucide-react';
import { AuthContext } from './AuthContext';

export default function YouTubeSummarizer() {
  const navigate = useNavigate();
  const { user, accessToken, handleLogout, refreshAccessToken } = useContext(AuthContext);
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');

  const models = [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Fast & Smart)', speed: 'Fast', cost: '$' },
    { id: 'claude-opus-4-1', name: 'Claude Opus 4.1 (Most Powerful)', speed: 'Slower', cost: '$$$' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Budget)', speed: 'Fastest', cost: '$' }
  ];

  const extractVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSummary('');

    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid link.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/summarize-from-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ videoUrl, videoId, model: selectedModel })
      });

      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        // Retry with new token
        return handleSubmit(e);
      }

      if (!response.ok) {
        throw new Error('Failed to summarize video');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || 'Error processing video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* User Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={handleLogoutClick}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            🎥 Video Summarizer
          </h1>
          <p className="text-purple-300 text-lg">
            Powered by AI Agent
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm border border-purple-500/20">
          {/* Form */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition"
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105 disabled:scale-100"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Summarize</span>
                  </>
                )}
              </button>
            </div>

            {/* Model Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-slate-300 font-medium">Model:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition disabled:opacity-50 cursor-pointer"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.cost}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Summary Output */}
          {summary && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Summary</h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-6 text-slate-100 text-base leading-relaxed whitespace-pre-wrap border border-slate-600/50">
                {summary}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!summary && !loading && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg">👉 Enter a YouTube URL to get started</p>
              <p className="text-sm mt-2 opacity-75">Supports YouTube, youtu.be, and other YouTube links</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <p className="text-slate-300 text-sm">
            <span className="text-purple-400 font-semibold">Note:</span> Make sure your Python backend is running on http://localhost:8000
          </p>
        </div>
      </div>
    </div>
  );
}