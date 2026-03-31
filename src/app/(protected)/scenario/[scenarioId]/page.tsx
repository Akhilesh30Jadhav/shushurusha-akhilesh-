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

            {/* Right Main Stage: Media & MCQ */}
            <div className="w-full md:w-9/12 lg:w-[72%] flex flex-col bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 overflow-hidden relative">
                <div className="flex flex-col xl:flex-row h-full overflow-hidden p-3 md:p-6 lg:p-8 gap-6 xl:gap-8">

                    {/* Left Pane: Media & Transcript */}
                    <div className="w-full xl:w-[45%] flex flex-col gap-4 flex-shrink-0 h-full">
                        {/* Media Stage — real video if available, thumbnail fallback otherwise */}
                        <div className="w-full h-[35vh] md:min-h-[350px] xl:h-full xl:min-h-0 bg-[#0f172a] relative rounded-[2rem] overflow-hidden shadow-inner flex flex-col justify-end border-4 border-white">

                        {/* Real video player */}
                        <video
                            key={videoUrl}
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            muted
                            playsInline
                            controls={false}
                            loop={false}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                                // If no video file exists, show thumbnail instead
                                const el = e.currentTarget;
                                el.style.display = 'none';
                                const img = el.nextElementSibling as HTMLElement | null;
                                if (img) img.style.display = 'block';
                            }}
                        />
                        {/* Thumbnail fallback (hidden when video loads) */}
                        <Image
                            src={scenario.thumbnail_url}
                            alt="Scenario Stage"
                            fill
                            className="object-cover opacity-95"
                            style={{ display: 'none' }}
                        />

                        {/* Dark gradient overlay — only top half, not covering video content */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>

                        {/* Top live indicator */}
                        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex gap-2">
                            <div className="bg-black/40 backdrop-blur-md text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-bold shadow-sm flex items-center gap-2 border border-white/10 uppercase tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> VIDEO MODULE
                            </div>
                        </div>
                    </div>

                    {/* Transcript bar — outside the video, below it */}
                    <div className="flex gap-3 items-start bg-[#0f172a] rounded-2xl px-4 py-3 border border-gray-800 flex-shrink-0">
                        <button onClick={() => playAudio(currentQ.patient_prompt, 'prompt-video')} className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors border ${playingAudioId === 'prompt-video' ? 'bg-teal-500 border-teal-400' : 'bg-teal-700/80 hover:bg-teal-600 border-teal-600/50'}`}>
                            {playingAudioId === 'prompt-video' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <div className="flex-1 text-gray-200 text-xs md:text-sm leading-relaxed font-medium pt-1 overflow-y-auto max-h-32 custom-scrollbar">
                            <span className="text-teal-400 font-bold mr-2 uppercase tracking-wide text-[10px] bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700/50">TRANSCRIPT</span>
                            {currentQ.patient_prompt}
                        </div>
                    </div>
                </div>

                {/* Right Pane: MCQ Question & Options */}
                <div className="w-full xl:w-[55%] flex flex-col h-full overflow-y-auto custom-scrollbar pb-6 pr-2 xl:pl-4">

                    {/* MCQ Section Header */}
                    <div className="flex justify-between items-start gap-4 mt-8 md:mt-10 px-2 sm:px-4">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{currentQ.mcq_question}</h3>
                        <button
                            onClick={() => playAudio(currentQ.mcq_question, 'question')}
                            className={`p-2.5 sm:p-3 rounded-full transition-colors flex-shrink-0 mt-1 shadow-sm ${playingAudioId === 'question' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-white border border-gray-100 text-gray-500 hover:text-blue-600 hover:border-blue-200'}`}
                            title="Listen to question"
                        >
                            {playingAudioId === 'question' ? <Square className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                    </div>

                    {/* MCQ Options Area */}
                    <div className="space-y-4 sm:space-y-5 flex-1 mt-6 px-2 sm:px-4 pb-12 w-full max-w-4xl">
                        {currentQ.options.map((opt: any) => {
                            const isSelected = selectedOption?.option_id === opt.option_id;
                            const isCorrectTarget = opt.option_id === currentQ.correct_option_id;

                            let cardClass = "group bg-white border-2 border-slate-200 hover:border-[#FF7A00] hover:ring-4 hover:ring-[#FF7A00]/10 hover:bg-orange-50/40 cursor-pointer shadow-sm";
                            let icon = null;

                            if (hasAnswered) {
                                if (isSelected) {
                                    if (isCorrectTarget) {
                                        cardClass = "bg-green-50 border-2 border-green-500 shadow-md ring-4 ring-green-500/20";
                                        icon = <CheckCircle2 className="text-green-600 w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" />;
                                    } else {
                                        cardClass = "bg-red-50 border-2 border-red-500 shadow-md ring-4 ring-red-500/20";
                                        icon = <XCircle className="text-red-600 w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" />;
                                    }
                                } else if (isCorrectTarget) {
                                    cardClass = "bg-white border-2 border-green-400 border-dashed opacity-90";
                                    icon = <CheckCircle2 className="text-green-500 w-7 h-7 sm:w-8 sm:h-8 opacity-70" />;
                                } else {
                                    cardClass = "bg-slate-50 border-2 border-slate-100 opacity-50 cursor-not-allowed";
                                }
                            }

                            return (
                                <div
                                    key={opt.option_id}
                                    onClick={() => handleSelect(opt)}
                                    className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 flex items-center justify-between gap-4 sm:gap-6 ${cardClass} ${!hasAnswered ? 'hover:shadow-lg hover:-translate-y-1.5 active:scale-[0.98]' : ''}`}
                                >
                                    <div className="flex items-center gap-5 sm:gap-6 flex-1 w-full max-w-[85%]">
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-[3px] flex items-center justify-center flex-shrink-0 transition-all duration-300 ${hasAnswered && !isSelected ? 'opacity-50' : ''} ${isSelected ? (isCorrectTarget ? 'border-green-500 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-red-500 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]') : 'border-slate-300 bg-slate-50 group-hover:border-[#FF7A00] group-hover:scale-110'}`}>
                                            {isSelected && <div className="w-3 h-3 bg-white rounded-full shadow-sm animate-in zoom-in duration-200"></div>}
                                        </div>
                                        <div className={`flex-1 text-lg sm:text-xl font-extrabold text-slate-800 break-words leading-snug transition-all duration-300 ${hasAnswered && !isSelected ? 'text-slate-400' : ''} ${!hasAnswered ? 'group-hover:text-gray-900 group-hover:translate-x-1' : ''}`}>{opt.text}</div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {icon}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playAudio(opt.text, `opt-${opt.option_id}`);
                                            }}
                                            className={`p-3 rounded-full transition-transform flex-shrink-0 ml-1 shadow-sm border ${playingAudioId === `opt-${opt.option_id}` ? 'bg-orange-100 text-[#FF7A00] border-orange-300 scale-110' : 'bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border-slate-200 hover:scale-110'}`}
                                            title="Listen to option"
                                        >
                                            {playingAudioId === `opt-${opt.option_id}` ? <Square className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Feedback & Result Card */}
                        {hasAnswered && (
                            <div className="mt-8 animate-in slide-in-from-bottom-6 duration-500 fade-in">
                                <div className={`p-6 md:p-8 rounded-[2rem] border border-white/60 shadow-md mb-6 relative overflow-hidden ${selectedOption.option_id === currentQ.correct_option_id ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-900' : 'bg-gradient-to-br from-orange-50 to-red-50 text-red-900'}`}>
                                    {/* Background decoration */}
                                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-50 ${selectedOption.option_id === currentQ.correct_option_id ? 'bg-green-400' : 'bg-red-400'}`}></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <h4 className="font-extrabold flex items-center gap-2 text-xl md:text-2xl">
                                            {selectedOption.option_id === currentQ.correct_option_id ? <><CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-green-600" /> {t('player', 'correctTitle')}</> : <><XCircle className="w-7 h-7 md:w-8 md:h-8 text-red-600" /> {t('player', 'wrongTitle')}</>}
                                        </h4>
                                        <button
                                            onClick={() => playAudio(selectedOption.option_id === currentQ.correct_option_id ? currentQ.explanation_correct : currentQ.explanation_wrong, 'explanation')}
                                            className={`p-2 rounded-full transition-colors flex-shrink-0 border bg-white/60 shadow-sm ${playingAudioId === 'explanation' ? 'border-orange-300 text-[#FF7A00]' : 'border-transparent hover:bg-white text-gray-700'}`}
                                            title="Listen to explanation"
                                        >
                                            {playingAudioId === 'explanation' ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Show the correct answer explicitly if they got it wrong */}
                                    {selectedOption.option_id !== currentQ.correct_option_id && (
                                        <div className="mb-4 bg-white/60 backdrop-blur-sm border border-red-100 rounded-xl p-4 shadow-sm relative z-10">
                                            <p className="text-sm font-bold text-red-800 uppercase tracking-widest mb-1 text-[10px]">Correct Answer:</p>
                                            <p className="text-base md:text-lg font-bold text-gray-900">
                                                {currentQ.options.find((opt: any) => opt.option_id === currentQ.correct_option_id)?.text}
                                            </p>
                                        </div>
                                    )}

                                    <p className="text-base md:text-lg font-medium opacity-90 leading-relaxed relative z-10 bg-white/30 p-4 rounded-xl border border-white/40">
                                        {selectedOption.option_id === currentQ.correct_option_id ? currentQ.explanation_correct : currentQ.explanation_wrong}
                                    </p>

                                    {currentQ.critical && selectedOption.option_id !== currentQ.correct_option_id && (
                                        <div className="mt-4 mb-2 flex items-center gap-2 text-xs md:text-sm font-bold text-red-700 bg-red-100/80 backdrop-blur-sm px-4 py-3 rounded-xl uppercase tracking-wider w-fit shadow-inner border border-red-200 relative z-10">
                                            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" /> {t('player', 'critical')}
                                        </div>
                                    )}

                                    {/* Reference Link */}
                                    <div className="mt-6 flex flex-wrap gap-3 relative z-10 pt-4 border-t border-black/5">
                                        <a href="https://nhsrcindia.org/sites/default/files/2021-06/ASHA%20Training%20Module%20%28English%29.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white border border-gray-200 rounded-xl text-sm font-bold text-blue-700 transition-colors shadow-sm">
                                            📘 ASHA Training Module Ref
                                        </a>
                                        <a href="https://www.who.int/publications/i/item/9789241549912" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white border border-gray-200 rounded-xl text-sm font-bold text-teal-700 transition-colors shadow-sm">
                                            🌍 WHO Protocol Reference
                                        </a>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className="px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-extrabold text-lg md:text-xl rounded-full shadow-[0_8px_20px_rgb(229,90,0,0.25)] hover:shadow-[0_12px_25px_rgb(229,90,0,0.35)] hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
                                    >
                                        {isSubmitting ? t('player', 'evaluating') : (currentQIdx === scenario.questions.length - 1 ? t('player', 'finish') : t('player', 'next'))}
                                        {!isSubmitting && <ArrowRight className="w-6 h-6 md:w-7 md:h-7" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
