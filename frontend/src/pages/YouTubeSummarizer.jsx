// frontend/src/pages/YouTubeSummarizer.jsx - Complete Rewrite
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader, Copy, Check, LogOut, User, Menu, X, ArrowLeft, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { AuthContext } from '../AuthContext';

export default function YouTubeSummarizer() {
  const navigate = useNavigate();
  const { user, accessToken, handleLogout, refreshAccessToken } = useContext(AuthContext);
  
  // State management
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Question & RAG state
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);

  const models = [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', subtitle: 'Fast & Smart', cost: '$' },
    { id: 'claude-opus-4-1', name: 'Claude Opus 4.1', subtitle: 'Most Powerful', cost: '$$$' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', subtitle: 'Budget', cost: '$' }
  ];

  // Fetch user's jobs on mount
  useEffect(() => {
    fetchUserJobs();
  }, []);

  // Poll for job status updates
  useEffect(() => {
    if (selectedJob && selectedJob.status !== 'completed' && selectedJob.status !== 'failed') {
      const interval = setInterval(() => {
        fetchJobStatus(selectedJob.job_id);
      }, 2000);
      setPollInterval(interval);
      
      return () => clearInterval(interval);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [selectedJob]);

  const fetchUserJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/jobs', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.status === 401) {
        await refreshAccessToken();
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchJobStatus = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/job/${jobId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) throw new Error('Failed to fetch job');
      const data = await response.json();
      
      setSelectedJob(data);
      setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, status: data.status, summary: data.summary } : j));

      if (data.status === 'completed') {
        fetchJobQuestions(jobId);
      }
    } catch (err) {
      console.error('Error fetching job status:', err);
    }
  };

  const fetchJobQuestions = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/job/${jobId}/questions`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ videoUrl, model: selectedModel })
      });

      if (response.status === 401) {
        await refreshAccessToken();
        return handleSubmit(e);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create job');
      }

      const data = await response.json();
      setJobs(prev => [data, ...prev]);
      setSelectedJob(data);
      setVideoUrl('');
      setShowHistory(false);
      setQuestions([]);

    } catch (err) {
      setError(err.message || 'Error processing video');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim() || !selectedJob) return;

    setAskingQuestion(true);

    try {
      const response = await fetch(`http://localhost:8000/api/job/${selectedJob.job_id}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ question: questionText })
      });

      if (!response.ok) throw new Error('Failed to ask question');
      const data = await response.json();
      
      setQuestions(prev => [data, ...prev]);
      setQuestionText('');
    } catch (err) {
      setError(err.message || 'Error asking question');
    } finally {
      setAskingQuestion(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate('/');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">▶</span>
              </div>
              <span className="text-lg font-bold hidden sm:inline">SummaryAI</span>
            </div>

            <div className="hidden md:flex items-center gap-4 relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-800/50 transition"
              >
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>

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

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded transition"
              >
                Home
              </button>
              <button
                onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded transition"
              >
                Profile
              </button>
              <button
                onClick={() => { handleLogoutClick(); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-400 rounded transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Video Summarizer</h1>
                <p className="text-slate-400">Async processing with RAG-based Q&A</p>
              </div>

              {/* Input Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-red-600/30 transition">
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
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="hidden sm:inline">Processing...</span>
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
                          className={`p-4 rounded-lg border-2 transition text-left text-sm ${
                            selectedModel === model.id
                              ? 'border-red-600 bg-red-600/10'
                              : 'border-slate-700 hover:border-slate-600'
                          } disabled:opacity-50`}
                        >
                          <p className="font-semibold">{model.name}</p>
                          <p className="text-xs text-slate-400">{model.subtitle}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-600/10 border border-red-600/50 rounded-lg text-red-400 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Selected Job Details */}
              {selectedJob && (
                <div className="space-y-6">
                  {/* Job Status */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Job Status</h2>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedJob.status)}
                        <span className="text-sm font-semibold">{getStatusText(selectedJob.status)}</span>
                      </div>
                    </div>
                    
                    {selectedJob.status === 'processing' && (
                      <div className="mb-4">
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Processing transcript and creating embeddings...</p>
                      </div>
                    )}

                    {selectedJob.error_message && (
                      <div className="mb-4 p-3 bg-red-600/10 border border-red-600/50 rounded text-red-400 text-sm">
                        {selectedJob.error_message}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Video ID</p>
                        <p className="font-mono text-white mt-1">{selectedJob.video_id}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Model</p>
                        <p className="text-white mt-1">{models.find(m => m.id === selectedJob.model)?.name || selectedJob.model}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Created</p>
                        <p className="text-white mt-1">{new Date(selectedJob.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Processing Time</p>
                        <p className="text-white mt-1">
                          {selectedJob.completed_at 
                            ? `${Math.round((new Date(selectedJob.completed_at) - new Date(selectedJob.created_at)) / 1000)}s`
                            : 'Processing...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Section */}
                  {selectedJob.summary && (
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Summary</h2>
                        <button
                          onClick={() => copyToClipboard(selectedJob.summary)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm font-medium transition"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-slate-100 leading-relaxed whitespace-pre-wrap text-sm max-h-96 overflow-y-auto bg-slate-800/30 p-4 rounded">
                        {selectedJob.summary}
                      </div>
                    </div>
                  )}

                  {/* Q&A Section */}
                  {selectedJob.status === 'completed' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-red-600" />
                        Ask Questions About This Video
                      </h2>

                      <form onSubmit={handleAskQuestion} className="mb-6">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Ask something about the video content..."
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-red-600 text-sm transition"
                            disabled={askingQuestion}
                          />
                          <button
                            type="submit"
                            disabled={askingQuestion || !questionText.trim()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {askingQuestion ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </form>

                      {/* Questions List */}
                      {questions.length > 0 && (
                        <div className="space-y-4">
                          {questions.map((q) => (
                            <div key={q.question_id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                              <p className="font-semibold text-sm mb-2 text-red-400">Q: {q.question}</p>
                              {q.answer ? (
                                <p className="text-slate-100 text-sm whitespace-pre-wrap">A: {q.answer}</p>
                              ) : (
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Loader className="w-4 h-4 animate-spin" />
                                  <span className="text-sm">Processing...</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {questions.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No questions yet. Ask something about the video!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Job History */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Recent Jobs</h3>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    {showHistory ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {jobs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <p>No jobs yet</p>
                      <p className="text-xs mt-1">Your summarization jobs will appear here</p>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <button
                        key={job.job_id}
                        onClick={() => {
                          setSelectedJob(job);
                          setShowHistory(false);
                          fetchJobQuestions(job.job_id);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition text-sm ${
                          selectedJob?.job_id === job.job_id
                            ? 'bg-red-600/20 border-red-600'
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-mono text-xs truncate">{job.video_id}</p>
                          {getStatusIcon(job.status)}
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 SummaryAI. Async processing with RAG-based Q&A.</p>
        </div>
      </footer>
    </div>
  );
}