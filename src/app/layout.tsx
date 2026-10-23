import type { Metadata, Viewport } from 'next'
import { Inter, Barlow_Condensed, Luckiest_Guy } from 'next/font/google'
import './globals.css'
import { SplashScreen } from '@/components/SplashScreen'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-barlow-condensed',
})

const luckiestGuy = Luckiest_Guy({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-luckiest-guy',
})

export const metadata: Metadata = {
  title: 'NextUp by Picklepedia',
  description: 'Auto-assign pickleball players to courts from a single queue',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NextUp',
  },
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#E3342F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

type RootLayoutProps = { children: React.ReactNode }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} ${luckiestGuy.variable}`}
    >
      <body className="bg-zinc-800">
        <SplashScreen />
        <div className="flex justify-center sm:py-6 min-h-screen bg-zinc-800">
          <div className="relative w-full max-w-[430px] overflow-hidden bg-bg min-h-screen sm:rounded-[36px]">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
