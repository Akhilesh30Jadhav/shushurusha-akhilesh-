"use client";

import { useEffect, useState } from 'react';
import { Users, Activity, Loader2, TrendingUp, AlertTriangle, Clock, BarChart3, BookOpen, UserPlus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex h-[calc(100vh-5rem)] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
    }

    const statCards = [
        { icon: Users, val: stats?.totalUsers || 0, label: 'Total Workers', color: 'bg-blue-50 text-blue-600', iconColor: 'text-blue-500' },
        { icon: UserPlus, val: stats?.newUsersLast7Days || 0, label: 'New Signups (7d)', color: 'bg-green-50 text-green-600', iconColor: 'text-green-500' },
        { icon: Activity, val: stats?.totalScenariosTaken || 0, label: 'Scenarios Done', color: 'bg-purple-50 text-purple-600', iconColor: 'text-purple-500' },
        { icon: TrendingUp, val: `${stats?.averageSystemScore || 0}%`, label: 'Avg Score', color: 'bg-orange-50 text-orange-600', iconColor: 'text-orange-500' },
        { icon: AlertTriangle, val: stats?.totalCriticalMisses || 0, label: 'Critical Misses', color: 'bg-red-50 text-red-600', iconColor: 'text-red-500' },
        { icon: Clock, val: stats?.activeUsersLast7Days || 0, label: 'Active (7d)', color: 'bg-cyan-50 text-cyan-600', iconColor: 'text-cyan-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1 text-sm">Monitor platform usage, worker performance, and protocol adherence.</p>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stat.val}</div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">Recent Activity</h3>
                        <span className="text-xs text-gray-400 font-medium">Last 10 sessions</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {(stats?.recentSessions || []).length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No recent activity</div>
                        ) : (
                            stats.recentSessions.map((session: any, idx: number) => (
                                <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-600">
                                            {(session.workerName || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 truncate">{session.workerName}</div>
                                            <div className="text-xs text-gray-400">{session.workerDistrict} &middot; {session.scenarioId}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-sm font-bold ${(session.score || 0) >= 80 ? 'text-green-600' : (session.score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {session.score ?? '-'}%
                                        </span>
                                        <span className="text-xs text-gray-400">{new Date(session.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="space-y-3">
                    {[
                        { title: 'Worker Directory', desc: 'View all ASHA workers and performance', href: '/admin/users', icon: Users, color: 'bg-blue-50 text-blue-600' },
                        { title: 'Analytics', desc: 'Score distributions and trends', href: '/admin/analytics', icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
                        { title: 'Scenarios', desc: 'Protocol scenarios overview', href: '/admin/scenarios', icon: BookOpen, color: 'bg-green-50 text-green-600' },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link key={idx} href={item.href} className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-bold text-gray-900">{item.title}</div>
                                        <div className="text-xs text-gray-400">{item.desc}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                </div>
                            </Link>
                        );
                    })}

                    {/* At-Risk Workers */}
                    {(stats?.atRiskWorkers || []).length > 0 && (
                        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <h4 className="text-sm font-bold text-red-900">At-Risk Workers</h4>
                            </div>
                            <div className="space-y-2">
                                {stats.atRiskWorkers.slice(0, 5).map((worker: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-red-800 truncate">{worker.name}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-red-600 font-bold">{worker.avgScore}%</span>
                                            {worker.criticalMisses > 0 && (
                                                <span className="bg-red-200 text-red-700 px-1.5 py-0.5 rounded font-bold">{worker.criticalMisses} CM</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
