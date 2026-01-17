import { Metadata } from 'next';
import { generateMetadata as genMeta, COMMON_KEYWORDS } from '@/lib/seo';
import AboutClientPage from './about-client';

export const metadata: Metadata = genMeta({
  title: 'About - MineNepal',
  description: 'Learn about MineNepal, the premier platform for discovering Minecraft servers, rankings, events, and marketplace in Nepal.',
  keywords: [...COMMON_KEYWORDS, 'about', 'minecraft platform', 'server listings'],
  canonical: '/about',
});

export default function AboutPage() {
  return <AboutClientPage />;
}
