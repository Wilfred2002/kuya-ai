import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const WAITLIST_FILE = path.join(DATA_DIR, 'waitlist.json');

interface WaitlistEntry {
  email: string;
  timestamp: string;
}

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

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }

    // Read existing waitlist or create new one
    let waitlist: WaitlistEntry[] = [];
    if (existsSync(WAITLIST_FILE)) {
      const fileContent = await readFile(WAITLIST_FILE, 'utf-8');
      waitlist = JSON.parse(fileContent);
    }

    // Check if email already exists
    const emailExists = waitlist.some(
      (entry) => entry.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Add new email
    const newEntry: WaitlistEntry = {
      email: email.toLowerCase(),
      timestamp: new Date().toISOString(),
    };

    waitlist.push(newEntry);

    // Save updated waitlist
    await writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));

    console.log(`New waitlist signup: ${email}`);

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
