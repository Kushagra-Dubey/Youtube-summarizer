import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Play, Zap, Shield, Clock, BarChart3, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/summarizer');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-bold">SummaryAI</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="hover:text-red-600 transition">Features</a>
              <a href="#how-it-works" className="hover:text-red-600 transition">How it Works</a>
              <a href="#pricing" className="hover:text-red-600 transition">Pricing</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/summarizer')}
                    className="px-4 py-2 hover:text-red-600 transition"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition"
                  >
                    Profile
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full font-medium transition"
                >
                  Sign In
                </button>
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
              <a href="#features" className="block hover:text-red-600 transition">Features</a>
              <a href="#how-it-works" className="block hover:text-red-600 transition">How it Works</a>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { navigate('/summarizer'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:text-red-600 transition"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition"
                  >
                    Profile
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full font-medium transition"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                Summarize Videos in
                <span className="text-red-600"> Seconds</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Convert YouTube videos to concise summaries. Save time, get insights, stay informed. Powered by advanced AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-full font-bold text-lg transition flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-full font-bold text-lg transition">
                  Watch Demo
                </button>
              </div>
              <p className="text-slate-400 text-sm mt-6">No credit card required • Free to try</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-red-600/50 transition">
                <div className="aspect-video bg-gradient-to-br from-red-600/20 to-slate-800 rounded-lg flex items-center justify-center mb-6">
                  <Play className="w-16 h-16 text-red-600 opacity-50" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-400">Everything you need to save time</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                desc: 'Get summaries in seconds, not minutes. Powered by advanced AI technology.'
              },
              {
                icon: Clock,
                title: 'Save Hours',
                desc: 'Skip through long videos and extract key insights instantly.'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                desc: 'Your data is encrypted and never shared with third parties.'
              },
              {
                icon: BarChart3,
                title: 'Smart Models',
                desc: 'Choose from multiple AI models for different summary styles.'
              },
              {
                icon: Play,
                title: 'All Video Types',
                desc: 'Works with tutorials, lectures, vlogs, podcasts, and more.'
              },
              {
                icon: ArrowRight,
                title: 'Easy Integration',
                desc: 'Simple copy-paste of YouTube URL - that\'s it!'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-red-600/50 transition cursor-pointer hover:shadow-lg hover:shadow-red-600/10">
                <feature.icon className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Three simple steps to summarize any video</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Paste URL', desc: 'Copy any YouTube link and paste it' },
              { num: '2', title: 'Choose Model', desc: 'Select your preferred AI model' },
              { num: '3', title: 'Get Summary', desc: 'Receive instant comprehensive summary' }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 hover:scale-110 transition">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Save Your Time?</h2>
          <p className="text-xl text-red-100 mb-8">Join thousands of users who summarize videos faster</p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-black hover:bg-slate-900 text-white rounded-full font-bold text-lg transition flex items-center justify-center gap-2 mx-auto"
          >
            Start Summarizing Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400">© 2024 SummaryAI. All rights reserved.</p>
            <div className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}