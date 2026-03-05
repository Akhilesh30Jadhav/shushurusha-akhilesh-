"use client";

import { useEffect, useState } from 'react';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(res => res.json())
            .then(data => {
                if (data.leaderboard) {
                    setLeaders(data.leaderboard);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex h-[calc(100vh-theme(spacing.8))] items-center justify-center bg-transparent"><Loader2 className="w-12 h-12 animate-spin text-[#FF7A00]" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full px-2 sm:px-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FF7A00] to-[#E55A00] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                    <Trophy className="w-48 h-48 -mr-8 -mt-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 relative z-10">
                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300" />
                    Global Leaderboard
                </h1>
                <p className="opacity-90 mt-2 text-sm sm:text-lg relative z-10">Top ASHA Workers by Clinical XP</p>
            </div>

            {/* List */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
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
