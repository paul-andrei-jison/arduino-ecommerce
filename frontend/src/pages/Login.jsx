import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const inputClass =
  'w-full bg-slate-800 border border-slate-600 focus:border-cyan-400 focus:outline-none ' +
  'text-white placeholder-slate-500 rounded px-4 py-2.5 text-sm transition-colors';

const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider';

export default function Login() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  function switchMode(next) {
    setMode(next);
    setError('');
    setSuccessMsg('');
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(signInEmail, signInPassword);
      navigate('/shop');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }
      setMode('signin');
      setError('');
      setSuccessMsg('Account created — you can now sign in.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <p className="text-2xl font-bold tracking-widest text-cyan-400 uppercase">Arduino Store</p>
          <p className="text-slate-500 text-xs mt-1 tracking-widest font-mono uppercase">
            Hardware · Precision · Code
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl shadow-black/60">

          {/* Toggle tabs */}
          <div className="flex border-b border-slate-700">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-3 text-sm font-medium tracking-wide transition-colors ${
                mode === 'signin'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/60'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-3 text-sm font-medium tracking-wide transition-colors ${
                mode === 'register'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/60'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-6 space-y-4">

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-950/70 border border-red-700/60 rounded px-4 py-3">
                <span className="text-red-500 text-xs font-mono font-bold mt-0.5 shrink-0">ERR</span>
                <p className="text-red-300 text-sm leading-snug">{error}</p>
              </div>
            )}

            {/* Success banner */}
            {successMsg && (
              <div className="flex items-start gap-3 bg-emerald-950/70 border border-emerald-700/60 rounded px-4 py-3">
                <span className="text-emerald-400 text-xs font-mono font-bold mt-0.5 shrink-0">OK</span>
                <p className="text-emerald-300 text-sm leading-snug">{successMsg}</p>
              </div>
            )}

            {/* Sign In form */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded text-sm tracking-wide transition-colors"
                >
                  {loading ? 'Authenticating…' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Create Account form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded text-sm tracking-wide transition-colors"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-6 font-mono tracking-wider">
          ARDUINO STORE — EMBEDDED COMMERCE PLATFORM
        </p>

      </div>
    </div>
  );
}
