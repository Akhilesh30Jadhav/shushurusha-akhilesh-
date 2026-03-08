"use client";

import { useEffect, useState } from 'react';
import { Users, Loader2, Search, ArrowUpDown, Activity, AlertTriangle, ChevronDown, ChevronUp, Download, Filter } from 'lucide-react';

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

type WorkerDetail = {
    sessions: Array<{
        id: string;
        scenarioId: string;
        score: number | null;
        date: string;
        criticalMisses: number;
    }>;
};

export default function AdminUsersPage() {
    const [workers, setWorkers] = useState<WorkerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<keyof WorkerData>('totalScenarios');
    const [sortDesc, setSortDesc] = useState(true);
    const [districtFilter, setDistrictFilter] = useState('all');
    const [expandedWorker, setExpandedWorker] = useState<string | null>(null);
    const [workerDetails, setWorkerDetails] = useState<Record<string, WorkerDetail>>({});
    const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/workers')
            .then(res => res.json())
            .then(data => {
                if (data.workers) setWorkers(data.workers);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSort = (field: keyof WorkerData) => {
        if (sortField === field) {
            setSortDesc(!sortDesc);
        } else {
            setSortField(field);
            setSortDesc(true);
        }
    };

    const toggleExpand = async (workerId: string) => {
        if (expandedWorker === workerId) {
            setExpandedWorker(null);
            return;
        }
        setExpandedWorker(workerId);
        if (!workerDetails[workerId]) {
            setLoadingDetail(workerId);
            try {
                const res = await fetch(`/api/admin/workers/${workerId}`);
                const data = await res.json();
                if (data.worker) {
                    setWorkerDetails(prev => ({ ...prev, [workerId]: data.worker }));
                }
            } catch {
                // silently fail
            }
            setLoadingDetail(null);
        }
    };

    const districts = ['all', ...Array.from(new Set(workers.map(w => w.district).filter(Boolean)))];

    const filteredWorkers = workers.filter(w => {
        const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.district.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDistrict = districtFilter === 'all' || w.district === districtFilter;
        return matchesSearch && matchesDistrict;
    });

    const sortedWorkers = [...filteredWorkers].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });

    const exportCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'District', 'Language', 'Total Scenarios', 'Average Score', 'Critical Misses', 'Last Active'];
        const rows = sortedWorkers.map(w => [
            w.name, w.email, w.phone, w.district, w.language,
            w.totalScenarios, w.averageScore, w.criticalMisses,
            new Date(w.lastActive).toLocaleDateString()
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workers_export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="flex h-[calc(100vh-5rem)] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
    }

    const SortIcon = ({ field }: { field: keyof WorkerData }) => (
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-orange-500' : 'text-gray-400'}`} />
    );

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-orange-500" />
                        Worker Directory
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">{workers.length} registered workers</p>
                </div>
                <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search workers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none text-sm font-medium text-gray-700"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={districtFilter}
                        onChange={(e) => setDistrictFilter(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-gray-50 border-none rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none cursor-pointer"
                    >
                        {districts.map(d => (
                            <option key={d} value={d}>{d === 'all' ? 'All Districts' : d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-3 pl-5 w-8"></th>
                                <th className="p-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                                    <span className="flex items-center gap-1.5">Worker <SortIcon field="name" /></span>
                                </th>
                                <th className="p-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('district')}>
                                    <span className="flex items-center gap-1.5">District <SortIcon field="district" /></span>
                                </th>
                                <th className="p-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('totalScenarios')}>
                                    <span className="flex items-center gap-1.5">Scenarios <SortIcon field="totalScenarios" /></span>
                                </th>
                                <th className="p-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('averageScore')}>
                                    <span className="flex items-center gap-1.5">Avg Score <SortIcon field="averageScore" /></span>
                                </th>
                                <th className="p-3 cursor-pointer hover:text-gray-700" onClick={() => handleSort('criticalMisses')}>
                                    <span className="flex items-center gap-1.5">Critical <SortIcon field="criticalMisses" /></span>
                                </th>
                                <th className="p-3 pr-5 cursor-pointer hover:text-gray-700" onClick={() => handleSort('lastActive')}>
                                    <span className="flex items-center gap-1.5">Last Active <SortIcon field="lastActive" /></span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedWorkers.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm">No workers found.</td></tr>
                            ) : (
                                sortedWorkers.map((worker) => (
                                    <>
                                        <tr key={worker.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => toggleExpand(worker.id)}>
                                            <td className="p-3 pl-5">
                                                {expandedWorker === worker.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                                                        {worker.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{worker.name}</div>
                                                        <div className="text-xs text-gray-400">{worker.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">{worker.district}</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                                                    {worker.totalScenarios}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-sm font-bold ${worker.averageScore >= 80 ? 'text-green-600' : worker.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {worker.averageScore}%
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className={`flex items-center gap-1 text-sm font-semibold ${worker.criticalMisses > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {worker.criticalMisses > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                                                    {worker.criticalMisses}
                                                </div>
                                            </td>
                                            <td className="p-3 pr-5 text-xs text-gray-500 font-medium">
                                                {new Date(worker.lastActive).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                        </tr>
                                        {expandedWorker === worker.id && (
                                            <tr key={`${worker.id}-detail`}>
                                                <td colSpan={7} className="bg-gray-50 px-5 py-4">
                                                    {loadingDetail === worker.id ? (
                                                        <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading sessions...</div>
                                                    ) : workerDetails[worker.id] ? (
                                                        <div>
                                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Session History</div>
                                                            {workerDetails[worker.id].sessions.length === 0 ? (
                                                                <div className="text-sm text-gray-400">No sessions found.</div>
                                                            ) : (
                                                                <div className="grid gap-2">
                                                                    {workerDetails[worker.id].sessions.map((session, idx) => (
                                                                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-gray-100 text-sm">
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="text-gray-600 font-medium">{session.scenarioId}</span>
                                                                                <span className="text-xs text-gray-400">{new Date(session.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className={`font-bold ${(session.score || 0) >= 80 ? 'text-green-600' : (session.score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                                                    {session.score ?? '-'}%
                                                                                </span>
                                                                                {session.criticalMisses > 0 && (
                                                                                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">{session.criticalMisses} CM</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-400">Failed to load details.</div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
