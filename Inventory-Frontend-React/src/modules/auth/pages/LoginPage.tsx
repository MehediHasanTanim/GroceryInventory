import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../services/api';
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.post('/api/v1/login', {
        username,
        password,
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', username);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-card glass-card"
      >
        <div className="login-header">
          <div className="logo-icon">
            <Lock size={32} color="var(--primary)" />
          </div>
          <h1>Inventory Hub</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User size={18} className="icon-left" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="icon-left" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="icon-right"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>System v1.0.0 • Secure Access</p>
        </div>
      </motion.div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent),
                      radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .login-header {
          text-align: center;
        }

        .logo-icon {
          width: 64px;
          height: 64px;
          background: var(--bg-surface-elevated);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 1px solid var(--border);
        }

        h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(to right, var(--text-main), var(--text-muted));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header p {
          color: var(--text-muted);
          font-size: 14px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-message {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: var(--danger);
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          padding-left: 4px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .icon-left {
          position: absolute;
          left: 14px;
          color: var(--text-dim);
        }

        .icon-right {
          position: absolute;
          right: 14px;
          color: var(--text-dim);
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .icon-right:hover {
          color: var(--text-muted);
        }

        input {
          width: 100%;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 42px;
          color: var(--text-main);
          font-size: 15px;
          transition: all 0.2s ease;
        }

        input:focus {
          border-color: var(--primary);
          background: var(--bg-surface);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }

        .login-button {
          background: var(--primary);
          color: white;
          padding: 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-button:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          color: var(--text-dim);
          font-size: 11px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
