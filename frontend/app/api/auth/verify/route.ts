import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Token is required' },
                { status: 400 }
            );
        }

        const verifyFormData = new FormData();
        verifyFormData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
        verifyFormData.append('response', token);

        const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: verifyFormData,
        });

        const turnstileOutcome = await turnstileResult.json();
        if (!turnstileOutcome.success) {
            console.log('[AUTH] Turnstile verification failed:', turnstileOutcome);
            return NextResponse.json(
                { success: false, error: 'Security check failed' },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Auth verify error:', err);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
