'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

import { LeaderboardRow } from '@/types';

const tierIconMap: Record<string, string> = {
    vanilla: '/tier_icons/vanilla.svg',
    uhc: '/tier_icons/uhc.svg',
    pot: '/tier_icons/pot.svg',
    nethpot: '/tier_icons/nethpot.svg',
    smp: '/tier_icons/smp.svg',
    sword: '/tier_icons/sword.svg',
    axe: '/tier_icons/axe.svg',
    mace: '/tier_icons/mace.svg',
    overall: '/tier_icons/overall.svg',
};

const getTierIconPath = (gamemode: string) => {
    return tierIconMap[gamemode.toLowerCase()] ?? tierIconMap.overall;
};

interface LeaderboardListProps {
    data: LeaderboardRow[];
    loading: boolean;
    emptyMessage?: string;
}

export function LeaderboardList({
    data,
    loading,
    emptyMessage = "No players found"
}: LeaderboardListProps) {

    if (loading) {
        return (
            <div className="bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-12 text-center">
                <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mahogany-red-2 dark:border-mahogany-red"></div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-12 text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{emptyMessage}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your search term</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.map((row, idx) => (
                <Link href={`/profile/${row.slug}`} key={`leaderboard-${idx}-${row.name || 'unknown'}-${row.rank || 0}`}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        viewport={{ once: true }}
                        className="bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm p-3 sm:p-4 flex items-center gap-3 sm:gap-4 group hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors rounded-lg cursor-pointer"
                    >
                    {/* 1. Rank */}
                    <div className="flex items-center justify-center flex-shrink-0">
                        {row.rank <= 3 ? (
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-lg
                  ${row.rank === 1 ? "bg-yellow-500 text-yellow-900" : ""}
                  ${row.rank === 2 ? "bg-slate-400 text-dark-navy-secondary" : ""}
                  ${row.rank === 3 ? "bg-orange-500 text-orange-900" : ""}
                `}
                            >
                                <FontAwesomeIcon icon={faCrown} />
                            </div>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-lg font-bold font-mono text-gray-600 dark:text-gray-400">
                                {row.rank}
                            </div>
                        )}
                    </div>

                    {/* 2. Player Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200 dark:bg-slate-700 ring-2 ring-gray-300 dark:ring-slate-600 shadow-md">
                            <img
                                src={`https://render.crafty.gg/3d/bust/${row.name}`}
                                alt={row.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="block truncate text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {row.name}
                            </span>
                            <div className="hidden sm:flex flex-wrap gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {row.province && row.province !== "N/A" && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 whitespace-nowrap">
                                        {row.province}
                                    </span>
                                )}
                                {row.city && row.city !== "N/A" && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 whitespace-nowrap">
                                        {row.city}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Points - Hidden on Mobile */}
                    <div className="hidden sm:flex flex-shrink-0 justify-center">
                        <div className="flex flex-col items-center">
                            <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">{row.points.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wider">Points</span>
                        </div>
                    </div>

                    {/* 4. Gamemode Ranks - Hidden on Mobile */}
                    <div className="hidden sm:flex flex-wrap gap-1.5 justify-end">
                        {Object.entries(row.gamemodeRanks)
                            .slice(0, 4)
                            .map(([gamemode, ranks]) => {
                                const isHigher = ranks.current.includes("HT");
                                const iconPath = getTierIconPath(gamemode);
                                return (
                                    <div
                                        key={gamemode}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border whitespace-nowrap ${isHigher
                                            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                                            }`}
                                    >
                                        <Image src={iconPath} alt={`${gamemode} icon`} width={18} height={18} className="h-3 w-3 flex-shrink-0" />
                                        <span className="sr-only">{gamemode}</span>
                                        <span className="opacity-70">{ranks.current}</span>
                                    </div>
                                );
                            })}
                        {Object.keys(row.gamemodeRanks).length > 4 && (
                            <span className="px-2 py-1 rounded-md bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-[10px] font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                +{Object.keys(row.gamemodeRanks).length - 4}
                            </span>
                        )}
                    </div>
                </motion.div>
                </Link>
            ))}
        </div>
    );
}
