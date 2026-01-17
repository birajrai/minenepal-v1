import { Metadata } from 'next';
import { generateMetadata as genMeta, COMMON_KEYWORDS, PLAYER_KEYWORDS } from '@/lib/seo';
import GamemodeRankingsClient from './gamemode-rankings-client';
import { gamemodes } from '@/utils/gamemodes-data';

interface Props {
  params: Promise<{ gamemode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gamemode } = await params;
  const decodedGamemode = decodeURIComponent(gamemode);

  // Capitalize first letter for better display
  const formattedGamemode = decodedGamemode.charAt(0).toUpperCase() + decodedGamemode.slice(1);

  return genMeta({
    title: `${formattedGamemode} Rankings - Best Nepali Minecraft Players`,
    description: `View the top ${formattedGamemode} players in Nepal. Check the latest ${formattedGamemode} tierlist, rankings, and leaderboard on MineNepal.`,
    keywords: [
      ...COMMON_KEYWORDS,
      ...PLAYER_KEYWORDS,
      `${decodedGamemode} rankings`,
      `${decodedGamemode} leaderboard`,
      `${decodedGamemode} tierlist`,
      `nepali ${decodedGamemode} players`,
      `best ${decodedGamemode} player nepal`,
      "minecraft pvp nepal",
    ],
    canonical: `/rankings/${gamemode}`,
  });
}

export async function generateStaticParams() {
  return gamemodes.map((gamemode) => ({
    gamemode: gamemode.toLowerCase(),
  }));
}

export default async function GamemodeRankingsPage({ params }: Props) {
  const { gamemode } = await params;
  return <GamemodeRankingsClient gamemode={gamemode} />;
}