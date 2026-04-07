import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/src/context/AuthContext';
import { ChatProvider } from '@/src/context/ChatContext';
import './globals.css';
import SiteChrome from '@/src/components/layout/SiteChrome';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UDealZone - Buy & Sell Marketplace',
  description:
    'UDealZone is a modern marketplace platform for buying and selling products online.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo/logomain.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo/logomain.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo/logomain.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'UDealZone - Buy & Sell Marketplace',
    description: 'Buy and sell products easily with UDealZone',
    type: 'website',
    url: 'https://udealzone.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white">
        <AuthProvider>
          <ChatProvider>
            <SiteChrome>{children}</SiteChrome>
          </ChatProvider>
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              style: {
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                border: '1px solid',
              },
              classNames: {
                toast: 'group',
                title: 'font-semibold text-sm',
                description: 'text-xs opacity-80',
                closeButton:
                  'bg-transparent border-none text-current opacity-60 hover:opacity-100 transition-opacity',
                success:
                  'bg-green-50 border-green-200 text-green-900',
                error:
                  'bg-red-50 border-red-200 text-red-900',
                info:
                  'bg-blue-50 border-blue-200 text-blue-900',
                warning:
                  'bg-amber-50 border-amber-200 text-amber-900',
              },
            }}
          />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}