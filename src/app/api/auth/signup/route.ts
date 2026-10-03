import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, getSupabaseConfigStatus } from '@/lib/supabase/client';
import { getBaseUrl } from '@/lib/oauth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) {
      return NextResponse.json(
        {
          error:
            config.errorMessage ||
            'Supabase authentication is pending configuration: NEXT_PUBLIC_SUPABASE_ANON_KEY is required in your .env file.',
        },
        { status: 500 }
      );
    }

    const supabase = createSupabaseServerClient();
    const baseUrl = getBaseUrl(request);

    // Delegate signup to Supabase Auth which sends the real verification email
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    // Check for user existence under Supabase email enumeration defense
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return NextResponse.json(
        { error: 'This email address is already registered. Please sign in or reset your password.' },
        { status: 409 }
      );
    }

    // Protection rule: Do NOT establish a session or set a session cookie.
    // The user MUST confirm their email via the verification link before receiving access.
    return NextResponse.json(
      {
        success: true,
        message: 'Verification email sent. Please check your inbox and verify your email.',
        needsVerification: true,
        email: cleanEmail,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
