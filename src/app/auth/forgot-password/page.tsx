'use client';

/**
 * Forgot Password Page
 * 
 * Request password reset email.
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

export default function ForgotPasswordPage() {
    const language = useAppStore(state => state.language);

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const getText = (en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : getText('Failed to send reset email', 'Gagal mengirim email reset')
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
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
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
                    <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 
                                    border-b border-white/10 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white">
                            {getText('Reset Password', 'Reset Kata Sandi')}
                        </h1>
                        <p className="text-white/60 mt-1">
                            {getText(
                                "Enter your email and we'll send a reset link",
                                'Masukkan emailmu dan kami akan kirim link reset'
                            )}
                        </p>
                    </div>

                    {/* Success state */}
                    {success ? (
                        <div className="p-6 text-center">
                            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">
                                {getText('Email Sent!', 'Email Terkirim!')}
                            </h2>
                            <p className="text-white/60 mb-4">
                                {getText(
                                    'Check your inbox for the password reset link. It may take a few minutes.',
                                    'Cek inboxmu untuk link reset password. Mungkin butuh beberapa menit.'
                                )}
                            </p>
                            <Link
                                href="/auth/login"
                                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 
                                           text-white rounded-lg transition-colors"
                            >
                                {getText('Back to Login', 'Kembali ke Login')}
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

                            {/* Email */}
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
                                                   focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-amber-600 hover:bg-amber-700 
                                           disabled:bg-amber-600/50 disabled:cursor-not-allowed
                                           text-white font-medium rounded-xl
                                           transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {getText('Sending...', 'Mengirim...')}
                                    </>
                                ) : (
                                    getText('Send Reset Link', 'Kirim Link Reset')
                                )}
                            </button>

                            {/* Back to login */}
                            <p className="text-center text-sm text-white/50">
                                {getText('Remember your password? ', 'Ingat kata sandimu? ')}
                                <Link
                                    href="/auth/login"
                                    className="text-amber-400 hover:text-amber-300"
                                >
                                    {getText('Sign In', 'Masuk')}
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
