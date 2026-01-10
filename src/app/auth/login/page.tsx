'use client';

/**
 * Login Page
 * 
 * Full-page login for direct access and bookmarks.
 * Matches the app's dark glassmorphism design.
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { migrateAnonymousProgress } from '@/services/ProgressService';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const language = useAppStore(state => state.language);
    const setUserId = useAppStore(state => state.setUserId);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getText = (en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    };

    // Check for error from callback
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (data.user) {
                // Migrate anonymous progress
                await migrateAnonymousProgress(data.user.id);
                setUserId(data.user.id);

                // Redirect to explore
                router.push('/explore');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : getText('Invalid email or password', 'Email atau kata sandi salah')
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md"
        >
            {/* Back button */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                {getText('Back to Home', 'Kembali ke Beranda')}
            </Link>

            {/* Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 
                            shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 
                                border-b border-white/10 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">
                        {getText('Welcome Back', 'Selamat Datang Kembali')}
                    </h1>
                    <p className="text-white/60 mt-1">
                        {getText('Sign in to sync your progress', 'Masuk untuk sinkronkan progressmu')}
                    </p>
                </div>

                {/* Form */}
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
                                           focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm text-white/70">
                                {getText('Password', 'Kata Sandi')}
                            </label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                {getText('Forgot?', 'Lupa?')}
                            </Link>
                        </div>
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
                    </div>

                    {/* Submit */}
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
                                {getText('Signing in...', 'Sedang masuk...')}
                            </>
                        ) : (
                            getText('Sign In', 'Masuk')
                        )}
                    </button>

                    {/* Register link */}
                    <p className="text-center text-sm text-white/50">
                        {getText("Don't have an account? ", 'Belum punya akun? ')}
                        <Link
                            href="/auth/register"
                            className="text-blue-400 hover:text-blue-300"
                        >
                            {getText('Sign Up', 'Daftar')}
                        </Link>
                    </p>
                </form>
            </div>

            {/* Guest option */}
            <div className="text-center mt-4">
                <Link
                    href="/explore"
                    className="text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                    {getText('Continue as Guest', 'Lanjut sebagai Tamu')}
                </Link>
            </div>
        </motion.div>
    );
}

// Loading fallback
function LoginLoading() {
    return (
        <div className="w-full max-w-md">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 
                            shadow-2xl p-8 text-center">
                <Loader2 size={32} className="text-blue-400 mx-auto animate-spin" />
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                        flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <Suspense fallback={<LoginLoading />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
