'use client';
import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { checkAuthStatus, loginUser } from '../../store/authSlice';
import { Eye, EyeOff, Activity } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, status, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await dispatch(loginUser({ email, password }));
    dispatch(checkAuthStatus());
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Activity className="text-blue-700" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">healthFirst</h1>
            <p className="text-sm text-gray-500">Front Desk</p>
          </div>
        </div>

        <h2 className="text-center text-3xl font-bold text-blue-900 mt-4">Welcome Back</h2>
        <p className="text-center text-gray-600">Please log in to access your dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-5 text-gray-700">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 outline-none text-gray-800 placeholder-gray-400"
              placeholder="frontdesk@medicare.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 outline-none text-gray-800 placeholder-gray-400 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold shadow-md transition-colors"
          >
            {status === 'loading' ? 'Logging in...' : 'Login'}
          </button>

          {status === 'failed' && (
            <p className="text-center text-red-600 font-medium mt-2">{String(error)}</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-400 pt-2">
          © {new Date().getFullYear()} healthFirst Clinic. All rights reserved.
        </p>
      </div>
    </div>
  );
}
