import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../common/Toast';
import { Mail, Lock, ArrowRight, Shield, User as UserIcon } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleTabChange = (type: 'user' | 'admin') => {
    setLoginType(type);
    setValue('email', '');
    setValue('password', '');
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const payload: any = {
        email: data.email,
        password: data.password,
      };

      if (loginType === 'admin') {
        payload.requiredRole = 'admin';
      }

      const res = await authService.login(payload);
      if (res.success) {
        if (loginType === 'admin' && res.data.user.role !== 'admin') {
          showToast('Access Denied: Only Admin accounts can log in via the Admin Portal.', 'error');
          setLoading(false);
          return;
        }

        setAuth(res.data.user, res.data.accessToken);
        showToast(`Logged in successfully as ${res.data.user.name}`, 'success');
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.error || 'Login failed. Please check credentials.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 glass-panel border rounded-3xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {loginType === 'admin' ? 'Admin Portal' : 'Welcome back'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loginType === 'admin'
            ? 'Enter administrator credentials to access system control'
            : 'Enter your credentials to access LinkForge'}
        </p>
      </div>

      {/* Login Mode Switcher */}
      <div className="flex rounded-xl glass-panel p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleTabChange('user')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            loginType === 'user'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>User Login</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('admin')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            loginType === 'admin'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-indigo-200" />
          <span>Admin Login</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {loginType === 'admin' ? 'Admin Email Address' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              {...register('email')}
              type="email"
              placeholder={loginType === 'admin' ? 'admin@example.com' : 'you@example.com'}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-brand-500 dark:text-brand-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all duration-150 active:scale-[0.98] ${
            loginType === 'admin'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
              : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-600/30'
          }`}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span>{loginType === 'admin' ? 'Sign In as Admin' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
