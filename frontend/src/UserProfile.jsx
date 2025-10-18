import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { LogOut, ArrowLeft, Mail, User, Calendar } from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(AuthContext);

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Summarizer
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl p-8 backdrop-blur-sm border border-purple-500/20">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-purple-500/50"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-4 border-purple-500/50">
                <User className="w-12 h-12 text-white" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">{user?.name}</h1>
              <p className="text-purple-300 mb-4">Logged in via {user?.id?.split('-')[0] || 'OAuth'}</p>

              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-700 mb-8"></div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Email Address</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Member Since</p>
                <p className="text-white font-medium">{user?.created_at ? formatDate(user.created_at) : 'Recently'}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-700 my-8"></div>

          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
            <div className="space-y-3">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                <p className="text-slate-300 text-sm mb-2">Account Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-green-400">Active</p>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                <p className="text-slate-300 text-sm mb-2">API Access</p>
                <p className="text-slate-400 text-sm">Your account has full access to the YouTube Summarizer API.</p>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-8 p-4 bg-blue-900/30 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              <span className="font-semibold">🔒 Security:</span> Your account is secured with OAuth 2.0 authentication. Never share your credentials with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}