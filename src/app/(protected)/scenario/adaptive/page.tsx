"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, XCircle, Loader2, Volume2, Square, Bot } from 'lucide-react';

export default function AdaptiveMCQPlayer() {
    const router = useRouter();
    const { language, t } = useLanguage();

    const [questionData, setQuestionData] = useState<any>(null);
    const [difficulty, setDifficulty] = useState(3);
    const [roundCount, setRoundCount] = useState(1);

    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    // Evaluation state
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

    const topics = [
        "snake bite first aid for rural health worker",
        "diarrhea management in children",
        "TB medication administration",
        "maternal health danger signs",
        "neonatal care"
    ];

    const generateNextQuestion = async (currentDiff: number) => {
        setIsGenerating(true);
        setFeedback(null);
        setSelectedOption(null);
        setHasAnswered(false);
        setIsCorrectFeedback(null);

        // Pick a random topic for variety in adaptive mode
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];

        try {
            const res = await fetch('/api/rag/simulate/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: randomTopic, difficulty: currentDiff })
            });
            const data = await res.json();
            if (data.success && data.question) {
                setQuestionData({
                    ...data.question,
                    topic: randomTopic
                });
            } else {
                router.push('/dashboard');
            }
        } catch (e) {
            console.error(e);
            router.push('/dashboard');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        generateNextQuestion(3);
    }, []);

    useEffect(() => {
        window.speechSynthesis.cancel();
        setPlayingAudioId(null);
    }, [questionData]);

    const playAudio = (text: string, id: string) => {
        if (playingAudioId === id) {
            window.speechSynthesis.cancel();
            setPlayingAudioId(null);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        setPlayingAudioId(id);
        window.speechSynthesis.speak(utterance);
    };

    const handleSelect = (option: any) => {
        if (hasAnswered) return;
        setSelectedOption(option);
    };

    const handleSubmit = async () => {
        if (!selectedOption) return;
        setHasAnswered(true);
        setIsEvaluating(true);

        try {
            const res = await fetch('/api/rag/simulate/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scenario: questionData.patient_prompt,
                    user_choice: selectedOption.text,
                    correct_option: questionData.options.find((o: any) => o.option_id === questionData.correct_option_id)?.text || "",
                    context: questionData.python_context || ""
                })
            });
            const data = await res.json();

            setFeedback(data.feedback);
            setIsCorrectFeedback(data.is_correct);

            // Adaptive Engine Logic
            if (data.is_correct) {
                setDifficulty(prev => Math.min(10, prev + 1));
            } else {
                setDifficulty(prev => Math.max(1, prev - 1));
            }

        } catch (error) {
            console.error(error);
            setFeedback("Failed to get AI evaluation. The correct option was " + questionData.correct_option_id);
            setIsCorrectFeedback(selectedOption.option_id === questionData.correct_option_id);
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleNextPhase = () => {
        setRoundCount(prev => prev + 1);
        generateNextQuestion(difficulty);
    };

    if (!questionData) return <div className="flex min-h-[40vh] items-center justify-center bg-transparent"><Loader2 className="w-12 h-12 animate-spin text-purple-600" /></div>;

    return (
        <div className="flex flex-1 min-h-0 flex-col md:flex-row gap-4 md:gap-6 font-sans relative">

            {/* Left Sidebar */}
            <div className="w-full md:w-3/12 lg:w-[28%] flex flex-col gap-4 md:gap-5 overflow-y-auto custom-scrollbar pb-6 pr-1">

                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[1.5rem] shadow-sm p-5 text-white flex-shrink-0 relative overflow-hidden">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-violet-200 mb-1">RAG ENGINE</p>
                    <h3 className="font-extrabold text-lg leading-tight mb-4 relative z-10 drop-shadow-sm">AI Adaptive Training</h3>
                    <div className="flex flex-col gap-2 text-xs font-bold flex-wrap">
                        <span className="bg-white/20 px-3 py-1.5 rounded-full shadow-inner inline-block w-fit">Round {roundCount} (Infinite)</span>
                        <span className="bg-white/20 px-3 py-1.5 rounded-full shadow-inner inline-block w-fit">Difficulty: lvl {difficulty}/10</span>
                        <span className="bg-white/20 px-3 py-1.5 rounded-full shadow-inner inline-block w-fit capitalize truncate flex-1" title={questionData.topic}>Topic: {questionData.topic}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-5 md:p-6 flex-shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-extrabold text-base md:text-lg text-gray-900 flex items-center gap-2">
                            📌 AI Scenario Context
                        </h4>
                        <button onClick={() => playAudio(questionData.patient_prompt, 'prompt')} className={`p-2 rounded-full transition-colors flex-shrink-0 shadow-sm border ${playingAudioId === 'prompt' ? 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200/50' : 'bg-white text-gray-400 hover:text-fuchsia-600 border-gray-100'}`}>
                            {playingAudioId === 'prompt' ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-[0_0_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                        <div className="border-l-4 border-fuchsia-500 p-5 text-base md:text-lg text-gray-800 font-semibold leading-relaxed">
                            {questionData.patient_prompt}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Main Stage */}
            <div className="w-full md:w-9/12 lg:w-[72%] flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pt-6 pb-6 px-6 md:px-8">

                    {(isGenerating || isEvaluating) && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                            <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-xl border border-violet-100 uppercase tracking-widest text-[#FF7A00] font-black">
                                <Loader2 className="w-12 h-12 animate-spin text-fuchsia-600" />
                                {isGenerating ? "Gemini 2.5 Generating..." : "RAG Grading Response..."}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-start gap-4 mt-6 md:mt-8 px-1">
                        <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-[#111827] leading-tight flex items-center gap-3">
                            <Bot className="w-8 h-8 text-fuchsia-600 flex-shrink-0" />
                            {questionData.mcq_question}
                        </h3>
                    </div>

                    <div className="space-y-3 sm:space-y-4 flex-1 mt-8 px-1 pb-8 md:pb-12 max-w-4xl">
                        {questionData.options.map((opt: any) => {
                            const isSelected = selectedOption?.option_id === opt.option_id;
                            const isCorrectTarget = opt.option_id === questionData.correct_option_id;
                            let cardClass = "bg-white border border-gray-200/80 hover:border-violet-400 hover:shadow-sm cursor-pointer";
                            let icon = null;

                            if (hasAnswered && feedback) {
                                if (isSelected) {
                                    if (isCorrectFeedback) {
                                        cardClass = "bg-green-50 border-green-500 shadow-sm";
                                        icon = <CheckCircle2 className="text-green-600 w-6 h-6 sm:w-7 sm:h-7" />;
                                    } else {
                                        cardClass = "bg-red-50 border-red-500 shadow-sm";
                                        icon = <XCircle className="text-red-600 w-6 h-6 sm:w-7 sm:h-7" />;
                                    }
                                } else if (isCorrectTarget) {
                                    cardClass = "bg-green-50 border-green-400 border-dashed opacity-80";
                                } else {
                                    cardClass = "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed";
                                }
                            } else if (isSelected) {
                                cardClass = "bg-violet-50 border-violet-500 shadow-sm shadow-violet-100";
                            }

                            return (
                                <div key={opt.option_id} onClick={() => handleSelect(opt)} className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 ${cardClass}`}>
                                    <div className="flex items-center gap-4 relative z-10 w-full">
                                        <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-colors ${hasAnswered && feedback ? (isSelected ? (isCorrectFeedback ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500') : (isCorrectTarget ? 'border-green-400' : 'border-gray-200')) : (isSelected ? 'border-violet-500' : 'border-gray-300')}`}>
                                            {hasAnswered && feedback && isSelected && isCorrectFeedback && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white animate-in zoom-in" />}
                                            {hasAnswered && feedback && isSelected && !isCorrectFeedback && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white animate-in zoom-in" />}
                                            {!hasAnswered && isSelected && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-violet-500 animate-in zoom-in duration-200" />}
                                        </div>
                                        <div className={`font-semibold text-sm sm:text-base md:text-[1.05rem] leading-relaxed flex-1 ${(hasAnswered && feedback && !isSelected && !isCorrectTarget) ? 'text-gray-400' : 'text-gray-700'}`}>
                                            {opt.text}
                                        </div>
                                        {icon && <div className="flex-shrink-0 ml-2 animate-in fade-in zoom-in">{icon}</div>}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Evaluation Feedback Panel */}
                        {feedback && (
                            <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <h4 className="font-extrabold text-[#111827] flex items-center gap-2 mb-3 text-lg">
                                    {isCorrectFeedback ? 'Excellent Work! 🎉' : 'Learning Opportunity 📚'}
                                </h4>
                                <p className="text-gray-800 leading-relaxed font-medium">
                                    {feedback}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/90 backdrop-blur-md border-t border-gray-100 flex justify-end gap-3 z-40">
                    <button onClick={() => router.push('/dashboard')} className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors text-sm sm:text-base border border-gray-200 shadow-sm hover:text-gray-700 w-full sm:w-auto text-center">
                        Exit Simulation
                    </button>
                    {!hasAnswered || !feedback ? (
                        <button disabled={!selectedOption || isEvaluating} onClick={handleSubmit} className={`px-8 sm:px-10 py-3 sm:py-3.5 rounded-full font-bold text-white transition-all text-sm sm:text-base shadow-lg w-full sm:w-auto text-center flex items-center justify-center gap-2 ${selectedOption && !isEvaluating ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:-translate-y-0.5 hover:shadow-xl' : 'bg-gray-300 shadow-none'}`}>
                            Submit to AI
                        </button>
                    ) : (
                        <button onClick={handleNextPhase} className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full font-bold text-white transition-all text-sm sm:text-base shadow-lg w-full sm:w-auto text-center flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:-translate-y-0.5 hover:shadow-xl">
                            Next Round
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
