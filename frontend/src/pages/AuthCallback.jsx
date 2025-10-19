import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { Loader } from 'lucide-react';

export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleGoogleLogin } = useContext(AuthContext);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Google login failed: ${errorParam}`);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const performLogin = async () => {
      try {
        const success = await handleGoogleLogin(code);
        if (success) {
          navigate('/');
        } else {
          setError('Failed to complete login');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        setError('An error occurred during login');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    performLogin();
  }, [searchParams, navigate, handleGoogleLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
            <p className="text-red-300">{error}</p>
            <p className="text-slate-400 text-sm mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Completing your sign in...</p>
            <p className="text-slate-400 text-sm mt-2">Please wait</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function FacebookCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleFacebookLogin } = useContext(AuthContext);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Facebook login failed: ${errorParam}`);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const performLogin = async () => {
      try {
        const success = await handleFacebookLogin(code);
        if (success) {
          navigate('/');
        } else {
          setError('Failed to complete login');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        setError('An error occurred during login');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    performLogin();
  }, [searchParams, navigate, handleFacebookLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
            <p className="text-red-300">{error}</p>
            <p className="text-slate-400 text-sm mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Completing your sign in...</p>
            <p className="text-slate-400 text-sm mt-2">Please wait</p>
          </div>
        )}
      </div>
    </div>
  );
}