import { Metadata } from 'next';
import { generateMetadata as genMeta, COMMON_KEYWORDS } from '@/lib/seo';
import ContactClientPage from './contact-client';

export const metadata: Metadata = genMeta({
  title: 'Contact Us - MineNepal',
  description: 'Get in touch with MineNepal. Send us your questions, feedback, or inquiries and we\'ll respond as soon as possible.',
  keywords: [...COMMON_KEYWORDS, 'contact', 'support', 'help', 'feedback'],
  canonical: '/contact',
});

export default function ContactPage() {
  return <ContactClientPage />;
}