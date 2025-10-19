import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { LogOut, ArrowLeft, Mail, User, Calendar, Shield, Settings, Lock, Zap } from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(AuthContext);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogoutClick = async () => {
    setLogoutLoading(true);
    await handleLogout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-lg font-bold">Profile</h1>
            <div className="w-8" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-red-600/50 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center border-4 border-red-600/50">
                <User className="w-12 h-12 text-white" />
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2">{user?.name}</h2>
              <p className="text-slate-400 mb-4">{user?.email}</p>
              <button
                onClick={handleLogoutClick}
                disabled={logoutLoading}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition disabled:cursor-not-allowed"
              >
                <LogOut className="w-5 h-5" />
                {logoutLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Account Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Email Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-600/20 rounded-lg flex-shrink-0">
                  <Mail className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-sm font-medium">Email Address</p>
                  <p className="text-white font-semibold mt-1 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Member Since Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600/20 rounded-lg flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium">Member Since</p>
                  <p className="text-white font-semibold mt-1">
                    {user?.created_at ? formatDate(user.created_at) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-600/20 rounded-lg flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium">Account Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-green-400 font-semibold">Active & Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Access Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-600/20 rounded-lg flex-shrink-0">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium">API Access</p>
                  <p className="text-white font-semibold mt-1">Full Access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Account Settings</h3>

              {/* Security Settings */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  Security & Privacy
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <div>
                      <p className="font-medium text-sm">OAuth 2.0 Authentication</p>
                      <p className="text-slate-400 text-xs mt-1">Industry-standard security protocol</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <div>
                      <p className="font-medium text-sm">SSL Encryption</p>
                      <p className="text-slate-400 text-xs mt-1">All data transmitted securely</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                    <div>
                      <p className="font-medium text-sm">Two-Factor Authentication</p>
                      <p className="text-slate-400 text-xs mt-1">Coming soon</p>
                    </div>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Soon</span>
                  </div>
                </div>
              </div>

              {/* Usage & Preferences */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Preferences
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Email Notifications</p>
                      <p className="text-slate-400 text-xs mt-1">Receive updates and tips</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-600/5 border border-red-600/20 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg font-semibold transition disabled:opacity-50">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-600/10 to-blue-700/10 border border-blue-600/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              <span className="font-semibold">💡 Tip:</span> Your account is secured with OAuth 2.0 authentication. We never store your password. For questions or support, visit our help center or contact our support team.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/95 border-t border-slate-800 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 SummaryAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}