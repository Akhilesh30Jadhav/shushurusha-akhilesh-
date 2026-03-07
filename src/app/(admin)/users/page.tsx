"use client";

import { useEffect, useState } from 'react';
import { Users, Loader2, Search, ArrowUpDown, ChevronDown, Activity, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type WorkerData = {
    id: string;
    name: string;
    email: string;
    phone: string;
    district: string;
    language: string;
    joinedAt: string;
    lastActive: string;
    totalScenarios: number;
    totalScore: number;
    averageScore: number;
    criticalMisses: number;
};

export default function AdminUsersPage() {
    const [workers, setWorkers] = useState<WorkerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<keyof WorkerData>('totalScenarios');
    const [sortDesc, setSortDesc] = useState(true);

    useEffect(() => {
        fetch('/api/admin/workers')
            .then(res => res.json())
            .then(data => {
                if (data.workers) setWorkers(data.workers);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch admin data", err);
                setLoading(false);
            });
    }, []);

    const handleSort = (field: keyof WorkerData) => {
        if (sortField === field) {
            setSortDesc(!sortDesc);
        } else {
            setSortField(field);
            setSortDesc(true);
        }
    };

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.district.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedWorkers = [...filteredWorkers].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle string vs number sorting
        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }

        // Number / Date sorting
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });

    if (loading) {
        return <div className="flex h-[calc(100vh-theme(spacing.8))] items-center justify-center bg-transparent"><Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 w-full px-4 sm:px-0">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#FF7A00]" />
                        Evaluator Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Monitor and evaluate ASHA worker performance across all districts.</p>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Workers</div>
                        <div className="text-2xl font-black text-gray-900">{workers.length}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by worker name or district..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-700 font-medium"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                <th className="p-4 pl-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">Worker <ArrowUpDown className="w-3.5 h-3.5" /></div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('district')}>
                                    <div className="flex items-center gap-2">District <ArrowUpDown className="w-3.5 h-3.5" /></div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('totalScenarios')}>
                                    <div className="flex items-center gap-2">Scenarios <ArrowUpDown className="w-3.5 h-3.5" /></div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('averageScore')}>
                                    <div className="flex items-center gap-2">Avg Score <ArrowUpDown className="w-3.5 h-3.5" /></div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('criticalMisses')}>
                                    <div className="flex items-center gap-2">Critical Misses <ArrowUpDown className="w-3.5 h-3.5" /></div>
                                </th>
                                <th className="p-4 pr-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('lastActive')}>
                                    <div className="flex items-center gap-2">Last Active <ArrowUpDown className="w-3.5 h-3.5" /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedWorkers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No workers found matching your search.</td>
                                </tr>
                            ) : (
                                sortedWorkers.map((worker) => (
                                    <tr key={worker.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-gray-900">{worker.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{worker.language} • {worker.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                                {worker.district}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 font-bold text-gray-700">
                                                <Activity className="w-4 h-4 text-blue-500" />
                                                {worker.totalScenarios}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold">
                                                <span className={worker.averageScore >= 80 ? 'text-green-600' : worker.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                                                    {worker.averageScore}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex items-center gap-1.5 font-bold ${worker.criticalMisses > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {worker.criticalMisses > 0 && <AlertTriangle className="w-4 h-4" />}
                                                {worker.criticalMisses}
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-sm text-gray-500 font-medium">
                                            {new Date(worker.lastActive).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
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
