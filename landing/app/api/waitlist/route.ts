import { NextRequest, NextResponse } from 'next/server';

// NOTE: This is a simple in-memory implementation for demo purposes.
// For production, replace with a database (Supabase, PostgreSQL, etc.)
// Emails are logged to console and can be viewed in Vercel logs.

const waitlistEmails = new Set<string>();

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if email already exists (in current session)
    if (waitlistEmails.has(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Add to in-memory set
    waitlistEmails.add(normalizedEmail);

    // Log to console (visible in Vercel deployment logs)
    console.log(`[WAITLIST SIGNUP] ${normalizedEmail} - ${new Date().toISOString()}`);

    return NextResponse.json(
      { success: true, message: 'Successfully joined the waitlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing waitlist signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
