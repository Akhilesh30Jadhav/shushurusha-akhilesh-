"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCog, Mail, Shield, Award, Sparkles, TrendingUp, LogOut, Footprints, Medal, Trophy, HeartPulse, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const iconMap = {
    Footprints,
    Medal,
    Trophy,
    HeartPulse
};

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                } else {
                    router.push('/auth/login');
                }
            })
            .catch(() => {
                router.push('/auth/login');
            });
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/auth/login');
    };

    if (!user) {
        return (
            <div className="flex h-[calc(100vh-theme(spacing.24))] items-center justify-center animate-pulse">
                <div className="w-16 h-16 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans pb-12 w-full">
            {/* Header Banner */}
            <div className="relative bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-pink-500/10 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-[#FF7A00]/10 to-transparent pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#FF7A00] to-pink-500 uppercase">
                                {user.display_name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                            <Shield className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="text-center sm:text-left flex-1">
                        <div className="text-sm font-extrabold text-[#FF7A00] uppercase tracking-widest mb-1">{t('profile', 'title')}</div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{user.display_name}</h1>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 font-medium bg-white/50 w-fit mx-auto sm:mx-0 px-4 py-1.5 rounded-full shadow-inner border border-white">
                            <Mail className="w-4 h-4" />
                            {user.email || 'worker@sushrusha.in'}
                        </div>
                    </div>

                    <div className="hidden md:flex gap-4">
                        <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-full transition-colors shadow-sm border border-red-100/50">
                            <LogOut className="w-5 h-5" /> {t('profile', 'logout')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Details Column */}
                <div className="md:col-span-1 space-y-6">
                    <div className="relative h-full rounded-[2.5rem] border border-gray-50/50 p-2 sm:p-3">
                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                        <div className="relative z-10 w-full h-full bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 shadow-sm transition-all hover:shadow-md outline-none">
                            <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                <UserCog className="text-[#FF7A00] w-5 h-5" /> Worker Details
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('profile', 'role')}</div>
                                    <div className="text-gray-800 font-bold text-lg bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100">ASHA Worker</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('profile', 'level')}</div>
                                    <div className="text-gray-800 font-bold text-lg bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100">Level 4 - Advanced Care</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('profile', 'joined')}</div>
                                    <div className="text-gray-800 font-bold text-lg bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100">October 2023</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impact Column */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="relative rounded-[2rem] border border-gray-50/50 p-2 sm:p-2.5">
                            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                            <div className="relative z-10 w-full h-full bg-gradient-to-br from-orange-50 to-[#FF7A00]/10 rounded-[1.5rem] p-8 border border-white shadow-sm flex flex-col justify-center overflow-hidden group hover:shadow-md transition-all pt-10">
                                <Award className="absolute -right-4 -top-4 w-32 h-32 text-[#FF7A00] opacity-5 group-hover:scale-110 transition-transform duration-500" />
                                <div className="text-5xl font-extrabold text-[#FF7A00] mb-2 drop-shadow-sm">{user.stats?.totalScenariosPassed || 0}</div>
                                <div className="text-sm font-extrabold text-orange-900 uppercase tracking-widest opacity-80">Total Scenarios Passed</div>
                            </div>
                        </div>
                        <div className="relative rounded-[2rem] border border-gray-50/50 p-2 sm:p-2.5">
                            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                            <div className="relative z-10 w-full h-full bg-gradient-to-br from-pink-50 to-pink-500/10 rounded-[1.5rem] p-8 border border-white shadow-sm flex flex-col justify-center overflow-hidden group hover:shadow-md transition-all pt-10">
                                <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-pink-500 opacity-5 group-hover:scale-110 transition-transform duration-500" />
                                <div className="text-5xl font-extrabold text-pink-600 mb-2 drop-shadow-sm">{user.stats?.criticalSavesLogged || 0}</div>
                                <div className="text-sm font-extrabold text-pink-900 uppercase tracking-widest opacity-80">Critical Saves Logged</div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="relative rounded-[2.5rem] border border-gray-50/50 p-2 sm:p-3">
                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                        <div className="relative z-10 w-full h-full bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
                                <TrendingUp className="text-blue-500 w-6 h-6" /> Training Competency
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-extrabold text-gray-700 tracking-wide">{t('profile', 'maternal')}</span>
                                        <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shadow-sm border border-blue-100/50">92%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner overflow-hidden border border-black/5">
                                        <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full shadow-sm" style={{ width: '92%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-extrabold text-gray-700 tracking-wide">{t('profile', 'child')}</span>
                                        <span className="text-sm font-extrabold text-pink-600 bg-pink-50 px-2 py-0.5 rounded shadow-sm border border-pink-100/50">85%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner overflow-hidden border border-black/5">
                                        <div className="bg-gradient-to-r from-pink-400 to-pink-600 h-3 rounded-full shadow-sm" style={{ width: '85%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-extrabold text-gray-700 tracking-wide">{t('profile', 'comm')}</span>
                                        <span className="text-sm font-extrabold text-[#FF7A00] bg-orange-50 px-2 py-0.5 rounded shadow-sm border border-orange-100/50">78%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner overflow-hidden border border-black/5">
                                        <div className="bg-gradient-to-r from-[#FF7A00] to-[#E55A00] h-3 rounded-full shadow-sm" style={{ width: '78%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badges Section */}
                    <div className="relative rounded-[2.5rem] mt-6 border border-gray-50/50 p-2 sm:p-3">
                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                        <div className="relative z-10 w-full h-full bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                <Award className="text-yellow-500 w-6 h-6" /> Earned Badges
                            </h3>

                            {user.badges?.length === 0 ? (
                                <div className="text-center text-gray-500 py-4 opacity-70 font-medium">No badges earned yet. Complete scenarios to earn!</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {user.badges?.map((badge: any) => {
                                        const IconComponent = (iconMap as any)[badge.icon] || Award;
                                        return (
                                            <div key={badge.id} className="bg-gradient-to-br from-yellow-50 flex flex-col items-center justify-center p-4 rounded-2xl border border-yellow-200/50 shadow-sm text-center">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner mb-3 border border-yellow-100">
                                                    <IconComponent className="w-6 h-6 text-yellow-500" />
                                                </div>
                                                <h4 className="font-bold text-gray-800 text-sm">{badge.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">{badge.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Reports Section */}
                    {user.recent_reports && user.recent_reports.length > 0 && (
                        <div className="relative rounded-[2.5rem] mt-6 border border-gray-50/50 p-2 sm:p-3">
                            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                            <div className="relative z-10 w-full h-full bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-white/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                    <Activity className="text-emerald-500 w-6 h-6" /> Detailed Performance Reports
                                </h3>

                                <div className="space-y-4">
                                    {user.recent_reports.map((report: any) => (
                                        <div key={report.id} className="bg-gradient-to-br from-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col transition-all hover:-translate-y-1 hover:shadow-md">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                    {report.title} 
                                                    <span className={`text-xs px-2 py-1 rounded-full text-white font-bold ml-2 ${report.score >= 80 ? 'bg-emerald-500' : report.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                                        {report.score}%
                                                    </span>
                                                </h4>
                                                <div className="text-xs font-bold text-gray-400">
                                                    {new Date(report.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-600 leading-relaxed space-y-2">
                                                {report.report_text ? (
                                                    report.report_text.split('\n').map((para: string, idx: number) => (
                                                        <p key={idx}>{para}</p>
                                                    ))
                                                ) : (
                                                    <p className="italic text-gray-400">No report generated for this session.</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="sm:hidden flex justify-center mt-6">
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-colors shadow-sm border border-red-100">
                    <LogOut className="w-5 h-5" /> {t('profile', 'logout')}
                </button>
            </div>
        </div>
    );
}
