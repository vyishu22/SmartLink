import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiLink, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const res = await authApi.register(form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success('Account created! Welcome to SmartLink.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
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
          <h1 className="text-xl font-bold text-zinc-100">Create your account</h1>
          <p className="mt-1 text-sm text-zinc-500">Start shortening smarter</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full name</label>
              <input
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                className="input"
                required
              />
            </div>
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
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
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
