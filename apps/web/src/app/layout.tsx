import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'AI Coach — Intelligent CV Processing & Career Insights',
  description: 'Fast CV extraction, domain matching, format critique, and structured career recommendations.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: 'AI Coach — Career Studio',
    description: 'Hệ thống đánh giá và phản biện hồ sơ ứng viên thông minh.',
    images: [{ url: '/logo-lockup-1200.png', width: 1200, height: 630, alt: 'AI Coach Career Studio' }],
  },
};

import { ToasterProvider } from '@/providers/toaster-provider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
