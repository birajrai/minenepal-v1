"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { gamemodes } from "@/utils/gamemodes-data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faTrophy, faChartLine, faCrown } from "@fortawesome/free-solid-svg-icons";
import { Player } from "@/types";

// Rank progression system: LT5, HT5, LT4, HT4, LT3, HT3, LT2, HT2, LT1, HT1 (lowest to highest)
const RANK_ORDER = ["Unranked", "LT5", "HT5", "LT4", "HT4", "LT3", "HT3", "LT2", "HT2", "LT1", "HT1"];
const POINTS_PER_RANK = 10; // Points needed to level up to next rank

function getRankProgress(currentRank: string, points: number) {
    const rankIndex = RANK_ORDER.indexOf(currentRank);
    
    if (rankIndex === -1) {
        // Unknown rank
        return {
            progress: 0,
            nextRank: null,
            pointsToNext: 0,
            currentRankPoints: 0,
            overallProgress: 0,
        };
    }
    
    if (rankIndex === 0) {
        // Unranked - show progress based on current points
        const progress = Math.min((points / POINTS_PER_RANK) * 100, 100);
        return {
            progress: Math.round(progress),
            nextRank: RANK_ORDER[1], // LT5
            pointsToNext: Math.max(POINTS_PER_RANK - points, 0),
            currentRankPoints: points,
            overallProgress: 0,
        };
    }
    
    if (rankIndex === RANK_ORDER.length - 1) {
        // Max rank (HT1)
        return {
            progress: 100,
            nextRank: null,
            pointsToNext: 0,
            currentRankPoints: points,
            overallProgress: 100,
        };
    }
    
    // For ranked players: use their current points directly for progress
    // Points in current tier (1-10 scale for next rank)
    const pointsInCurrentTier = points % POINTS_PER_RANK;
    
    // Progress within current rank (1 point = 10%, 9 points = 90%)
    const progress = (pointsInCurrentTier / POINTS_PER_RANK) * 100;
    const pointsToNext = POINTS_PER_RANK - pointsInCurrentTier;
    
    // Calculate overall progress (0-100% across all ranks)
    // Each rank = 10% of overall progression
    const totalRanks = RANK_ORDER.length - 1;
    const baseProgress = (rankIndex / totalRanks) * 100;
    const rankProgressContribution = (progress / 100) * (100 / totalRanks);
    const overallProgress = Math.min(baseProgress + rankProgressContribution, 100);
    
    return {
        progress: Math.round(progress),
        nextRank: RANK_ORDER[rankIndex + 1],
        pointsToNext: pointsToNext === POINTS_PER_RANK ? 0 : pointsToNext,
        currentRankPoints: pointsInCurrentTier,
        overallProgress: Math.round(overallProgress),
    };
}

interface PlayerStats {
    gamemode: string;
    rank: string;
    previousRank: string;
    points: number;
}

interface ProfileClientProps {
    slug: string;
    initialPlayer: Player | null;
}

