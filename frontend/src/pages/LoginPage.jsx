import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Chrome, Facebook, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleGoogleLogin, handleFacebookLogin, isAuthenticated } = useContext(AuthContext);

  // Redirect to summarizer if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/summarizer');
    }
  }, [isAuthenticated, navigate]);

  const initGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'openid email profile';
    const responseType = 'code';

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', responseType);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('access_type', 'offline');

    window.location.href = authUrl.toString();
  };

  const initFacebookLogin = () => {
    const clientId = import.meta.env.VITE_FACEBOOK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const scope = 'email,public_profile';

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('state', Math.random().toString(36));

    window.location.href = authUrl.toString();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold">▶</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">SummaryAI</h1>
            <p className="text-slate-400">Sign in to your account</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Get Started</h2>
              <p className="text-slate-400 text-sm">
                Sign in securely with your social account to start summarizing videos instantly
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Google Button */}
              <button
                onClick={initGoogleLogin}
                className="w-full px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg flex items-center justify-center gap-3 transition transform hover:scale-105 active:scale-95"
              >
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>

              {/* Facebook Button */}
              <button
                onClick={initFacebookLogin}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-3 transition transform hover:scale-105 active:scale-95"
              >
                <Facebook className="w-5 h-5" />
                <span>Continue with Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-slate-500 text-sm">Or</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Info Message */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1">→</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">One-Click Sign In</p>
                  <p className="text-xs text-slate-400">Fast and secure authentication</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1">🔒</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Your Data is Safe</p>
                  <p className="text-xs text-slate-400">OAuth 2.0 with SSL encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Start Instantly</p>
                  <p className="text-xs text-slate-400">Begin summarizing videos right away</p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Privacy */}
          <div className="mt-8 text-center text-slate-500 text-xs space-y-2">
            <p>
              By signing in, you agree to our{' '}
              <a href="#" className="hover:text-slate-300 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="hover:text-slate-300 underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-6 p-4 bg-gradient-to-r from-red-600/10 to-red-700/10 border border-red-600/20 rounded-lg text-center">
            <p className="text-xs text-red-400">
              🛡️ Enterprise-grade security. Your account is protected.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/95 border-t border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 SummaryAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}