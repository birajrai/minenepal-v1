import { Metadata } from 'next';
import { generateMetadata as genMeta, COMMON_KEYWORDS, PLAYER_KEYWORDS } from '@/lib/seo';
import ProfileClient from './profile-client';
import { getFullPlayerData } from '@/lib/player-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getFullPlayerData(slug);
  const playerName = player?.minecraftName || slug;

  return genMeta({
    title: `${playerName} - Minecraft Player Profile`,
    description: `View ${playerName}'s Minecraft stats, rankings, and tierlist placement on MineNepal. Check out their PvP, UHC, and Survival performance.`,
    keywords: [
      ...COMMON_KEYWORDS,
      ...PLAYER_KEYWORDS,
      `${playerName} minecraft`,
      `${playerName} stats`,
      `${playerName} ranking`,
      `nepali minecraft player ${playerName}`,
    ],
    canonical: `/profile/${slug}`,
  });
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const player = await getFullPlayerData(slug);
  return <ProfileClient slug={slug} initialPlayer={player} />;
}