export default function ProfileClient({ slug, initialPlayer }: ProfileClientProps) {
    const [player, setPlayer] = useState<Player | null>(initialPlayer);
    const [stats, setStats] = useState<PlayerStats[]>([]);

    useEffect(() => {
        if (player) {
            const playerStats = gamemodes.map((gamemode) => {
                const rankData = player.ranks?.[gamemode];
                const points = player.gamemodePoints?.[gamemode] ?? 0;
                
                return {
                    gamemode,
                    rank: rankData?.current ?? "Unranked",
                    previousRank: rankData?.previous ?? "N/A",
                    points,
                };
            });

            playerStats.sort((a, b) => {
                if (a.rank !== "Unranked" && b.rank === "Unranked") return -1;
                if (a.rank === "Unranked" && b.rank !== "Unranked") return 1;
                return b.points - a.points;
            });

            setStats(playerStats);
        }
    }, [player]);

    if (!player) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark-navy px-4 py-12 max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-navy-secondary border border-gray-200 dark:border-slate-700 rounded-xl p-12 text-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Player Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                        The player <span className="font-bold text-blue-600 dark:text-blue-400">{slug}</span> could not be found in our database.
                    </p>
                    <Link href="/rankings" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold">
                        <FontAwesomeIcon icon={faTrophy} /> Back to Rankings
                    </Link>
                </motion.div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    return (
        <div className="bg-white dark:bg-dark-navy min-h-screen pb-20">
            {/* Hero Background */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-blue-600/20 dark:from-blue-400/20 via-white dark:via-dark-navy to-white dark:to-dark-navy z-0" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />
            </div>

            <section className="px-4 max-w-7xl mx-auto -mt-32 relative z-10 mb-12">
                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 dark:bg-dark-navy-secondary/90 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-lg rounded-2xl p-6 md:p-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        {/* Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white/30 dark:border-slate-700/50 shadow-2xl bg-gray-100 dark:bg-dark-navy-secondary">
                            <img
                                src={`https://render.crafty.gg/3d/bust/${player.minecraftName}`}
                                alt={player.minecraftName}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/player-head.jpg";
                                }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {player.minecraftName}
                                    </motion.h1>
                                    {(player.province || player.city) && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 dark:text-blue-400" />
                                            <span>
                                                {player.city && player.city !== "N/A" ? player.city : ""}
                                                {player.city && player.province ? ", " : ""}
                                                {player.province && player.province !== "N/A" ? player.province : ""}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>

                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-blue-600/10 dark:bg-blue-400/10 border border-blue-600/30 dark:border-blue-400/30 rounded-2xl p-4 text-right min-w-[140px]">
                                    <p className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 font-bold mb-1">Total Points</p>
                                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{player.totalPoints.toLocaleString()}</p>
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex gap-3 mt-4">
                                <Link href="/rankings" className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-semibold">← Back to Rankings</Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="px-4 max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400">
                        <FontAwesomeIcon icon={faChartLine} className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Stats</h2>
                </motion.div>

                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    {stats.map((stat, idx) => {
                        const iconPath = `/tier_icons/${stat.gamemode.toLowerCase()}.svg`;
                        const rankProgress = getRankProgress(stat.rank, stat.points);
                        
                        return (
                            <motion.div key={stat.gamemode} className={`bg-white/90 dark:bg-dark-navy-secondary/90 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl p-6 group hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 border-l-4 ${stat.rank !== "Unranked" ? "border-l-blue-600 dark:border-l-blue-400" : "border-l-gray-300 dark:border-l-slate-600"}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.05 }} viewport={{ once: true }}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <img src={iconPath} alt={stat.gamemode} className="w-8 h-8 dark:brightness-90" />
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stat.gamemode}</h3>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${stat.rank !== "Unranked" ? "bg-blue-600/20 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 border border-blue-600/30 dark:border-blue-400/30" : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600"}`}>
                                        {stat.rank}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Points</span>
                                        <span className="font-black text-2xl text-gray-900 dark:text-white">{stat.points.toLocaleString()}</span>
                                    </div>
                                    {stat.previousRank !== "N/A" && stat.previousRank !== stat.rank && (
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-slate-700">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Previous Rank</span>
                                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{stat.previousRank}</span>
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {rankProgress.nextRank ? `Progress to ${rankProgress.nextRank}` : 'Max Rank'}
                                            </span>
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                {rankProgress.nextRank 
                                                    ? `${rankProgress.currentRankPoints}/${POINTS_PER_RANK}` 
                                                    : `${stat.points} pts`
                                                }
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300" 
                                                initial={{ width: 0 }} 
                                                whileInView={{ width: `${rankProgress.progress}%` }} 
                                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} 
                                                viewport={{ once: true }} 
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
                                            <span>
                                                {rankProgress.nextRank && `${rankProgress.pointsToNext} pts to next rank`}
                                            </span>
                                            <span>Overall: {rankProgress.overallProgress}%</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>
        </div>
    );
}
