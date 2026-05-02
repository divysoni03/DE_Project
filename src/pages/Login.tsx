import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';

type Mode = 'login' | 'register';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]         = useState<Mode>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [pwdError, setPwdError] = useState('');

  const validatePassword = (val: string) => {
    if (val.length > 0 && val.length < 6) {
      setPwdError('Password must be at least 6 characters.');
    } else {
      setPwdError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setPwdError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          const role = data.role === 'admin' ? 'admin' : 'citizen';
          login(role, email);
          navigate(role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard');
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.message || 'Invalid email or password. Please try again.');
        }
      } else {
        // Register flow
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: 'citizen' }),
        });

        if (res.ok) {
          // Auto-login after registration
          login('citizen', email);
          navigate('/citizen/dashboard');
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.message || 'Registration failed. This email may already be in use.');
        }
      }
    } catch {
      setError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setPwdError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 transform transition-all hover:scale-[1.01]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Disaster Portal</h1>
          <p className="text-slate-400 text-sm">Emergency Command System</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-6 gap-1">
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === m
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 text-sm bg-red-900/50 text-red-200 border border-red-500 rounded-lg p-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name — register only */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => { setPassword(e.target.value); validatePassword(e.target.value); }}
                placeholder="Min. 6 characters"
                className={`w-full bg-slate-900 border rounded-xl py-3 pl-10 pr-11 text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  pwdError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {pwdError && (
              <p className="text-xs text-red-400 ml-1 mt-1">{pwdError}</p>
            )}
            {!pwdError && (
              <p className="text-xs text-slate-500 ml-1 mt-1">Must be at least 6 characters.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!pwdError}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none mt-2"
          >
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : mode === 'login'
                ? <><ArrowRight className="w-5 h-5" /> Sign In</>
                : <><UserPlus className="w-5 h-5" /> Create Account</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
