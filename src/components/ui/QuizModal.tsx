'use client';

/**
 * Quiz Modal Component
 * 
 * Interactive quiz mode where Opung asks questions about landmarks.
 * AI-generated questions based on landmark knowledge.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Brain, CheckCircle, XCircle,
    ChevronRight, Trophy, RefreshCw, Loader2
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Landmark } from '@/types';

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    landmark: Landmark | null;
}

export function QuizModal({ isOpen, onClose, landmark }: QuizModalProps) {
    const language = useAppStore(state => state.language);
    const addQuizScore = useAppStore(state => state.addQuizScore);

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [quizComplete, setQuizComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const getText = (en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    };

    // Generate quiz questions from API
    const generateQuiz = useCallback(async () => {
        if (!landmark) return;

        setIsLoading(true);
        setError(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizComplete(false);

        try {
            const response = await fetch('/api/chat/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    landmarkTitle: landmark.title,
                    category: landmark.category,
                    loreContext: landmark.lore_context,
                    language,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate quiz');
            }

            const data = await response.json();

            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
            } else {
                throw new Error('No questions generated');
            }
        } catch (err) {
            console.error('Quiz generation error:', err);
            const errorMsg = language === 'id' || language === 'bt'
                ? 'Gagal membuat kuis. Silakan coba lagi.'
                : 'Failed to generate quiz. Please try again.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [landmark, language]);

    // Generate quiz when modal opens
    useEffect(() => {
        if (isOpen && landmark) {
            generateQuiz();
        }
    }, [isOpen, landmark, generateQuiz]);

    const handleSelectAnswer = (index: number) => {
        if (showResult) return;

        setSelectedAnswer(index);
        setShowResult(true);

        if (index === currentQuestion.correctIndex) {
            setScore(s => s + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            // Quiz complete
            setQuizComplete(true);

            // Save score
            if (landmark) {
                addQuizScore({
                    landmarkId: landmark.id,
                    score,
                    maxScore: totalQuestions,
                    completedAt: new Date().toISOString(),
                });
            }
        }
    };

    const handleRetry = () => {
        generateQuiz();
    };

    const handleClose = () => {
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setQuizComplete(false);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80]
                           flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-slate-900/95 backdrop-blur-xl rounded-2xl
                               border border-white/10 shadow-2xl
                               w-full max-w-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 
                                    border-b border-white/10 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Brain size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {getText('Cultural Quiz', 'Kuis Budaya')}
                                </h2>
                                {landmark && (
                                    <p className="text-sm text-white/50">
                                        {landmark.title}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={20} className="text-white/70" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Loading state */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 size={48} className="text-purple-400 animate-spin mb-4" />
                                <p className="text-white/60">
                                    {getText('Opung is preparing questions...', 'Opung sedang menyiapkan pertanyaan...')}
                                </p>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <XCircle size={48} className="text-red-400 mb-4" />
                                <p className="text-white/60 text-center mb-4">{error}</p>
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center gap-2 px-4 py-2
                                               bg-purple-600 hover:bg-purple-700 
                                               text-white rounded-lg transition-colors"
                                >
                                    <RefreshCw size={16} />
                                    {getText('Try Again', 'Coba Lagi')}
                                </button>
                            </div>
                        )}

                        {/* Quiz complete */}
                        {quizComplete && !error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <motion.div
                                    initial={{ rotate: -180, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="mb-4"
                                >
                                    <Trophy size={64} className="text-amber-400" />
                                </motion.div>

                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {getText('Quiz Complete!', 'Kuis Selesai!')}
                                </h3>

                                <div className="text-4xl font-bold text-purple-400 mb-2">
                                    {score}/{totalQuestions}
                                </div>

                                <p className="text-white/60 text-center mb-6">
                                    {score === totalQuestions
                                        ? getText('Perfect score! You\'re a cultural expert!', 'Nilai sempurna! Kamu ahli budaya!')
                                        : score >= totalQuestions * 0.7
                                            ? getText('Great job! Keep learning!', 'Bagus! Terus belajar!')
                                            : getText('Keep exploring to learn more!', 'Terus jelajahi untuk belajar lebih banyak!')
                                    }
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRetry}
                                        className="flex items-center gap-2 px-4 py-2
                                                   bg-white/10 hover:bg-white/20 
                                                   text-white rounded-lg transition-colors"
                                    >
                                        <RefreshCw size={16} />
                                        {getText('Play Again', 'Main Lagi')}
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 
                                                   text-white rounded-lg transition-colors"
                                    >
                                        {getText('Close', 'Tutup')}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Question display */}
                        {!isLoading && !error && !quizComplete && currentQuestion && (
                            <>
                                {/* Progress */}
                                <div className="flex items-center justify-between text-sm text-white/50 mb-4">
                                    <span>
                                        {getText('Question', 'Pertanyaan')} {currentQuestionIndex + 1}/{totalQuestions}
                                    </span>
                                    <span>
                                        {getText('Score', 'Skor')}: {score}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                                    />
                                </div>

                                {/* Question */}
                                <h3 className="text-lg text-white font-medium mb-6">
                                    {currentQuestion.question}
                                </h3>

                                {/* Options */}
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option, index) => {
                                        const isSelected = selectedAnswer === index;
                                        const isCorrect = index === currentQuestion.correctIndex;
                                        const showCorrectness = showResult;

                                        let bgColor = 'bg-white/5 hover:bg-white/10';
                                        let borderColor = 'border-white/10';

                                        if (showCorrectness) {
                                            if (isCorrect) {
                                                bgColor = 'bg-green-500/20';
                                                borderColor = 'border-green-500';
                                            } else if (isSelected && !isCorrect) {
                                                bgColor = 'bg-red-500/20';
                                                borderColor = 'border-red-500';
                                            }
                                        }

                                        return (
                                            <motion.button
                                                key={index}
                                                whileTap={{ scale: showResult ? 1 : 0.98 }}
                                                onClick={() => handleSelectAnswer(index)}
                                                disabled={showResult}
                                                className={`w-full p-4 rounded-xl border text-left
                                                           transition-all duration-200
                                                           ${bgColor} ${borderColor}
                                                           ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white">{option}</span>
                                                    {showCorrectness && isCorrect && (
                                                        <CheckCircle size={20} className="text-green-400" />
                                                    )}
                                                    {showCorrectness && isSelected && !isCorrect && (
                                                        <XCircle size={20} className="text-red-400" />
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Explanation and Next button */}
                                {showResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6"
                                    >
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
                                            <p className="text-sm text-white/70">
                                                <span className="font-medium text-white">
                                                    {getText('Explanation:', 'Penjelasan:')}
                                                </span>{' '}
                                                {currentQuestion.explanation}
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleNextQuestion}
                                            className="w-full flex items-center justify-center gap-2
                                                       py-3 bg-purple-600 hover:bg-purple-700 
                                                       text-white font-medium rounded-xl
                                                       transition-colors"
                                        >
                                            {currentQuestionIndex < totalQuestions - 1
                                                ? getText('Next Question', 'Pertanyaan Berikutnya')
                                                : getText('See Results', 'Lihat Hasil')
                                            }
                                            <ChevronRight size={18} />
                                        </button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
