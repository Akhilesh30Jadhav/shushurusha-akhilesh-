"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative items-center justify-center p-12">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/8 rounded-full blur-[120px]" />
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </div>

                <div className="relative z-10 max-w-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
                            <Image src="/images/sushrusha_logo.jpeg" alt="Logo" fill className="object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Sushrusha</h1>
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-3 h-3 text-orange-400" />
                                <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Admin Portal</span>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                        Evaluator<br />Dashboard
                    </h2>
                    <p className="text-gray-400 text-base leading-relaxed mb-10">
                        Monitor ASHA worker performance, track protocol adherence, analyze training outcomes, and manage the platform.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Real-time platform analytics',
                            'Worker performance tracking',
                            'District-level insights',
                            'Role-based access control',
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                </div>
                                <span className="text-gray-300 text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
                <div className="w-full max-w-sm">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white">
                            <Image src="/images/sushrusha_logo.jpeg" alt="Logo" fill className="object-contain" />
                        </div>
                        <div>
                            <span className="font-bold text-gray-900 block leading-tight">Sushrusha</span>
                            <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-widest">Admin</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 mb-4">
                            <Shield className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs font-bold text-orange-600">Admin Access</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-gray-500 text-sm mt-1">Sign in with your admin credentials</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 mb-6 flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-red-700 font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                                    placeholder="admin@sushrusha.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full pl-10 pr-11 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all text-sm font-medium text-gray-800 placeholder:text-gray-400"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-2 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    Sign In to Admin
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-gray-400">
                        Not an admin?{' '}
                        <a href="/auth/login" className="text-orange-500 font-semibold hover:underline">
                            Go to user login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
