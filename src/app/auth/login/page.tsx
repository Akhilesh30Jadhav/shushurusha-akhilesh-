"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse, Shield, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'user' | 'admin'>('user');
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'admin') {
                // Admin login - email only
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailOrPhone, password }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Login failed');
                router.push('/admin');
            } else {
                // User login - email or phone
                const isEmail = emailOrPhone.includes('@');
                const payload = isEmail ? { email: emailOrPhone, password } : { phone: emailOrPhone, password };
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Login failed');
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 font-sans">

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 hover:scale-105 transition-transform">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                    <HeartPulse className="text-white w-5 h-5" />
                </div>
                <div className="flex flex-col hidden sm:flex">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-[#E55A00]">
                        Sushrusha
                    </h1>
                </div>
            </Link>

            <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">Choose your role and sign in.</p>
                </div>

                {/* Role Toggle */}
                <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => { setMode('user'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'user'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        User
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('admin'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'admin'
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Admin
                    </button>
                </div>

                {/* Admin mode indicator */}
                {mode === 'admin' && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="text-xs font-semibold text-orange-700">Admin access — only authorized evaluators can sign in.</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm mb-5 border border-red-100 font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                            {mode === 'admin' ? 'Email' : 'Email or Phone Number'}
                        </label>
                        <input
                            type={mode === 'admin' ? 'email' : 'text'}
                            required
                            className="w-full px-5 py-3.5 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium"
                            placeholder={mode === 'admin' ? 'admin@sushrusha.in' : 'e.g. asha@village.in or 9876543210'}
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                            <label className="block text-sm font-bold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-semibold text-[#FF7A00] hover:underline">Forgot?</a>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="w-full px-5 py-3.5 pr-12 bg-white/60 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none transition-all shadow-inner text-gray-800 font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-2 rounded-2xl font-bold text-lg transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 ${mode === 'admin'
                            ? 'bg-gray-900 text-white hover:-translate-y-0.5 hover:bg-gray-800 shadow-[0_8px_20px_rgba(0,0,0,0.15)]'
                            : 'bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white shadow-[0_8px_20px_rgb(229,90,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgb(229,90,0,0.35)]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                            </>
                        ) : mode === 'admin' ? (
                            <>
                                <Shield className="w-5 h-5" />
                                Sign In as Admin
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="text-[#E55A00] font-bold hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
