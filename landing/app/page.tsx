'use client';

import { useState } from 'react';
import WebGLBackground from '@/components/WebGLBackground';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks! You\'re on the list.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <WebGLBackground />

      {/* Header */}
      <header className="w-full px-6 py-6 md:px-12 md:py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-matcha-800 font-[family-name:var(--font-space-mono)] uppercase">
            KUYA
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-20">
        <div className="max-w-3xl w-full space-y-12">
          {/* Hero Section */}
          <div className="text-center animate-fade-in animate-delay-100">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-matcha-900 leading-[1.1]">
              We&apos;re making AI
              <br />
              <span className="font-bold">native</span> to group
              <br />
              conversations.
            </h1>
          </div>

          {/* Waitlist Form */}
          <div id="waitlist" className="max-w-md mx-auto animate-fade-in animate-delay-200">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full px-5 py-3 bg-white border-2 border-matcha-200 rounded-xl
                           focus:outline-none focus:border-matcha-500 focus:ring-4 focus:ring-matcha-100
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-matcha-900 placeholder:text-matcha-400
                           transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-5 py-3 bg-matcha-600 text-white rounded-xl
                         hover:bg-matcha-700 active:scale-[0.98]
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         font-medium shadow-lg shadow-matcha-200
                         hover:shadow-xl hover:shadow-matcha-300"
              >
                {status === 'loading' ? 'JOINING...' : 'JOIN WAITLIST'}
              </button>

              {message && (
                <p className={`text-center text-sm font-medium animate-fade-in ${
                  status === 'success' ? 'text-matcha-700' : 'text-red-600'
                }`}>
                  {message}
                </p>
              )}
            </form>

            <p className="text-center text-sm text-matcha-600 mt-6 font-light">
              Early access coming soon
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 md:px-12 md:py-10 border-t border-matcha-200 bg-white/30 backdrop-blur-sm animate-fade-in animate-delay-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 font-[family-name:var(--font-space-mono)] uppercase">
            <div className="text-matcha-700 text-xs md:text-sm">
              © 2025 Kuya.
            </div>

            <div className="flex gap-8 text-xs md:text-sm">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-matcha-700 hover:text-matcha-900 transition-colors duration-200"
              >
                Twitter
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-matcha-700 hover:text-matcha-900 transition-colors duration-200"
              >
                Discord
              </a>
              <a
                href="mailto:hello@kuya.ai"
                className="text-matcha-700 hover:text-matcha-900 transition-colors duration-200"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
