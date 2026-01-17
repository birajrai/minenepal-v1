import { Metadata } from 'next';
import { generateMetadata as genMeta, COMMON_KEYWORDS } from '@/lib/seo';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = genMeta({
  title: 'Privacy Policy - MineNepal',
  description: 'Read the privacy policy of MineNepal, detailing data collection, usage, and user rights.',
  keywords: [...COMMON_KEYWORDS, 'privacy', 'policy', 'data protection'],
  canonical: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-navy">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <PrivacyContent />
      </div>
    </div>
  );
}
