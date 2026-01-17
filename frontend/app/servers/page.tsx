import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, COMMON_KEYWORDS, SERVER_KEYWORDS } from '@/lib/seo';
import ServersClient from './servers-client';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Best Nepali Minecraft Servers - Server List',
  description: 'Discover and join the best Nepali Minecraft servers at MineNepal. Browse Java and Bedrock servers with live player counts, server IPs, gamemodes, and detailed information. Find cracked and premium Minecraft servers in Nepal.',
  keywords: [
    ...COMMON_KEYWORDS,
    ...SERVER_KEYWORDS,
    'minecraft server list nepal',
    'nepali minecraft servers',
    'best nepali minecraft server',
    'minecraft server ip nepal',
    'java servers nepal',
    'bedrock servers nepal',
    'minecraft smp nepal',
    'minecraft survival nepal',
    'cracked minecraft servers nepal',
    'premium minecraft servers nepal',
    'minecraft factions nepal',
    'minecraft skyblock nepal',
  ],
  canonical: '/servers',
});

export default function ServersPage() {
  return <ServersClient />;
}