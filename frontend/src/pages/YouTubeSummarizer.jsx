import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader, Copy, Check, LogOut, User, Menu, X, ArrowLeft, MoreVertical } from 'lucide-react';
import { AuthContext } from '../AuthContext';

export default function YouTubeSummarizer() {
  const navigate = useNavigate();
  const { user, accessToken, handleLogout, refreshAccessToken } = useContext(AuthContext);
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const models = [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', subtitle: 'Fast & Smart', cost: '$' },
    { id: 'claude-opus-4-1', name: 'Claude Opus 4.1', subtitle: 'Most Powerful', cost: '$$$' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', subtitle: 'Budget', cost: '$' }
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
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
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
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">▶</span>
              </div>
              <span className="text-lg font-bold hidden sm:inline">SummaryAI</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </button>
            </div>

            {/* User Menu - Desktop */}
            <div className="hidden md:flex items-center gap-4 relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-800/50 transition"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:inline">{user?.name?.split(' ')[0]}</span>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-48 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl">
                  <div className="p-4 border-b border-slate-800">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => { handleLogoutClick(); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-400 transition flex items-center gap-2 border-t border-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-4 border-t border-slate-800 pt-4">
              <button
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded transition flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => { handleLogoutClick(); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-400 rounded transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">Video Summarizer</h1>
            <p className="text-xl text-slate-400">Paste a YouTube URL and get instant summaries powered by AI</p>
          </div>

          {/* Input Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 mb-8 hover:border-red-600/30 transition">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3">YouTube URL</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-red-600 transition"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span className="hidden sm:inline">Summarizing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span className="hidden sm:inline">Summarize</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Model Selector */}
              <div>
                <label className="block text-sm font-semibold mb-3">AI Model</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setSelectedModel(model.id)}
                      disabled={loading}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        selectedModel === model.id
                          ? 'border-red-600 bg-red-600/10'
                          : 'border-slate-700 hover:border-slate-600'
                      } disabled:opacity-50`}
                    >
                      <p className="font-semibold text-sm">{model.name}</p>
                      <p className="text-xs text-slate-400">{model.subtitle}</p>
                      <p className="text-xs text-slate-500 mt-1">{model.cost}</p>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-600/10 border border-red-600/50 rounded-lg text-red-400 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Summary Output */}
          {summary && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Summary</h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-sm font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-slate-100 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
              <p className="text-xs text-slate-500 text-center">
                Summary generated by {models.find(m => m.id === selectedModel)?.name}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!summary && !loading && (
            <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-lg">
              <Send className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
              <p className="text-xl text-slate-300 mb-2">Ready to summarize?</p>
              <p className="text-slate-400">Enter a YouTube URL above to get started</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 SummaryAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}