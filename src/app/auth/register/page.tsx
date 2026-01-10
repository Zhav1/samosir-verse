'use client';

/**
 * Register Page
 * 
 * Full-page registration for new users.
 * Matches the app's dark glassmorphism design.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Mail, Lock, Loader2, AlertCircle, ArrowLeft,
    Eye, EyeOff, CheckCircle, User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { migrateAnonymousProgress } from '@/services/ProgressService';

export default function RegisterPage() {
    const router = useRouter();
    const language = useAppStore(state => state.language);
    const setUserId = useAppStore(state => state.setUserId);
    const visitedLandmarks = useAppStore(state => state.visitedLandmarks);
    const achievements = useAppStore(state => state.achievements);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const getText = (en: string, id: string) => {
        return language === 'id' || language === 'bt' ? id : en;
    };

    // Password validation
    const passwordChecks = {
        length: password.length >= 8,
        match: password === confirmPassword && confirmPassword.length > 0,
    };

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
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (authError) throw authError;

            if (data.user) {
                // Migrate anonymous progress
                await migrateAnonymousProgress(data.user.id);
                setUserId(data.user.id);

                // Check if email confirmation is required
                if (data.session) {
                    // No email confirmation required - redirect immediately
                    router.push('/explore');
                } else {
                    // Email confirmation required
                    setSuccess(true);
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : getText('Registration failed', 'Pendaftaran gagal')
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
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

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
                    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 
                                    border-b border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <User size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {getText('Create Account', 'Buat Akun')}
                                </h1>
                                <p className="text-white/60 text-sm">
                                    {getText('Save your exploration progress', 'Simpan progres eksplorasimu')}
                                </p>
                            </div>
                        </div>

                        {/* Progress preview */}
                        {(visitedLandmarks.length > 0 || achievements.length > 0) && (
                            <div className="flex gap-4 p-3 bg-white/5 rounded-xl mt-4">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-blue-400">
                                        {visitedLandmarks.length}
                                    </div>
                                    <div className="text-xs text-white/50">
                                        {getText('Landmarks', 'Landmark')}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-amber-400">
                                        {achievements.length}
                                    </div>
                                    <div className="text-xs text-white/50">
                                        {getText('Achievements', 'Pencapaian')}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-end text-xs text-white/40">
                                    {getText('Will be saved!', 'Akan disimpan!')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Success state */}
                    {success ? (
                        <div className="p-6 text-center">
                            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">
                                {getText('Check Your Email', 'Cek Emailmu')}
                            </h2>
                            <p className="text-white/60 mb-4">
                                {getText(
                                    'We sent a confirmation link to your email. Please click it to complete registration.',
                                    'Kami mengirim link konfirmasi ke emailmu. Klik untuk menyelesaikan pendaftaran.'
                                )}
                            </p>
                            <Link
                                href="/auth/login"
                                className="text-blue-400 hover:text-blue-300"
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
                                                   focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm text-white/70 mb-1">
                                    {getText('Password', 'Kata Sandi')}
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
                                                   focus:outline-none focus:border-purple-500/50"
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
                                                   focus:outline-none focus:border-purple-500/50"
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
                                disabled={isLoading || !passwordChecks.length}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 
                                           disabled:bg-purple-600/50 disabled:cursor-not-allowed
                                           text-white font-medium rounded-xl
                                           transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {getText('Creating account...', 'Membuat akun...')}
                                    </>
                                ) : (
                                    getText('Create Account', 'Buat Akun')
                                )}
                            </button>

                            {/* Login link */}
                            <p className="text-center text-sm text-white/50">
                                {getText('Already have an account? ', 'Sudah punya akun? ')}
                                <Link
                                    href="/auth/login"
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    {getText('Sign In', 'Masuk')}
                                </Link>
                            </p>
                        </form>
                    )}
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
        </div>
    );
}
