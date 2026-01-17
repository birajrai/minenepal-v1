import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { UserProvider } from '@/lib/user-context';


const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.minenepal.xyz'),
  title: {
    default: 'MineNepal - Best Nepali Minecraft Servers, Rankings & Players',
    template: '%s | MineNepal',
  },
  description: 'MineNepal (Mine Nepal) - Discover the best Nepali Minecraft servers, top Minecraft players in Nepal, server rankings, events, and marketplace. Join Nepal\'s largest Minecraft community at minenepal.xyz.',
  keywords: [
    'minenepal',
    'mine nepal',
    'MineNepal',
    'Mine Nepal',
    'minenepal.xyz',
    'www.minenepal.xyz',
    'minecraft nepal',
    'nepal minecraft',
    'nepali minecraft server',
    'nepali minecraft servers',
    'best nepali minecraft server',
    'best nepali minecraft player',
    'best minecraft player nepal',
    'top minecraft players nepal',
    'minecraft server nepal',
    'minecraft server list nepal',
    'nepal minecraft community',
    'minecraft rankings nepal',
    'minecraft leaderboard nepal',
    'nepali gamers',
    'minecraft multiplayer nepal',
    'cracked minecraft server nepal',
    'minecraft smp nepal',
    'minecraft pvp nepal',
    'nepali minecraft youtubers',
  ],
  authors: [{ name: 'MineNepal' }],
  creator: 'MineNepal',
  publisher: 'MineNepal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.minenepal.xyz',
    siteName: 'MineNepal - Mine Nepal Official',
    title: 'MineNepal - Best Nepali Minecraft Servers & Players',
    description: 'MineNepal (Mine Nepal) - Discover the best Nepali Minecraft servers, top players, rankings, and events. Join Nepal\'s #1 Minecraft community.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MineNepal - Best Nepali Minecraft Servers and Players',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MineNepal - Best Nepali Minecraft Servers & Players',
    description: 'Discover the best Nepali Minecraft servers, top players, rankings, and events at MineNepal.xyz',
    images: ['/og-image.jpg'],
    creator: '@minenepal',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.jpg',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.jpg" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://www.minenepal.xyz/#organization',
                  name: 'MineNepal',
                  alternateName: 'Mine Nepal',
                  url: 'https://www.minenepal.xyz',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://www.minenepal.xyz/logo.png',
                    width: 512,
                    height: 512,
                  },
                  description: 'MineNepal is Nepal\'s premier platform for discovering Minecraft servers, player rankings, events, and marketplace.',
                  sameAs: [
                    'https://www.facebook.com/minenepal.official/',
                    'https://discord.gg/SfQVUXUjD6',
                    'https://www.youtube.com/@minenepal.official',
                  ],
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'Customer Service',
                    availableLanguage: ['English', 'Nepali'],
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.minenepal.xyz/#website',
                  url: 'https://www.minenepal.xyz',
                  name: 'MineNepal - Best Nepali Minecraft Servers & Players',
                  alternateName: 'Mine Nepal',
                  description: 'Discover the best Nepali Minecraft servers, top players, rankings, events, and marketplace. Nepal\'s #1 Minecraft community.',
                  publisher: {
                    '@id': 'https://www.minenepal.xyz/#organization',
                  },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://www.minenepal.xyz/servers?search={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                  inLanguage: 'en-US',
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geist.className} bg-background text-foreground transition-colors duration-200 antialiased`}
        suppressHydrationWarning
      >
        <UserProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme>
            <div className="flex min-h-screen flex-col bg-background">
              <Navbar />
              <main className="flex-1 bg-background pb-20 md:pb-0">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}