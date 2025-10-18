import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Chrome, Facebook } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { handleGoogleLogin, handleFacebookLogin, isAuthenticated } = useContext(AuthContext);

  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🎥</h1>
          <h2 className="text-3xl font-bold text-white mb-2">Video Summarizer</h2>
          <p className="text-purple-300">Powered by AI Agent</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl p-8 backdrop-blur-sm border border-purple-500/20">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-2">Get Started</h3>
            <p className="text-slate-300 text-sm">
              Sign in to start summarizing YouTube videos with AI
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4">
            {/* Google Button */}
            <button
              onClick={initGoogleLogin}
              className="w-full px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            {/* Facebook Button */}
            <button
              onClick={initFacebookLogin}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
            >
              <Facebook className="w-5 h-5" />
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="px-3 text-slate-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </div>

          {/* Info Box */}
          <div className="bg-purple-900/30 border border-purple-500/20 rounded-lg p-4 text-sm text-slate-300">
            <p className="mb-2">
              <span className="font-semibold text-purple-300">✓ Secure Login</span>
            </p>
            <p>
              We use industry-standard OAuth 2.0 for secure authentication. Your data is protected with SSL encryption.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>By signing in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}