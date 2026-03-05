"use client";

import { useState, useEffect, use } from 'react';
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

    useEffect(() => {
        // Cancel speech when component unmounts or question changes
        window.speechSynthesis.cancel();
        setPlayingAudioId(null);
    }, [currentQIdx]);

    const playAudio = (text: string, id: string) => {
        if (playingAudioId === id) {
            window.speechSynthesis.cancel();
            setPlayingAudioId(null);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any other playing audio

        const utterance = new SpeechSynthesisUtterance(text);

        // Map app language to speech synthesis language code
        if (language === 'hi') {
            utterance.lang = 'hi-IN';
        } else if (language === 'mr') {
            utterance.lang = 'mr-IN';
        } else {
            utterance.lang = 'en-IN';
        }

        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);

        setPlayingAudioId(id);
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

            try {
                const res = await fetch('/api/sessions/mcq/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scenarioId: scenario.scenario_id,
                        answers: newAnswers,
                        startTime,
                        score: finalScore
                    })
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
        <div className="flex flex-col h-[calc(100vh-theme(spacing.8))] bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white/50 px-4 sm:px-8 py-4 sm:py-5 border-b border-white/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-[#FF7A00] via-pink-500 to-purple-600 transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }}></div>
                <div>
                    <div className="text-[10px] font-extrabold text-[#FF7A00] uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded shadow-sm w-fit mb-1">{scenario.category}</div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{scenario.title}</h2>
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-500 bg-white/80 px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-gray-900">{currentQIdx + 1}</span> <span className="text-[10px] uppercase font-bold">{t('player', 'of')}</span> {scenario.questions.length}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-12 custom-scrollbar">

                {/* Left Panel: Patient Context */}
                <div className="md:w-5/12 space-y-6">
                    <div className="relative h-64 sm:h-72 w-full rounded-[2rem] overflow-hidden shadow-sm bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center p-2 border border-white">
                        <Image src={scenario.thumbnail_url} alt="Context" fill className="object-contain p-4" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-4 left-6 text-white font-bold flex items-center gap-2 drop-shadow-md text-sm tracking-wide">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-white/50"></div>
                            {t('player', 'live')}
                        </div>
                    </div>
                    <div className="bg-white/80 p-5 sm:p-8 rounded-[2rem] border border-white shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500"></div>
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <h3 className="font-extrabold text-gray-800 text-base sm:text-lg pl-2">{t('player', 'feedback')}</h3>
                            <button
                                onClick={() => playAudio(currentQ.patient_prompt, 'prompt')}
                                className={`p-2 rounded-full transition-colors flex-shrink-0 ${playingAudioId === 'prompt' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                title="Listen to prompt"
                            >
                                {playingAudioId === 'prompt' ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-base sm:text-lg font-medium pl-2">{currentQ.patient_prompt}</p>
                    </div>
                </div>

                {/* Right Panel: MCQ Options */}
                <div className="md:w-7/12 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-6 sm:mb-8">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{currentQ.mcq_question}</h3>
                        <button
                            onClick={() => playAudio(currentQ.mcq_question, 'question')}
                            className={`p-2.5 sm:p-3 rounded-full transition-colors flex-shrink-0 mt-1 shadow-sm ${playingAudioId === 'question' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-white border border-gray-100 text-gray-500 hover:text-blue-600 hover:border-blue-200'}`}
                            title="Listen to question"
                        >
                            {playingAudioId === 'question' ? <Square className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                    </div>

                    <div className="space-y-3 sm:space-y-4 flex-1">
                        {currentQ.options.map((opt: any) => {
                            const isSelected = selectedOption?.option_id === opt.option_id;
                            const isCorrectTarget = opt.option_id === currentQ.correct_option_id;

                            let cardClass = "bg-white/70 border-2 border-gray-100 hover:border-[#FF7A00]/40 cursor-pointer shadow-sm";
                            let icon = null;

                            if (hasAnswered) {
                                if (isSelected) {
                                    if (isCorrectTarget) {
                                        cardClass = "bg-green-50/80 border-2 border-green-500 shadow-md";
                                        icon = <CheckCircle2 className="text-green-600 w-6 h-6 sm:w-7 sm:h-7" />;
                                    } else {
                                        cardClass = "bg-red-50/80 border-2 border-red-500 shadow-md";
                                        icon = <XCircle className="text-red-600 w-6 h-6 sm:w-7 sm:h-7" />;
                                    }
                                } else if (isCorrectTarget) {
                                    cardClass = "bg-white border-2 border-green-400 border-dashed opacity-80";
                                    icon = <CheckCircle2 className="text-green-500 w-6 h-6 sm:w-7 sm:h-7 opacity-70" />;
                                } else {
                                    cardClass = "bg-white/50 border-2 border-gray-100 opacity-40 cursor-not-allowed";
                                }
                            }

                            return (
                                <div
                                    key={opt.option_id}
                                    onClick={() => handleSelect(opt)}
                                    className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 sm:gap-5 ${cardClass} ${!hasAnswered ? 'hover:shadow-md hover:-translate-y-1' : ''}`}
                                >
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${hasAnswered && !isSelected ? 'opacity-50' : ''} ${isSelected ? (isCorrectTarget ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500') : 'border-gray-300'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>}
                                    </div>
                                    <div className={`flex-1 text-base sm:text-lg font-bold text-gray-800 ${hasAnswered && !isSelected ? 'text-gray-500' : ''}`}>{opt.text}</div>
                                    {icon}
                                </div>
                            );
                        })}
                    </div>

                    {/* Feedback & Next Button */}
                    {hasAnswered && (
                        <div className="mt-8 animate-in slide-in-from-bottom-6 duration-500 fade-in">
                            <div className={`p-6 rounded-[2rem] border border-white/60 shadow-sm mb-6 relative overflow-hidden ${selectedOption.option_id === currentQ.correct_option_id ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-900' : 'bg-gradient-to-br from-orange-50 to-red-50 text-red-900'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-extrabold flex items-center gap-2 text-xl">
                                        {selectedOption.option_id === currentQ.correct_option_id ? <><CheckCircle2 className="w-6 h-6 text-green-600" /> {t('player', 'correctTitle')}</> : <><XCircle className="w-6 h-6 text-red-600" /> {t('player', 'wrongTitle')}</>}
                                    </h4>
                                    <button
                                        onClick={() => playAudio(selectedOption.option_id === currentQ.correct_option_id ? currentQ.explanation_correct : currentQ.explanation_wrong, 'explanation')}
                                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${playingAudioId === 'explanation' ? 'bg-orange-100 text-[#FF7A00]' : 'bg-white/50 hover:bg-white text-gray-700'}`}
                                        title="Listen to explanation"
                                    >
                                        {playingAudioId === 'explanation' ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-base font-medium opacity-90 leading-relaxed">
                                    {selectedOption.option_id === currentQ.correct_option_id ? currentQ.explanation_correct : currentQ.explanation_wrong}
                                </p>
                                {currentQ.critical && selectedOption.option_id !== currentQ.correct_option_id && (
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-700 bg-red-100 px-4 py-2.5 rounded-xl uppercase tracking-wider w-fit shadow-inner">
                                        <AlertTriangle className="w-5 h-5" /> {t('player', 'critical')}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="px-10 py-4 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-extrabold text-lg rounded-full shadow-[0_8px_20px_rgb(229,90,0,0.25)] hover:shadow-[0_12px_25px_rgb(229,90,0,0.35)] hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isSubmitting ? t('player', 'evaluating') : (currentQIdx === scenario.questions.length - 1 ? t('player', 'finish') : t('player', 'next'))}
                                    {!isSubmitting && <ArrowRight className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
