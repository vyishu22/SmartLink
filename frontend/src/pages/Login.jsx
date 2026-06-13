import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiLink, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <HiLink className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-zinc-100">SmartLink</span>
          </Link>
          <h1 className="text-xl font-bold text-zinc-100">Log in to your account</h1>
          <p className="mt-1 text-sm text-zinc-500">Welcome back</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPass ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Logging in…
                </span>
              ) : 'Log in'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
