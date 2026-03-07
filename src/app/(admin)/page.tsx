"use client";

import { useEffect, useState } from 'react';
import { Users, Activity, Loader2, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { GlowingEffect } from '@/components/ui/glowing-effect';

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                if (data.stats) setStats(data.stats);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch admin stats", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex h-[calc(100vh-theme(spacing.8))] items-center justify-center bg-transparent"><Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">

            {/* Top Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 rounded-[2rem] p-8 md:p-10 shadow-xl border border-blue-400/20 relative overflow-hidden text-white flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-bold text-blue-100 shadow-inner mb-4 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-orange-400" /> Platform Overview
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md mb-2">
                        System Analytics
                    </h1>
                    <p className="text-blue-100 mt-2 text-sm md:text-lg font-medium opacity-90">Monitor platform usage, protocol adherence, and ASHA worker activity across all districts.</p>
                </div>

                <div className="relative z-10 mt-6 md:mt-0 flex shrink-0 border border-white/20 bg-white/10 backdrop-blur-md rounded-2xl p-4 gap-6 items-center shadow-inner">
                    <div className="text-center">
                        <div className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Active Users (7d)</div>
                        <div className="text-3xl font-black text-white">{stats?.activeUsersLast7Days || 0}</div>
                    </div>
                    <div className="w-[1px] h-12 bg-white/20"></div>
                    <div className="text-center">
                        <div className="text-green-300 text-xs font-bold uppercase tracking-widest mb-1">Health</div>
                        <div className="text-xl font-bold text-white flex items-center gap-1"><TrendingUp className="w-5 h-5" /> Normal</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bento Grid Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { icon: <Users className="h-6 w-6" />, val: stats?.totalUsers || 0, label: 'Total ASHA Workers', desc: 'Registered on platform', color: 'bg-blue-50 text-blue-600' },
                    { icon: <Activity className="h-6 w-6" />, val: stats?.totalScenariosTaken || 0, label: 'Scenarios Evaluated', desc: 'Total protocol runs', color: 'bg-green-50 text-green-600' },
                    { icon: <Sparkles className="h-6 w-6" />, val: `${stats?.averageSystemScore || 0}%`, label: 'Average System Score', desc: 'Overall accuracy', color: 'bg-orange-50 text-orange-600' },
                    { icon: <AlertTriangle className="h-6 w-6" />, val: stats?.totalCriticalMisses || 0, label: 'Critical Misses', desc: 'Require review', color: 'bg-red-50 text-red-600' }
                ].map((stat, idx) => (
                    <div key={idx} className="relative h-full rounded-[1.25rem] border border-gray-100/50 p-2 md:rounded-[1.5rem]">
                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                        <div className="relative z-10 bg-white w-full h-full p-5 sm:p-6 rounded-xl shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`h-12 w-12 rounded-xl flex-shrink-0 ${stat.color} flex items-center justify-center`}>{stat.icon}</div>
                            </div>
                            <div>
                                <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{stat.val}</div>
                                <div className="text-sm font-bold text-gray-800 mt-1">{stat.label}</div>
                                <div className="text-xs text-gray-500 font-medium mt-1">{stat.desc}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Worker Management</h3>
                    <p className="text-gray-500 text-sm font-medium mb-6">Review individual performance scores, find workers who need protocol retraining, and sort by district.</p>
                    <Link href="/admin/users" className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors gap-2 w-full sm:w-auto">
                        <Users className="w-4 h-4" /> Go to Worker Directory
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-orange-900 mb-2">Needs Attention</h3>
                    <p className="text-orange-700/80 text-sm font-medium mb-6">There are <strong className="text-orange-900">{stats?.totalCriticalMisses || 0}</strong> critical misses logged across the platform. Review the workers to understand protocol gaps.</p>
                    <Link href="/admin/users" className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 border border-orange-200 shadow-sm font-bold text-sm rounded-xl hover:bg-orange-600 hover:text-white transition-colors gap-2 w-full sm:w-auto">
                        <AlertTriangle className="w-4 h-4" /> View Critical Errors
                    </Link>
                </div>
            </div>

        </div>
    );
}
