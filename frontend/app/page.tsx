import { Metadata } from 'next';
import { generateMetadata as genMeta, COMMON_KEYWORDS, BRAND_KEYWORDS } from '@/lib/seo';
import HomeClient from './home-client';

export const metadata: Metadata = genMeta({
  title: 'MineNepal - Best Nepali Minecraft Servers, Rankings & Players',
  description: 'MineNepal (Mine Nepal) - Discover the best Nepali Minecraft servers, top Minecraft players in Nepal, server rankings, events, and marketplace. Join Nepal\'s largest Minecraft community.',
  keywords: [
    ...COMMON_KEYWORDS,
    ...BRAND_KEYWORDS,
    'minecraft nepal',
    'nepali minecraft community',
    'minecraft server list nepal',
    'best minecraft servers nepal',
  ],
  canonical: '/',
});

export default function HomePage() {
  return <HomeClient />;
}