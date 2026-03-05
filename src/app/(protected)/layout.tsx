"use client";

import { LayoutDashboard, UserCog, LogOut, FileText, Globe, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { OfflineSync } from "@/components/OfflineSync";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { language, setLanguage, t } = useLanguage();
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    const navItems = [
        { name: t('nav', 'dashboard'), url: "/dashboard", icon: LayoutDashboard },
        { name: t('nav', 'scenarios'), url: "/scenarios", icon: FileText },
        { name: t('nav', 'leaderboard'), url: "/leaderboard", icon: Trophy },
        { name: t('nav', 'profile'), url: "/profile", icon: UserCog },
    ];

    const langOptions = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी' },
        { code: 'mr', label: 'मराठी' }
    ] as const;

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/auth/login');
    };

    return (
        <div className="flex flex-col w-full min-h-screen relative font-sans">
            {/* Top Navigation Header matching reference theme */}
            <header className="w-full bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    {/* Brand Logo Left */}
                    <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
                        <div className="relative flex items-center justify-center h-10 w-24 sm:h-14 sm:w-36 rounded shadow-sm border border-gray-100 overflow-hidden bg-white flex-shrink-0">
                            <Image src="/images/sushrusha_logo.jpeg" alt="Sushrusha Logo" fill className="object-contain" priority />
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-[#E55A00]">
                                Sushrusha
                            </h1>
                            <span className="text-[10px] text-gray-600 font-semibold tracking-widest uppercase">
                                Care • Connect • Educate
                            </span>
                        </div>
                    </Link>

                    {/* Actions Right */}
                    <div className="flex items-center gap-2 sm:gap-6">
                        <div className="hidden sm:flex items-center p-1 bg-white/50 border border-white/60 rounded-full shadow-inner">
                            {navItems.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                                const Icon = item.icon;
                                return (
                                    <Link key={item.url} href={item.url} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive ? 'bg-white shadow-sm text-[#E55A00]' : 'text-gray-600 hover:bg-white/40'}`}>
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right-most utilities (Language / Logout) */}
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4 sm:pl-6 relative">
                            {/* Language Switcher */}
                            <div className="relative">
                                <button
                                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    {langOptions.find(o => o.code === language)?.label || 'English'}
                                </button>

                                {langMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}></div>
                                        <div className="absolute top-10 right-0 w-32 bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-50 animate-in fade-in slide-in-from-top-2">
                                            {langOptions.map(opt => (
                                                <button
                                                    key={opt.code}
                                                    onClick={() => {
                                                        setLanguage(opt.code);
                                                        setLangMenuOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${language === opt.code ? 'bg-[#FF7A00]/10 text-[#FF7A00]' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title={t('nav', 'logout')}>
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
                {children}
            </main>

            <OfflineSync />

            {/* Mobile Bottom Nav (Visible only on small screens) */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 flex items-center justify-around p-3 z-50 pb-safe">
                {navItems.map((item) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                    const Icon = item.icon;
                    return (
                        <Link key={item.url} href={item.url} className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#E55A00]' : 'text-gray-500'}`}>
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
