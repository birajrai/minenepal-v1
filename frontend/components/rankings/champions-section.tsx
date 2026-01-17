"use client";

import { motion } from "framer-motion";
import { LeaderboardRow } from "@/types";

interface ChampionsSectionProps {
    topThreePlayers: LeaderboardRow[];
}

export function ChampionsSection({ topThreePlayers }: ChampionsSectionProps) {
    if (!topThreePlayers.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-1 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400">Top spots</p>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Top 3 Players of Nepal</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Highlighting the current leaders across all gamemodes.
                </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
                {topThreePlayers.map((player, idx) => (
                    <div
                        key={`${player.name}-${player.rank}-${idx}`}
                        className={`relative rounded-3xl border border-gray-200 dark:border-slate-700 p-6 text-center shadow-lg ${idx === 0
                            ? 'bg-linear-to-br from-blue-600/15 dark:from-blue-400/15 to-blue-600/15 dark:to-blue-400/15'
                            : 'bg-gray-50 dark:bg-dark-navy-secondary'
                            }`}
                    >
                        <div className="absolute right-4 top-4 rounded-full bg-white dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            #{player.rank}
                        </div>
                        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-2xl border-2 border-white/40 dark:border-slate-600/40 shadow-md">
                            <img
                                src={`https://render.crafty.gg/3d/bust/${player.name}`}
                                alt={player.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span
                            className="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                            {player.name}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {player.province}, {player.city}
                        </p>
                        <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">{player.points.toLocaleString()} pts</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
