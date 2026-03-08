"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Loader2, Activity, AlertTriangle, ArrowUpDown } from 'lucide-react';

type ScenarioData = {
    id: string;
    timesCompleted: number;
    avgScore: number;
    criticalMissRate: number;
};

export default function ScenariosPage() {
    const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
    const [mcqScenarios, setMcqScenarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<keyof ScenarioData>('timesCompleted');
    const [sortDesc, setSortDesc] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/scenarios').then(r => r.json()),
            fetch('/api/scenarios').then(r => r.json()).catch(() => ({ scenarios: [] })),
        ]).then(([statsData, scenariosData]) => {
            if (statsData.scenarios) setScenarios(statsData.scenarios);
            if (scenariosData.scenarios) setMcqScenarios(scenariosData.scenarios);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSort = (field: keyof ScenarioData) => {
        if (sortField === field) setSortDesc(!sortDesc);
        else { setSortField(field); setSortDesc(true); }
    };

    const sorted = [...scenarios].sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        if (va < vb) return sortDesc ? 1 : -1;
        if (va > vb) return sortDesc ? -1 : 1;
        return 0;
    });

    const scenarioNameMap: Record<string, string> = {};
    mcqScenarios.forEach((s: any) => {
        if (s.id && s.title) scenarioNameMap[s.id] = s.title;
    });

    if (loading) {
        return <div className="flex h-[calc(100vh-5rem)] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-green-500" />
                    Scenarios
                </h1>
                <p className="text-gray-500 text-sm mt-1">Protocol scenarios overview with aggregated performance data.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Scenarios</div>
                    <div className="text-2xl font-bold text-gray-900">{scenarios.length}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Completions</div>
                    <div className="text-2xl font-bold text-gray-900">{scenarios.reduce((s, sc) => s + sc.timesCompleted, 0)}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Platform Avg Score</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {scenarios.length > 0 ? Math.round(scenarios.reduce((s, sc) => s + sc.avgScore, 0) / scenarios.length) : 0}%
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-3 pl-5">Scenario</th>
                                <th className="p-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('timesCompleted')}>
                                    <span className="flex items-center gap-1.5">Completions <ArrowUpDown className={`w-3 h-3 ${sortField === 'timesCompleted' ? 'text-orange-500' : ''}`} /></span>
                                </th>
                                <th className="p-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('avgScore')}>
                                    <span className="flex items-center gap-1.5">Avg Score <ArrowUpDown className={`w-3 h-3 ${sortField === 'avgScore' ? 'text-orange-500' : ''}`} /></span>
                                </th>
                                <th className="p-3 pr-5 cursor-pointer hover:text-gray-700" onClick={() => handleSort('criticalMissRate')}>
                                    <span className="flex items-center gap-1.5">CM / Session <ArrowUpDown className={`w-3 h-3 ${sortField === 'criticalMissRate' ? 'text-orange-500' : ''}`} /></span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sorted.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400 text-sm">No scenario data available.</td></tr>
                            ) : (
                                sorted.map((sc, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-3 pl-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-4 h-4 text-green-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{scenarioNameMap[sc.id] || sc.id}</div>
                                                    <div className="text-xs text-gray-400">ID: {sc.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                                <Activity className="w-3.5 h-3.5 text-blue-500" />
                                                {sc.timesCompleted}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${sc.avgScore >= 80 ? 'bg-green-400' : sc.avgScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                        style={{ width: `${sc.avgScore}%` }}
                                                    />
                                                </div>
                                                <span className={`text-sm font-bold ${sc.avgScore >= 80 ? 'text-green-600' : sc.avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {sc.avgScore}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 pr-5">
                                            <div className={`flex items-center gap-1 text-sm font-semibold ${sc.criticalMissRate > 1 ? 'text-red-500' : 'text-gray-500'}`}>
                                                {sc.criticalMissRate > 1 && <AlertTriangle className="w-3.5 h-3.5" />}
                                                {sc.criticalMissRate.toFixed(1)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
