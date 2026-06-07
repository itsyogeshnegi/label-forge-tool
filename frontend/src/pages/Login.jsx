import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Package, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect away
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950 transition-colors duration-150">
      <div className="w-full max-w-md space-y-8 border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 rounded-lg shadow-xs">
        
        {/* Head */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 rounded-lg">
            <Package className="h-6 w-6 text-slate-900 dark:text-white" />
          </div>
          <h2 className="mt-6 font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            LABELFORGE
          </h2>
          <p className="mt-2 text-xs font-mono tracking-wider text-slate-400">
            SHIPPING LABEL GENERATOR SIGN-IN
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Operator ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email-address"
                  name="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white rounded-md"
                  placeholder="pahadse.store"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm placeholder-slate-400 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white rounded-md"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Note */}
        <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 font-mono">
          Security: JWT Protected session. Authorized operators only.
        </div>

      </div>
    </div>
  );
};

export default Login;
