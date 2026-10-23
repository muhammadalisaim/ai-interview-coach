import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'AI Mock Interview Coach | Practice Voice Job Interviews',
  description:
    'Simulate realistic voice job interviews. Practice speaking answers aloud, receive spoken questions, and get actionable scoring for answer quality, confidence, and English.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 AI Mock Interview Coach • Built with Next.js, Claude API & Web Speech</p>
            <p className="text-slate-400">Created for University Students & Fresh Graduates</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
