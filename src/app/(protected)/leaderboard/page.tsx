"use client";

import { useEffect, useState } from 'react';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRegion, setActiveRegion] = useState("Maharashtra");
    const { t } = useLanguage();

    const regions = ["Maharashtra", "Tamil Nadu", "Gujarat"];

    useEffect(() => {
        setLoading(true);
        fetch(`/api/leaderboard?region=${encodeURIComponent(activeRegion)}`)
            .then(res => res.json())
            .then(data => {
                if (data.leaderboard) {
                    setLeaders(data.leaderboard);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [activeRegion]);

    if (loading && leaders.length === 0) {
        return <div className="flex h-[calc(100vh-theme(spacing.8))] items-center justify-center bg-transparent"><Loader2 className="w-12 h-12 animate-spin text-[#FF7A00]" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full px-2 sm:px-0">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 blur-xl">
                    <Trophy className="w-56 h-56 -mr-12 -mt-12" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3 relative z-10 tracking-tight">
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300" />
                    Regional Leaderboard
                </h1>
                <p className="text-emerald-100 font-medium mt-3 text-sm sm:text-lg relative z-10 max-w-md leading-relaxed">Top ASHA Workers by Clinical XP organized by state and district</p>
                
                {/* Region Tabs */}
                <div className="mt-8 flex flex-wrap gap-2 relative z-10 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md w-fit">
                    {regions.map(region => (
                        <button
                            key={region}
                            onClick={() => setActiveRegion(region)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeRegion === region ? 'bg-white text-emerald-800 shadow-md transform scale-105' : 'text-emerald-50 hover:bg-white/20 hover:text-white'}`}
                        >
                            {region}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-emerald-50 overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                )}
                <div className="p-0">
                    {leaders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No scores yet. Complete a scenario to be the first!</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {leaders.map((user, index) => (
                                <div key={user.id} className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-8 sm:w-10 text-center font-bold text-gray-400 flex justify-center">
                                            {index === 0 && <Medal className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 drop-shadow-sm" />}
                                            {index === 1 && <Medal className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 drop-shadow-sm" />}
                                            {index === 2 && <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 drop-shadow-sm" />}
                                            {index > 2 && <span className="text-sm sm:text-base">#{index + 1}</span>}
                                        </div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center font-bold text-orange-700 text-lg sm:text-xl shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-1">{user.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500">{user.scenariosCompleted} {t('nav', 'scenarios')} Completed</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                            <div className="font-bold text-base sm:text-lg text-[#138808]">{user.totalScore}</div>
                                            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400">Total XP</div>
                                        </div>
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
