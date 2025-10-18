import { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleGoogleLogin = useCallback(async (code) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const { access_token, refresh_token, user } = data;

      // Store tokens
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUser(user);

      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  }, []);

  const handleFacebookLogin = useCallback(async (code) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/facebook/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const { access_token, refresh_token, user } = data;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUser(user);

      return true;
    } catch (error) {
      console.error('Facebook login error:', error);
      return false;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      if (refreshToken) {
        await fetch('http://localhost:8000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, [refreshToken]);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return false;

    try {
      const response = await fetch('http://localhost:8000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        handleLogout();
        return false;
      }

      const data = await response.json();
      const newAccessToken = data.access_token;

      localStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      handleLogout();
      return false;
    }
  }, [refreshToken, handleLogout]);

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    handleGoogleLogin,
    handleFacebookLogin,
    handleLogout,
    refreshAccessToken,
    isAuthenticated: !!user && !!accessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}