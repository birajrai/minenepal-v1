import { Metadata } from 'next';

interface SEOConfig {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
    ogType?: string;
    canonical?: string;
    noindex?: boolean;
}

const SITE_NAME = 'MineNepal';
const SITE_URL = 'https://www.minenepal.xyz';
const DEFAULT_OG_IMAGE = '/og-image.jpg';

export function generateMetadata(config: SEOConfig): Metadata {
    const {
        title,
        description,
        keywords = [],
        ogImage = DEFAULT_OG_IMAGE,
        ogType = 'website',
        canonical,
        noindex = false,
    } = config;

    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

    return {
        title: fullTitle,
        description,
        keywords: keywords.join(', '),
        authors: [{ name: SITE_NAME }],
        creator: SITE_NAME,
        publisher: SITE_NAME,
        robots: noindex ? 'noindex, nofollow' : 'index, follow',
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: ogType as any,
            locale: 'en_US',
            url,
            title: fullTitle,
            description,
            siteName: SITE_NAME,
            images: [
                {
                    url: ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`],
            creator: '@minenepal',
        },
        verification: {
            google: 'your-google-verification-code',
        },
        icons: {
            icon: '/favicon.jpg',
            apple: '/logo.png',
        },
    };
}

// Common keywords for the site - Optimized for ranking
export const COMMON_KEYWORDS = [
    'minenepal',
    'mine nepal',
    'MineNepal',
    'Mine Nepal',
    'minecraft nepal',
    'nepal minecraft',
    'nepali minecraft server',
    'nepali minecraft servers',
    'minecraft server nepal',
    'best nepali minecraft server',
    'best nepali minecraft player',
    'nepali minecraft players',
    'minecraft rankings nepal',
    'minecraft leaderboard nepal',
    'nepal minecraft community',
    'minecraft server list nepal',
    'top minecraft servers nepal',
];

// Brand-specific keywords
export const BRAND_KEYWORDS = [
    'minenepal.xyz',
    'www.minenepal.xyz',
    'minenepal official',
    'minenepal website',
];

// Player-focused keywords
export const PLAYER_KEYWORDS = [
    'best minecraft player nepal',
    'top minecraft players nepal',
    'nepali minecraft youtubers',
    'minecraft pvp nepal',
    'minecraft pro players nepal',
];

// Server-focused keywords
export const SERVER_KEYWORDS = [
    'minecraft server ip nepal',
    'cracked minecraft server nepal',
    'premium minecraft server nepal',
    'minecraft smp nepal',
    'minecraft survival server nepal',
    'minecraft factions nepal',
];
