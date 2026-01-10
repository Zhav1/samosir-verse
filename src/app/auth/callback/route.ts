import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth Callback Handler
 * 
 * Handles redirects from Supabase Auth for:
 * - Magic link login
 * - OAuth providers
 * - Password reset
 * - Email confirmation
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');
    const error = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');

    // Handle errors from Supabase
    if (error) {
        console.error('[Auth Callback] Error:', error, error_description);
        return NextResponse.redirect(
            new URL(`/auth/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
        );
    }

    // Exchange code for session
    if (code) {
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    flowType: 'pkce',
                },
            });
            
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
                console.error('[Auth Callback] Exchange error:', exchangeError);
                return NextResponse.redirect(
                    new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
                );
            }

            // Handle password reset flow
            if (type === 'recovery') {
                return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin));
            }

            // Successful auth - redirect to explore
            return NextResponse.redirect(new URL('/explore', requestUrl.origin));
        } catch (err) {
            console.error('[Auth Callback] Unexpected error:', err);
            return NextResponse.redirect(
                new URL('/auth/login?error=Authentication+failed', requestUrl.origin)
            );
        }
    }

    // No code provided - redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin));
}
