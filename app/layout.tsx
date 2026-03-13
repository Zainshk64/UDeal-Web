import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/src/context/AuthContext'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'UDealZone - Buy & Sell Marketplace',
  description: 'UDealZone is a modern marketplace platform for buying and selling products online.',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
