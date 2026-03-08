"use client";

import { useEffect, useState } from 'react';
import { BarChart3, Loader2, TrendingUp, TrendingDown, Minus, MapPin, BookOpen, AlertTriangle } from 'lucide-react';

type AnalyticsData = {
    scoreDistribution: Record<string, number>;
    districtPerformance: Array<{ name: string; avgScore: number; workerCount: number }>;
    scenarioPerformance: Array<{ id: string; avgScore: number; timesCompleted: number; criticalMisses: number }>;
    weeklyTrends: {
        thisWeek: { sessions: number; avgScore: number };
        lastWeek: { sessions: number; avgScore: number };
    };
    criticalMissBreakdown: Array<{ questionId: string; count: number }>;
};

function BarChart({ value, max, color }: { value: number; max: number; color: string }) {
    const width = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${width}%` }} />
        </div>
    );
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
    if (current > previous) return <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><TrendingUp className="w-3 h-3" /> Up</span>;
    if (current < previous) return <span className="flex items-center gap-1 text-red-600 text-xs font-bold"><TrendingDown className="w-3 h-3" /> Down</span>;
    return <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><Minus className="w-3 h-3" /> Steady</span>;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex h-[calc(100vh-5rem)] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
    }

    if (!data) {
        return <div className="flex h-[calc(100vh-5rem)] items-center justify-center text-gray-400">Failed to load analytics.</div>;
    }

    const maxDistribution = Math.max(...Object.values(data.scoreDistribution), 1);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-purple-500" />
                        Analytics
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Platform performance insights and trends.</p>
                </div>
            </div>

            {/* Weekly Trends */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sessions This Week</div>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-gray-900">{data.weeklyTrends.thisWeek.sessions}</span>
                        <TrendBadge current={data.weeklyTrends.thisWeek.sessions} previous={data.weeklyTrends.lastWeek.sessions} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Last week: {data.weeklyTrends.lastWeek.sessions}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Avg Score This Week</div>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-gray-900">{data.weeklyTrends.thisWeek.avgScore}%</span>
                        <TrendBadge current={data.weeklyTrends.thisWeek.avgScore} previous={data.weeklyTrends.lastWeek.avgScore} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Last week: {data.weeklyTrends.lastWeek.avgScore}%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">Score Distribution (Workers by Avg Score)</h3>
                    <div className="space-y-3">
                        {Object.entries(data.scoreDistribution).map(([range, count]) => (
                            <div key={range} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700">{range}%</span>
                                    <span className="font-bold text-gray-900">{count} workers</span>
                                </div>
                                <BarChart
                                    value={count}
                                    max={maxDistribution}
                                    color={range === '80-100' ? 'bg-green-400' : range === '60-80' ? 'bg-yellow-400' : range === '40-60' ? 'bg-orange-400' : 'bg-red-400'}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* District Performance */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> District Performance</h3>
                    {data.districtPerformance.length === 0 ? (
                        <div className="text-sm text-gray-400 py-4">No district data available.</div>
                    ) : (
                        <div className="space-y-3">
                            {data.districtPerformance.map((d, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-28 text-sm font-medium text-gray-700 truncate shrink-0">{d.name}</div>
                                    <div className="flex-1">
                                        <BarChart
                                            value={d.avgScore}
                                            max={100}
                                            color={d.avgScore >= 80 ? 'bg-green-400' : d.avgScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}
                                        />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 w-12 text-right shrink-0">{d.avgScore}%</div>
                                    <div className="text-xs text-gray-400 w-16 text-right shrink-0">{d.workerCount} workers</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scenario Performance */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" /> Scenario Performance</h3>
                    </div>
                    {data.scenarioPerformance.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-400">No scenario data available.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {data.scenarioPerformance.slice(0, 10).map((s, idx) => (
                                <div key={idx} className="px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">{s.id}</div>
                                        <div className="text-xs text-gray-400">{s.timesCompleted} completions</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-bold ${s.avgScore >= 80 ? 'text-green-600' : s.avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{s.avgScore}%</span>
                                        {s.criticalMisses > 0 && (
                                            <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">{s.criticalMisses} CM</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Critical Miss Breakdown */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Top Critical Misses</h3>
                    </div>
                    {data.criticalMissBreakdown.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-400">No critical misses recorded.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {data.criticalMissBreakdown.map((item, idx) => (
                                <div key={idx} className="px-5 py-3 flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-700 truncate">{item.questionId}</div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="w-16">
                                            <BarChart value={item.count} max={data.criticalMissBreakdown[0]?.count || 1} color="bg-red-400" />
                                        </div>
                                        <span className="text-sm font-bold text-red-600 w-8 text-right">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
