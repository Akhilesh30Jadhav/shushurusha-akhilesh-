"use client";

import { useState, useEffect, use, useRef } from 'react';
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
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis?.cancel();
        setPlayingAudioId(null);
    }, [currentQIdx]);

    const playAudio = async (text: string, id: string) => {
        if (playingAudioId === id) {
            audioRef.current?.pause();
            audioRef.current = null;
            window.speechSynthesis?.cancel();
            setPlayingAudioId(null);
            return;
        }
        audioRef.current?.pause();
        audioRef.current = null;
        window.speechSynthesis?.cancel();
        setPlayingAudioId(id);

        try {
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
            // fall through to browser TTS
        }

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
            setIsSubmitting(true);
            const correctCount = newAnswers.filter(a => a.is_correct).length;
            const criticalMissCount = newAnswers.filter(a => a.is_critical_miss).length;
            let baseScore = (correctCount / scenario.questions.length) * 100;
            let finalScore = Math.max(0, Math.round(baseScore - (criticalMissCount * 10)));

            const payload = { scenarioId: scenario.scenario_id, answers: newAnswers, startTime, score: finalScore };

            if (!navigator.onLine) {
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
        <div className="flex flex-col gap-3 h-[calc(100vh-theme(spacing.16))] font-sans">

            {/* ══ ROW 1: Full-width Transcript bar ══ */}
            <div className="flex-shrink-0 flex gap-3 items-center bg-[#0f172a] rounded-2xl px-4 py-2.5 border border-gray-800 shadow-sm">
                <button onClick={() => playAudio(currentQ.patient_prompt, 'transcript')} className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white border transition-colors ${playingAudioId === 'transcript' ? 'bg-teal-500 border-teal-400' : 'bg-teal-700/80 hover:bg-teal-600 border-teal-600/50'}`}>
                    {playingAudioId === 'transcript' ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <div className="flex-1 text-gray-300 text-xs leading-relaxed font-medium">
                    <span className="text-teal-400 font-bold mr-2 uppercase tracking-wide text-[9px] bg-teal-900/60 px-1.5 py-0.5 rounded border border-teal-700/50">TRANSCRIPT</span>
                    {currentQ.patient_prompt}
                </div>
            </div>

            {/* ══ ROW 2: Video (left 45%) | Question + Options (right) ══ */}
            <div className="flex gap-3 flex-1 min-h-0">

                {/* Video — fills full height of this row */}
                <div className="w-[45%] flex-shrink-0 rounded-[1.75rem] overflow-hidden bg-[#0f172a] relative border-4 border-white shadow-lg">
                    <video key={videoUrl} ref={videoRef} src={videoUrl} autoPlay muted playsInline controls={false} loop={false}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { const el = e.currentTarget; el.style.display = 'none'; const img = el.nextElementSibling as HTMLElement | null; if (img) img.style.display = 'block'; }} />
                    <Image src={scenario.thumbnail_url} alt="Scenario" fill className="object-cover opacity-95" style={{ display: 'none' }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3">
                        <div className="bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1.5 border border-white/10 uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> VIDEO MODULE
                        </div>
                    </div>
                </div>

                {/* Question + Options */}
                <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar">

                    <div className="flex items-start justify-between gap-3 flex-shrink-0">
                        <h3 className="text-lg md:text-xl font-extrabold text-gray-900 leading-snug">{currentQ.mcq_question}</h3>
                        <button onClick={() => playAudio(currentQ.mcq_question, 'question')} className={`p-2 rounded-full flex-shrink-0 border shadow-sm transition-colors ${playingAudioId === 'question' ? 'bg-orange-100 text-[#FF7A00] border-orange-200' : 'bg-white text-gray-400 border-gray-100 hover:text-blue-600'}`}>
                            {playingAudioId === 'question' ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Option cards */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        {currentQ.options.map((opt: any) => {
                            const isSelected = selectedOption?.option_id === opt.option_id;
                            const isCorrectTarget = opt.option_id === currentQ.correct_option_id;
                            let cardClass = "group bg-white border-2 border-slate-200 hover:border-[#FF7A00] hover:ring-2 hover:ring-[#FF7A00]/10 hover:bg-orange-50/30 cursor-pointer shadow-sm";
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
                                    <div className={`flex-1 text-sm font-bold text-slate-800 leading-snug ${hasAnswered && !isSelected ? 'text-slate-400' : ''}`}>{opt.text}</div>
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

                    {/* Feedback card — slides in after answering */}
                    {hasAnswered && (
                        <div className="flex-shrink-0 animate-in slide-in-from-bottom-3 duration-300 fade-in">
                            <div className={`p-4 rounded-2xl border border-white/60 shadow-md relative overflow-hidden ${selectedOption.option_id === currentQ.correct_option_id ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-900' : 'bg-gradient-to-br from-orange-50 to-red-50 text-red-900'}`}>
                                <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl opacity-40 ${selectedOption.option_id === currentQ.correct_option_id ? 'bg-green-400' : 'bg-red-400'}`} />
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <h4 className="font-extrabold flex items-center gap-2 text-sm">
                                        {selectedOption.option_id === currentQ.correct_option_id
                                            ? <><CheckCircle2 className="w-4 h-4 text-green-600" />{t('player', 'correctTitle')}</>
                                            : <><XCircle className="w-4 h-4 text-red-600" />{t('player', 'wrongTitle')}</>}
                                    </h4>
                                    <button onClick={() => playAudio(selectedOption.option_id === currentQ.correct_option_id ? currentQ.explanation_correct : currentQ.explanation_wrong, 'explanation')} className={`p-1.5 rounded-full border bg-white/60 ${playingAudioId === 'explanation' ? 'border-orange-300 text-[#FF7A00]' : 'border-transparent hover:bg-white text-gray-700'}`}>
                                        {playingAudioId === 'explanation' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                {selectedOption.option_id !== currentQ.correct_option_id && (
                                    <div className="mb-2 bg-white/60 border border-red-100 rounded-xl p-2.5 relative z-10">
                                        <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-0.5">Correct Answer:</p>
                                        <p className="text-xs font-bold text-gray-900">{currentQ.options.find((o: any) => o.option_id === currentQ.correct_option_id)?.text}</p>
                                    </div>
                                )}
                                <p className="text-xs font-medium leading-relaxed relative z-10 bg-white/30 p-2.5 rounded-xl border border-white/40">
                                    {selectedOption.option_id === currentQ.correct_option_id ? currentQ.explanation_correct : currentQ.explanation_wrong}
                                </p>
                                {currentQ.critical && selectedOption.option_id !== currentQ.correct_option_id && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100/80 px-3 py-1.5 rounded-xl uppercase tracking-wider w-fit border border-red-200 relative z-10">
                                        <AlertTriangle className="w-3.5 h-3.5" /> {t('player', 'critical')}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end pt-3">
                                <button onClick={handleNext} disabled={isSubmitting} className="px-7 py-3 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-extrabold text-sm rounded-full shadow-[0_6px_16px_rgb(229,90,0,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70">
                                    {isSubmitting ? t('player', 'evaluating') : (currentQIdx === scenario.questions.length - 1 ? t('player', 'finish') : t('player', 'next'))}
                                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ══ ROW 3: Three info cards at the bottom ══ */}
            <div className="flex-shrink-0 flex gap-3">

                {/* Card 1: Simulation Case */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-[#1e40af] px-4 py-2.5 flex gap-3 items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
                        <div className="w-9 h-9 rounded-full border-2 border-blue-200/50 bg-indigo-900 shadow-inner flex items-center justify-center flex-shrink-0">
                            <span className="text-base">👩🏾‍⚕️</span>
                        </div>
                        <div className="text-white relative z-10">
                            <h3 className="font-bold text-sm leading-tight">Simulation Case</h3>
                            <p className="text-blue-200 text-[10px] opacity-90">#{scenario.scenario_id.substring(0, 6)}</p>
                        </div>
                    </div>
                    <div className="px-4 py-2.5 flex flex-col gap-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-gray-500">Language</span><span className="font-bold text-gray-900 uppercase">{language}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-bold text-gray-900 text-right max-w-[60%] truncate">{scenario.category}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Difficulty</span><span className={`font-bold ${scenario.difficulty === 'Hard' ? 'text-red-500' : scenario.difficulty === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}>{scenario.difficulty}</span></div>
                    </div>
                </div>

                {/* Card 2: Scenario */}
                <div className="flex-1 bg-gradient-to-br from-[#E55A00] to-[#FF7A00] rounded-2xl shadow-[0_4px_16px_rgb(229,90,0,0.15)] p-4 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <p className="text-[9px] uppercase font-bold tracking-widest text-orange-200 mb-1">SCENARIO</p>
                    <h3 className="font-extrabold text-sm leading-tight mb-2 relative z-10">{scenario.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-orange-100 mb-2">
                        <span className="bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">Q {currentQIdx + 1} of {scenario.questions.length}</span>
                    </div>
                    <div className="bg-white/20 h-1.5 rounded-full overflow-hidden relative z-10">
                        <div className="h-full bg-white transition-all duration-700 ease-out shadow-[0_0_8px_white]" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>

                {/* Card 3: Clinical Presentation */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-extrabold text-xs text-gray-800 flex items-center gap-1.5">📌 Clinical Presentation</h4>
                        <button onClick={() => playAudio(currentQ.patient_prompt, 'prompt')} className={`p-1.5 rounded-full border flex-shrink-0 ${playingAudioId === 'prompt' ? 'bg-orange-100 text-[#FF7A00] border-orange-200' : 'bg-white text-gray-400 border-gray-100 hover:text-blue-600'}`}>
                            {playingAudioId === 'prompt' ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100 border-l-4 border-l-blue-400 overflow-y-auto max-h-[72px] custom-scrollbar">
                        {currentQ.patient_prompt}
                    </p>
                </div>
            </div>
        </div>
    );
}
