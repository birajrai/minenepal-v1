import { Metadata } from 'next';
import { generateMetadata as genMeta, COMMON_KEYWORDS } from '@/lib/seo';
import TermsClientPage from './terms-client';

export const metadata: Metadata = genMeta({
  title: 'Terms of Service - MineNepal',
  description: 'Read the Terms of Service for MineNepal, outlining user responsibilities and platform policies.',
  keywords: [...COMMON_KEYWORDS, 'terms', 'privacy', 'policy', 'service agreement'],
  canonical: '/terms',
});

export default function TermsPage() {
  return <TermsClientPage />;
}
