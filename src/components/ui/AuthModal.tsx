'use client';

/**
 * Auth Modal Component
 * 
 * Optional authentication modal for saving progress.
 * Supports email/password signup, login, magic link, and forgot password.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Mail, Lock, Loader2,
    CheckCircle, AlertCircle, Sparkles, Eye, EyeOff, User
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { migrateAnonymousProgress } from '@/services/ProgressService';

type AuthMode = 'signin' | 'signup' | 'magic-link' | 'forgot-password';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const language = useAppStore(state => state.language);
    const setUserId = useAppStore(state => state.setUserId);
    const achievements = useAppStore(state => state.achievements);
    const visitedLandmarks = useAppStore(state => state.visitedLandmarks);

    const [mode, setMode] = useState<AuthMode>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const getText = (en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setError(null);
        setSuccess(null);
    };

    const handleModeChange = (newMode: AuthMode) => {
        resetForm();
        setMode(newMode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            if (mode === 'forgot-password') {
                // Password reset request
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
                });

                if (error) throw error;

                setSuccess(getText(
                    'Check your email for the reset link!',
                    'Cek emailmu untuk link reset!'
                ));
            } else if (mode === 'magic-link') {
                // Magic link authentication
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;

                setSuccess(getText(
                    'Check your email for the magic link!',
                    'Cek emailmu untuk link ajaib!'
                ));
            } else if (mode === 'signup') {
                // Validate password length
                if (password.length < 8) {
                    throw new Error(getText(
                        'Password must be at least 8 characters',
                        'Kata sandi minimal 8 karakter'
                    ));
                }

                // Email/password signup
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;

                if (data.user) {
                    // Migrate anonymous progress
                    await migrateAnonymousProgress(data.user.id);
                    setUserId(data.user.id);

                    if (data.session) {
                        // No email confirmation required
                        setSuccess(getText(
                            'Account created! Your progress is saved.',
                            'Akun dibuat! Progressmu tersimpan.'
                        ));
                        setTimeout(() => {
                            onClose();
                        }, 1500);
                    } else {
                        // Email confirmation required
                        setSuccess(getText(
                            'Check your email to confirm your account!',
                            'Cek emailmu untuk konfirmasi akun!'
                        ));
                    }
                }
            } else {
                // Email/password signin
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.user) {
                    // Migrate anonymous progress
                    await migrateAnonymousProgress(data.user.id);
                    setUserId(data.user.id);

                    setSuccess(getText(
                        'Welcome back! Your progress is synced.',
                        'Selamat datang kembali! Progressmu tersinkron.'
                    ));

                    setTimeout(() => {
                        onClose();
                    }, 1500);
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : getText('Something went wrong', 'Terjadi kesalahan')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueAsGuest = () => {
        onClose();
    };

    if (!isOpen) return null;

    // Get header content based on mode
    const getHeaderContent = () => {
        switch (mode) {
            case 'signin':
                return {
                    title: getText('Welcome Back', 'Selamat Datang Kembali'),
                    subtitle: getText('Sign in to sync your progress', 'Masuk untuk sinkronkan progressmu'),
                    gradient: 'from-blue-600/20 to-purple-600/20',
                };
            case 'forgot-password':
                return {
                    title: getText('Reset Password', 'Reset Kata Sandi'),
                    subtitle: getText("We'll send you a reset link", 'Kami akan kirim link reset'),
                    gradient: 'from-amber-600/20 to-orange-600/20',
                };
            default:
                return {
                    title: getText('Save Your Progress', 'Simpan Progressmu'),
                    subtitle: getText('Keep your achievements across devices', 'Simpan pencapaianmu di semua perangkat'),
                    gradient: 'from-purple-600/20 to-blue-600/20',
                };
        }
    };

    const headerContent = getHeaderContent();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[90]
                           flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-slate-900/95 backdrop-blur-xl rounded-2xl
                               border border-white/10 shadow-2xl
                               w-full max-w-md overflow-hidden relative"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full 
                                   hover:bg-white/10 transition-colors z-10"
                    >
                        <X size={20} className="text-white/70" />
                    </button>

                    {/* Header */}
                    <div className={`bg-gradient-to-r ${headerContent.gradient} 
                                    border-b border-white/10 p-6`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <User size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {headerContent.title}
                                </h2>
                                <p className="text-sm text-white/50">
                                    {headerContent.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Current progress preview (only for signup/signin) */}
                        {(mode === 'signup' || mode === 'signin') &&
                            (visitedLandmarks.length > 0 || achievements.length > 0) && (
                                <div className="flex gap-4 p-3 bg-white/5 rounded-xl">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">
                                            {visitedLandmarks.length}
                                        </div>
                                        <div className="text-xs text-white/50">
                                            {getText('Landmarks', 'Landmark')}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-400">
                                            {achievements.length}
                                        </div>
                                        <div className="text-xs text-white/50">
                                            {getText('Achievements', 'Pencapaian')}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-center justify-end">
                                        <Sparkles size={20} className="text-yellow-400" />
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-red-500/20 
                                           border border-red-500/30 rounded-lg text-red-300 text-sm"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        {/* Success message */}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-green-500/20 
                                           border border-green-500/30 rounded-lg text-green-300 text-sm"
                            >
                                <CheckCircle size={16} />
                                {success}
                            </motion.div>
                        )}

                        {/* Email input */}
                        <div>
                            <label className="block text-sm text-white/70 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10
                                               rounded-xl text-white placeholder:text-white/30
                                               focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                        </div>

                        {/* Password input (not for magic link or forgot password) */}
                        {mode !== 'magic-link' && mode !== 'forgot-password' && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm text-white/70">
                                        {getText('Password', 'Kata Sandi')}
                                    </label>
                                    {mode === 'signin' && (
                                        <button
                                            type="button"
                                            onClick={() => handleModeChange('forgot-password')}
                                            className="text-xs text-blue-400 hover:text-blue-300"
                                        >
                                            {getText('Forgot?', 'Lupa?')}
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={mode === 'signup' ? 8 : undefined}
                                        className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10
                                                   rounded-xl text-white placeholder:text-white/30
                                                   focus:outline-none focus:border-blue-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {mode === 'signup' && (
                                    <p className="text-xs text-white/40 mt-1">
                                        {getText('Minimum 8 characters', 'Minimal 8 karakter')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 
                                       disabled:bg-blue-600/50 disabled:cursor-not-allowed
                                       text-white font-medium rounded-xl
                                       transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {getText('Please wait...', 'Mohon tunggu...')}
                                </>
                            ) : (
                                <>
                                    {mode === 'signin' && getText('Sign In', 'Masuk')}
                                    {mode === 'signup' && getText('Create Account', 'Buat Akun')}
                                    {mode === 'magic-link' && getText('Send Magic Link', 'Kirim Link Ajaib')}
                                    {mode === 'forgot-password' && getText('Send Reset Link', 'Kirim Link Reset')}
                                </>
                            )}
                        </button>

                        {/* Mode switchers */}
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-sm">
                            {mode === 'forgot-password' ? (
                                <button
                                    type="button"
                                    onClick={() => handleModeChange('signin')}
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    {getText('Back to Sign In', 'Kembali ke Masuk')}
                                </button>
                            ) : (
                                <>
                                    {mode !== 'magic-link' && (
                                        <button
                                            type="button"
                                            onClick={() => handleModeChange('magic-link')}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            {getText('Use Magic Link', 'Gunakan Link Ajaib')}
                                        </button>
                                    )}
                                    {mode === 'magic-link' && (
                                        <button
                                            type="button"
                                            onClick={() => handleModeChange('signup')}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            {getText('Use Password', 'Gunakan Kata Sandi')}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Toggle signin/signup */}
                        {mode !== 'forgot-password' && (
                            <div className="text-center text-sm text-white/50">
                                {mode === 'signin' ? (
                                    <>
                                        {getText("Don't have an account? ", 'Belum punya akun? ')}
                                        <button
                                            type="button"
                                            onClick={() => handleModeChange('signup')}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            {getText('Sign Up', 'Daftar')}
                                        </button>
                                    </>
                                ) : (mode === 'signup' || mode === 'magic-link') && (
                                    <>
                                        {getText('Already have an account? ', 'Sudah punya akun? ')}
                                        <button
                                            type="button"
                                            onClick={() => handleModeChange('signin')}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            {getText('Sign In', 'Masuk')}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Continue as guest */}
                        <div className="pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={handleContinueAsGuest}
                                className="w-full py-2 text-white/50 hover:text-white/70
                                           text-sm transition-colors"
                            >
                                {getText('Continue as Guest', 'Lanjut sebagai Tamu')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
