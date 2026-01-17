import { Metadata } from 'next';
import { generateMetadata as genMeta, COMMON_KEYWORDS, PLAYER_KEYWORDS } from '@/lib/seo';
import RankingsClientPage from './rankings-client';

export const metadata: Metadata = genMeta({
  title: "Best Nepali Minecraft Players - Rankings & Leaderboard",
  description: "View the best Nepali Minecraft players on MineNepal's rankings and leaderboard. Discover top players, tierlists, and gamemode-specific rankings including PvP, UHC, Survival, and more.",
  keywords: [
    ...COMMON_KEYWORDS,
    ...PLAYER_KEYWORDS,
    "rankings",
    "leaderboard",
    "minecraft rankings nepal",
    "minecraft leaderboard nepal",
    "best nepali minecraft player",
    "top minecraft players nepal",
    "minecraft tierlist nepal",
    "minecraft pvp rankings",
    "minecraft uhc rankings",
    "nepali minecraft pro players",
  ],
  canonical: "/rankings",
});

export default function RankingsPage() {
  return <RankingsClientPage />;
}