"use client";

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import scenariosEn from '@/data/scenarios_mcq.json';
import scenariosHi from '@/data/scenarios_mcq_hi.json';
import scenariosMr from '@/data/scenarios_mcq_mr.json';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Loader2, Volume2, Square } from 'lucide-react';
import Image from 'next/image';

export default function MCQPlayer({ params }: { params: Promise<{ scenarioId: string }> }) {
    const router = useRouter();
    const { scenarioId } = use(params);
    const { language, t } = useLanguage();

    const scenariosData = language === 'hi' ? scenariosHi : language === 'mr' ? scenariosMr : scenariosEn;

    const [scenario, setScenario] = useState<any>(null);
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [answers, setAnswers] = useState<any[]>([]);
    const [startTime, setStartTime] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Stop any playing audio when question changes
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis?.cancel();
        setPlayingAudioId(null);
    }, [currentQIdx]);

    const playAudio = async (text: string, id: string) => {
        // Toggle off if already playing this item
        if (playingAudioId === id) {
            audioRef.current?.pause();
            audioRef.current = null;
            window.speechSynthesis?.cancel();
            setPlayingAudioId(null);
            return;
        }

        // Stop anything currently playing
        audioRef.current?.pause();
        audioRef.current = null;
        window.speechSynthesis?.cancel();
        setPlayingAudioId(id);

        try {
            // Try Fish Audio API first
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audioRef.current = audio;
                audio.onended = () => { setPlayingAudioId(null); URL.revokeObjectURL(url); };
                audio.onerror = () => { setPlayingAudioId(null); URL.revokeObjectURL(url); };
                await audio.play();
                return;
            }
        } catch {
            // Fish Audio failed — fall through to browser TTS
        }

        // Fallback: browser speechSynthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        const found = scenariosData.find(s => s.scenario_id === scenarioId);
        if (found) {
            setScenario(found);
            setStartTime(Date.now());
        } else {
            router.push('/dashboard');
        }
    }, [scenarioId, router, scenariosData]);

    if (!scenario) return <div className="flex h-[calc(100vh-theme(spacing.8))] items-center justify-center bg-transparent"><Loader2 className="w-12 h-12 animate-spin text-[#FF7A00]" /></div>;

    const currentQ = scenario.questions[currentQIdx];
    const progressPercent = ((currentQIdx + 1) / scenario.questions.length) * 100;
    // Per-question video path — falls back to thumbnail if file doesn't exist
    const videoUrl = `/videos/${scenarioId}/${currentQ.question_id}.mp4`;

    const handleSelect = (option: any) => {
        if (hasAnswered) return;
        setSelectedOption(option);
        setHasAnswered(true);
    };

    const handleNext = async () => {
        const isCorrect = selectedOption.option_id === currentQ.correct_option_id;
        const isCriticalMiss = !isCorrect && currentQ.critical;

        const newAnswers = [...answers, {
            question_id: currentQ.question_id,
            selected_option_id: selectedOption.option_id,
            is_correct: isCorrect,
            is_critical_miss: isCriticalMiss
        }];

        setAnswers(newAnswers);

        if (currentQIdx < scenario.questions.length - 1) {
            setCurrentQIdx(currentQIdx + 1);
            setSelectedOption(null);
            setHasAnswered(false);
        } else {
            // Finish
            setIsSubmitting(true);

            const correctCount = newAnswers.filter(a => a.is_correct).length;
            const criticalMissCount = newAnswers.filter(a => a.is_critical_miss).length;

            let baseScore = (correctCount / scenario.questions.length) * 100;
            let finalScore = Math.max(0, Math.round(baseScore - (criticalMissCount * 10))); // 10% penalty per critical miss

            const payload = {
                scenarioId: scenario.scenario_id,
                answers: newAnswers,
                startTime,
                score: finalScore
            };

            if (!navigator.onLine) {
                // Offline mode
                const queue = JSON.parse(localStorage.getItem('offlineSessionQueue') || '[]');
                queue.push({ ...payload, tempId: Date.now().toString() });
                localStorage.setItem('offlineSessionQueue', JSON.stringify(queue));

                alert("Scenario Completed Offline! Your data is saved locally and will sync when you regain connection.");
                router.push('/dashboard');
                return;
            }

            try {
                const res = await fetch('/api/sessions/mcq/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.sessionId) {
                    router.push(`/report/${data.sessionId}`);
                } else {
                    throw new Error("Failed to get session ID");
                }
            } catch (e) {
                console.error("Failed to save session", e);
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-theme(spacing.8))] gap-4 md:gap-6 font-sans">

            {/* Left Sidebar: Patient & Scenario Context */}
            <div className="w-full md:w-3/12 lg:w-[28%] flex flex-col gap-4 md:gap-5 overflow-y-auto custom-scrollbar pb-6 pr-2">

                {/* 1. Patient Profile Card */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                    <div className="bg-[#1e40af] p-4 flex gap-4 items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="w-12 h-12 rounded-full border-2 border-blue-200/50 overflow-hidden flex-shrink-0 relative bg-indigo-900 shadow-inner flex items-center justify-center">
                            <span className="text-xl">👩🏾‍⚕️</span>
                        </div>
                        <div className="text-white relative z-10">
                            <h3 className="font-bold text-lg leading-tight truncate">Simulation Case</h3>
                            <p className="text-blue-200 text-xs mt-0.5 opacity-90">Patient · Reference #{scenario.scenario_id.substring(0, 6)}</p>
                        </div>
                    </div>
                    <div className="p-4 md:p-5 flex flex-col gap-3.5 text-xs lg:text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2.5">
                            <span className="text-gray-500">Language</span>
                            <span className="font-bold text-gray-900 uppercase">{language}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2.5">
                            <span className="text-gray-500">Category</span>
                            <span className="font-bold text-gray-900 truncate max-w-[60%] text-right">{scenario.category}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Difficulty</span>
                            <span className={`font-bold ${scenario.difficulty === 'Hard' ? 'text-red-500' : scenario.difficulty === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}>{scenario.difficulty}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Scenario Info Card */}
                <div className="bg-gradient-to-br from-[#E55A00] to-[#FF7A00] rounded-2xl md:rounded-[2rem] shadow-[0_8px_20px_rgb(229,90,0,0.15)] p-5 text-white flex-shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-orange-200 mb-2">SCENARIO</p>
                    <h3 className="font-extrabold text-lg leading-tight mb-5 relative z-10 drop-shadow-sm">{scenario.title}</h3>
                    <div className="flex items-center gap-2 lg:gap-3 text-xs font-bold text-orange-100 flex-wrap">
                        <span className="bg-black/20 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-inner">Question {currentQIdx + 1} of {scenario.questions.length}</span>
                    </div>
                    <div className="mt-5 bg-white/20 h-1.5 rounded-full w-full overflow-hidden shadow-inner relative z-10">
                        <div className="h-full bg-white transition-all duration-700 ease-out shadow-[0_0_10px_white]" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>

                {/* 3. Key Clinical Hints */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 p-5 md:p-6 flex-shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-extrabold text-sm md:text-base text-gray-800 flex items-center gap-2">
                            📌 Clinical Presentation
                        </h4>
                        <button onClick={() => playAudio(currentQ.patient_prompt, 'prompt')} className={`p-2 rounded-full transition-colors flex-shrink-0 shadow-sm border ${playingAudioId === 'prompt' ? 'bg-orange-100 text-[#FF7A00] border-orange-200/50' : 'bg-white text-gray-400 hover:text-blue-600 border-gray-100'}`}>
                            {playingAudioId === 'prompt' ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 border-l-4 border-l-blue-400">
                        {currentQ.patient_prompt}
                    </p>
                </div>
            </div>

            {/* Right Main Stage — single column, full-width video, non-scrollable options */}
            <div className="w-full md:w-9/12 lg:w-[72%] flex flex-col bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 overflow-hidden">
                {/* Outer wrapper: flex col, full height. Only scrolls when feedback card appears after answering */}
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4 md:p-5 lg:p-6 gap-3">

                    {/* ── FULL-WIDTH VIDEO — fixed height, never causes scroll ── */}
                    <div className="w-full flex-shrink-0 h-[34vh] min-h-[180px] max-h-[280px] rounded-[1.5rem] overflow-hidden bg-[#0f172a] relative border-4 border-white/90 shadow-lg">
                        <video key={videoUrl} ref={videoRef} src={videoUrl} autoPlay muted playsInline controls={false} loop={false}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { const el = e.currentTarget; el.style.display = 'none'; const img = el.nextElementSibling as HTMLElement | null; if (img) img.style.display = 'block'; }} />
                        <Image src={scenario.thumbnail_url} alt="Scenario Stage" fill className="object-cover opacity-95" style={{ display: 'none' }} />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                        <div className="absolute top-4 right-4">
                            <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-white/10 uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> VIDEO MODULE
                            </div>
                        </div>
                    </div>

                    {/* ── TRANSCRIPT ── */}
                    <div className="flex-shrink-0 flex gap-2.5 items-center bg-[#0f172a] rounded-2xl px-4 py-2.5 border border-gray-800">
                        <button onClick={() => playAudio(currentQ.patient_prompt, 'prompt-video')} className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white border transition-colors ${playingAudioId === 'prompt-video' ? 'bg-teal-500 border-teal-400' : 'bg-teal-700/80 hover:bg-teal-600 border-teal-600/50'}`}>
                            {playingAudioId === 'prompt-video' ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                        <div className="flex-1 text-gray-300 text-[11px] md:text-xs leading-relaxed font-medium">
                            <span className="text-teal-400 font-bold mr-1.5 uppercase tracking-wide text-[9px] bg-teal-900/60 px-1.5 py-0.5 rounded border border-teal-700/50">TRANSCRIPT</span>
                            {currentQ.patient_prompt}
                        </div>
                    </div>

                    {/* ── QUESTION ── */}
                    <div className="flex-shrink-0 flex justify-between items-start gap-3">
                        <h3 className="text-base md:text-lg lg:text-xl font-extrabold text-gray-900 leading-snug">{currentQ.mcq_question}</h3>
                        <button onClick={() => playAudio(currentQ.mcq_question, 'question')} className={`p-2 rounded-full flex-shrink-0 shadow-sm transition-colors ${playingAudioId === 'question' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-white border border-gray-100 text-gray-400 hover:text-blue-600'}`}>
                            {playingAudioId === 'question' ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* ── OPTIONS — all 4 always visible, flex-shrink-0 so they never collapse ── */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                        {currentQ.options.map((opt: any) => {
                            const isSelected = selectedOption?.option_id === opt.option_id;
                            const isCorrectTarget = opt.option_id === currentQ.correct_option_id;
                            let cardClass = "group bg-white border-2 border-slate-200 hover:border-[#FF7A00] hover:ring-2 hover:ring-[#FF7A00]/15 hover:bg-orange-50/30 cursor-pointer shadow-sm";
                            let icon = null;
                            if (hasAnswered) {
                                if (isSelected) {
                                    if (isCorrectTarget) { cardClass = "bg-green-50 border-2 border-green-500 shadow-md ring-2 ring-green-500/20"; icon = <CheckCircle2 className="text-green-600 w-5 h-5 flex-shrink-0" />; }
                                    else { cardClass = "bg-red-50 border-2 border-red-500 shadow-md ring-2 ring-red-500/20"; icon = <XCircle className="text-red-600 w-5 h-5 flex-shrink-0" />; }
                                } else if (isCorrectTarget) { cardClass = "bg-white border-2 border-green-400 border-dashed opacity-90"; icon = <CheckCircle2 className="text-green-500 w-5 h-5 opacity-70 flex-shrink-0" />; }
                                else { cardClass = "bg-slate-50 border-2 border-slate-100 opacity-50 cursor-not-allowed"; }
                            }
                            return (
                                <div key={opt.option_id} onClick={() => handleSelect(opt)} className={`px-4 py-3 rounded-2xl transition-all duration-200 flex items-center gap-3 ${cardClass} ${!hasAnswered ? 'hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]' : ''}`}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${hasAnswered && !isSelected ? 'opacity-40' : ''} ${isSelected ? (isCorrectTarget ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500') : 'border-slate-300 bg-white group-hover:border-[#FF7A00]'}`}>
                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-150" />}
                                    </div>
                                    <div className={`flex-1 text-sm md:text-[15px] font-bold text-slate-800 leading-snug ${hasAnswered && !isSelected ? 'text-slate-400' : ''}`}>{opt.text}</div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {icon}
                                        <button onClick={(e) => { e.stopPropagation(); playAudio(opt.text, `opt-${opt.option_id}`); }} className={`p-1.5 rounded-full border transition-colors ${playingAudioId === `opt-${opt.option_id}` ? 'bg-orange-100 text-[#FF7A00] border-orange-300' : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200'}`}>
                                            {playingAudioId === `opt-${opt.option_id}` ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── FEEDBACK — slides in below options after answering, outer panel scrolls to show it ── */}
                    {hasAnswered && (
                        <div className="flex-shrink-0 animate-in slide-in-from-bottom-4 duration-400 fade-in">
                            <div className={`p-5 rounded-2xl border border-white/60 shadow-md relative overflow-hidden ${selectedOption.option_id === currentQ.correct_option_id ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-900' : 'bg-gradient-to-br from-orange-50 to-red-50 text-red-900'}`}>
                                <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-40 ${selectedOption.option_id === currentQ.correct_option_id ? 'bg-green-400' : 'bg-red-400'}`} />
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <h4 className="font-extrabold flex items-center gap-2 text-base">
                                        {selectedOption.option_id === currentQ.correct_option_id ? <><CheckCircle2 className="w-5 h-5 text-green-600" />{t('player', 'correctTitle')}</> : <><XCircle className="w-5 h-5 text-red-600" />{t('player', 'wrongTitle')}</>}
                                    </h4>
                                    <button onClick={() => playAudio(selectedOption.option_id === currentQ.correct_option_id ? currentQ.explanation_correct : currentQ.explanation_wrong, 'explanation')} className={`p-1.5 rounded-full border bg-white/60 shadow-sm ${playingAudioId === 'explanation' ? 'border-orange-300 text-[#FF7A00]' : 'border-transparent hover:bg-white text-gray-700'}`}>
                                        {playingAudioId === 'explanation' ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                </div>
                                {selectedOption.option_id !== currentQ.correct_option_id && (
                                    <div className="mb-3 bg-white/60 border border-red-100 rounded-xl p-3 relative z-10">
                                        <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1">Correct Answer:</p>
                                        <p className="text-sm font-bold text-gray-900">{currentQ.options.find((o: any) => o.option_id === currentQ.correct_option_id)?.text}</p>
                                    </div>
                                )}
                                <p className="text-sm font-medium leading-relaxed relative z-10 bg-white/30 p-3 rounded-xl border border-white/40">
                                    {selectedOption.option_id === currentQ.correct_option_id ? currentQ.explanation_correct : currentQ.explanation_wrong}
                                </p>
                                {currentQ.critical && selectedOption.option_id !== currentQ.correct_option_id && (
                                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100/80 px-3 py-2 rounded-xl uppercase tracking-wider w-fit border border-red-200 relative z-10">
                                        <AlertTriangle className="w-4 h-4" /> {t('player', 'critical')}
                                    </div>
                                )}
                                <div className="mt-4 flex flex-wrap gap-2 relative z-10 pt-3 border-t border-black/5">
                                    <a href="https://nhsrcindia.org/sites/default/files/2021-06/ASHA%20Training%20Module%20%28English%29.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/70 hover:bg-white border border-gray-200 rounded-xl text-xs font-bold text-blue-700 shadow-sm">📘 ASHA Ref</a>
                                    <a href="https://www.who.int/publications/i/item/9789241549912" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/70 hover:bg-white border border-gray-200 rounded-xl text-xs font-bold text-teal-700 shadow-sm">🌍 WHO Protocol</a>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={handleNext} disabled={isSubmitting} className="px-8 py-3.5 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-extrabold text-base rounded-full shadow-[0_6px_16px_rgb(229,90,0,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70">
                                    {isSubmitting ? t('player', 'evaluating') : (currentQIdx === scenario.questions.length - 1 ? t('player', 'finish') : t('player', 'next'))}
                                    {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}
