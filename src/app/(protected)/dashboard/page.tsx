"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Clock, Award, Star, ListFilter } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { useLanguage } from '@/contexts/LanguageContext';
import scenariosEn from '@/data/scenarios_mcq.json';
import scenariosHi from '@/data/scenarios_mcq_hi.json';
import scenariosMr from '@/data/scenarios_mcq_mr.json';

export default function DashboardPage() {
    const router = useRouter();
    const { language, t } = useLanguage();
    const [user, setUser] = useState<any>(null);

    // Select dynamic scenarios data based on language context
    const scenariosData = language === 'hi' ? scenariosHi : language === 'mr' ? scenariosMr : scenariosEn;

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [difficultyFilter, setDifficultyFilter] = useState('All');

    // Stats
    const [stats, setStats] = useState({ completed: 0, minutes: 0, avgScore: 0, streak: 0 });

    useEffect(() => {
        // Fetch User Profile
        fetch('/api/auth/me').then(res => res.json()).then(data => {
            if (data.user) setUser(data.user);
        });

        // In a real app, these stats would come from the database /api/stats endpoint
        setStats({ completed: 3, minutes: 15, avgScore: 85, streak: 2 });
    }, []);

    const filteredScenarios = useMemo(() => {
        return scenariosData.filter(s => {
            const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.short_description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
            const matchDiff = difficultyFilter === 'All' || s.difficulty === difficultyFilter;
            return matchSearch && matchCat && matchDiff;
        });
    }, [searchQuery, categoryFilter, difficultyFilter, scenariosData]);

    const categories = ['All', ...Array.from(new Set(scenariosData.map(s => s.category)))];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
            {/* Top Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#3b82f6] p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(30,58,138,0.2)] border border-blue-400/20 mt-2 relative overflow-hidden text-white">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute left-0 bottom-0 w-40 h-40 bg-[url('/images/hero-background.png')] bg-cover opacity-20 rounded-full blur-[40px] -ml-10 -mb-10 pointer-events-none mix-blend-screen"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-bold text-blue-100 shadow-inner mb-4 backdrop-blur-md">
                        ✨ Clinical Hub
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                        {t('dashboard', 'greeting').split(',')[0]}, <span className="text-orange-300">{user?.display_name || 'Health Champion'}</span> 👋
                    </h1>
                    <p className="text-blue-100 mt-2 text-sm md:text-base font-medium max-w-md break-words">Ready to enhance your clinical protocol skills today?</p>
                </div>

                {/* Search Bar matching prompt nav requirements array */}
                <div className="relative w-full md:w-96 z-10 mt-4 md:mt-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder={t('dashboard', 'search')}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white text-gray-900 font-medium transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Quick Stats Bento Grid Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { icon: <Award className="h-5 w-5 sm:h-6 sm:w-6" />, val: stats.completed, label: t('dashboard', 'completed').split(' ')[0], color: 'bg-green-50 text-accent' },
                    { icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />, val: `${stats.minutes}m`, label: 'Trained', color: 'bg-orange-50 text-primary' },
                    { icon: <Star className="h-5 w-5 sm:h-6 sm:w-6" />, val: `${stats.avgScore}%`, label: t('dashboard', 'avgScore'), color: 'bg-blue-50 text-secondary' },
                    { icon: <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, val: stats.streak, label: 'Day Streak', color: 'bg-purple-50 text-purple-600' }
                ].map((stat, idx) => (
                    <div key={idx} className="relative h-full rounded-[1.25rem] border border-gray-50/50 p-1.5 md:rounded-[1.5rem] md:p-2">
                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                        <div className="relative z-10 bg-white w-full h-full p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:-translate-y-0.5 transition-transform">
                            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0 ${stat.color} flex items-center justify-center`}>{stat.icon}</div>
                            <div><div className="text-xl sm:text-2xl font-bold text-gray-800">{stat.val}</div><div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mr-2">
                    <ListFilter className="h-4 w-4" /> {t('dashboard', 'filter')}:
                </div>
                <select
                    className="bg-white border text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c === 'All' ? t('dashboard', 'allCats') : c}</option>)}
                </select>

                <select
                    className="bg-white border text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

                {(categoryFilter !== 'All' || difficultyFilter !== 'All' || searchQuery !== '') && (
                    <button
                        onClick={() => { setCategoryFilter('All'); setDifficultyFilter('All'); setSearchQuery(''); }}
                        className="text-sm text-primary hover:underline px-2"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Scenario Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                {filteredScenarios.map((scenario) => (
                    <div key={scenario.scenario_id} className="relative h-full rounded-[1.25rem] border border-gray-50/50 p-2 md:rounded-[1.5rem] md:p-3">
                        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                        <div className="relative z-10 bg-white h-full rounded-xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                            <div className="h-40 relative w-full bg-gray-100">
                                <Image src={scenario.thumbnail_url} alt={scenario.title} fill className="object-cover" />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${scenario.difficulty === 'Easy' ? 'bg-white text-accent' :
                                        scenario.difficulty === 'Medium' ? 'bg-white text-secondary' : 'bg-white text-primary'
                                        }`}>
                                        {scenario.difficulty}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-xs font-bold text-secondary bg-blue-50 w-fit px-2 py-1 rounded inline-block mb-3">
                                    {scenario.category}
                                </div>
                                <h3 className="font-bold text-gray-900 leading-tight mb-2 flex-1">
                                    {scenario.title}
                                </h3>

                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-5">
                                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {scenario.duration_minutes} min</div>
                                    <div className="flex items-center gap-1"><ListFilter className="w-3.5 h-3.5" /> {scenario.questions.length} questions</div>
                                </div>

                                <button
                                    onClick={() => router.push(`/scenario/${scenario.scenario_id}`)}
                                    className="w-full py-2.5 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    {t('dashboard', 'start')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
