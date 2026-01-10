'use client';

/**
 * Reset Password Page
 * 
 * Set new password after clicking reset link in email.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Lock, Loader2, AlertCircle, ArrowLeft,
    Eye, EyeOff, CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

export default function ResetPasswordPage() {
    const router = useRouter();
    const language = useAppStore(state => state.language);
    const setUserId = useAppStore(state => state.setUserId);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    const getText = useCallback((en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    }, [language]);

    // Password validation
    const passwordChecks = {
        length: password.length >= 8,
        match: password === confirmPassword && confirmPassword.length > 0,
    };

    // Check if we have a valid recovery session
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setIsValidSession(true);
                } else {
                    // No session - invalid or expired link
                    setError(getText(
                        'Invalid or expired reset link. Please request a new one.',
                        'Link reset tidak valid atau sudah kadaluarsa. Silakan minta yang baru.'
                    ));
                }
            } catch (err) {
                console.error('Session check error:', err);
                setError(getText(
                    'Something went wrong. Please try again.',
                    'Terjadi kesalahan. Silakan coba lagi.'
                ));
            } finally {
                setCheckingSession(false);
            }
        };

        checkSession();
    }, [getText]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate password
        if (!passwordChecks.length) {
            setError(getText(
                'Password must be at least 8 characters',
                'Kata sandi minimal 8 karakter'
            ));
            return;
        }

        if (!passwordChecks.match) {
            setError(getText(
                'Passwords do not match',
                'Kata sandi tidak cocok'
            ));
            return;
        }

        setIsLoading(true);

        try {
            const { data, error: updateError } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) throw updateError;

            if (data.user) {
                setUserId(data.user.id);
                setSuccess(true);

                // Redirect after showing success
                setTimeout(() => {
                    router.push('/explore');
                }, 2000);
            }
        } catch (err) {
            console.error('Password update error:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : getText('Failed to update password', 'Gagal mengubah kata sandi')
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                        flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                {/* Back button */}
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    {getText('Back to Login', 'Kembali ke Login')}
                </Link>

                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 
                                shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 
                                    border-b border-white/10 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white">
                            {getText('Set New Password', 'Buat Kata Sandi Baru')}
                        </h1>
                        <p className="text-white/60 mt-1">
                            {getText('Choose a strong password', 'Pilih kata sandi yang kuat')}
                        </p>
                    </div>

                    {/* Loading state */}
                    {checkingSession ? (
                        <div className="p-6 text-center">
                            <Loader2 size={32} className="text-green-400 mx-auto mb-4 animate-spin" />
                            <p className="text-white/60">
                                {getText('Verifying...', 'Memverifikasi...')}
                            </p>
                        </div>
                    ) : success ? (
                        /* Success state */
                        <div className="p-6 text-center">
                            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">
                                {getText('Password Updated!', 'Kata Sandi Diperbarui!')}
                            </h2>
                            <p className="text-white/60 mb-4">
                                {getText(
                                    'Redirecting you to explore...',
                                    'Mengarahkanmu ke explore...'
                                )}
                            </p>
                            <Loader2 size={24} className="text-green-400 mx-auto animate-spin" />
                        </div>
                    ) : !isValidSession ? (
                        /* Invalid session */
                        <div className="p-6 text-center">
                            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">
                                {getText('Link Expired', 'Link Kadaluarsa')}
                            </h2>
                            <p className="text-white/60 mb-4">{error}</p>
                            <Link
                                href="/auth/forgot-password"
                                className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 
                                           text-white rounded-lg transition-colors"
                            >
                                {getText('Request New Link', 'Minta Link Baru')}
                            </Link>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Error */}
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

                            {/* New Password */}
                            <div>
                                <label className="block text-sm text-white/70 mb-1">
                                    {getText('New Password', 'Kata Sandi Baru')}
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10
                                                   rounded-xl text-white placeholder:text-white/30
                                                   focus:outline-none focus:border-green-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm text-white/70 mb-1">
                                    {getText('Confirm Password', 'Konfirmasi Kata Sandi')}
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10
                                                   rounded-xl text-white placeholder:text-white/30
                                                   focus:outline-none focus:border-green-500/50"
                                    />
                                </div>
                            </div>

                            {/* Password requirements */}
                            <div className="space-y-1 text-sm">
                                <div className={`flex items-center gap-2 ${passwordChecks.length ? 'text-green-400' : 'text-white/40'}`}>
                                    <CheckCircle size={14} />
                                    {getText('At least 8 characters', 'Minimal 8 karakter')}
                                </div>
                                <div className={`flex items-center gap-2 ${passwordChecks.match ? 'text-green-400' : 'text-white/40'}`}>
                                    <CheckCircle size={14} />
                                    {getText('Passwords match', 'Kata sandi cocok')}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading || !passwordChecks.length || !passwordChecks.match}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 
                                           disabled:bg-green-600/50 disabled:cursor-not-allowed
                                           text-white font-medium rounded-xl
                                           transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {getText('Updating...', 'Memperbarui...')}
                                    </>
                                ) : (
                                    getText('Update Password', 'Perbarui Kata Sandi')
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
