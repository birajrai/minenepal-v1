"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { gamemodes as allGamemodes } from '@/utils/gamemodes-data';
import { fetchGamemodeLeaderboard, fetchLeaderboard } from '@/lib/api';
import { LeaderboardList } from '@/components/leaderboard-list';
import { LeaderboardRow } from '@/types';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { GamemodeSelector } from '@/components/gamemode-selector';
import { formatLeaderboardData, filterLeaderboardData, paginateData, calculateTotalPages } from '@/lib/leaderboard-utils';
import { StatsDashboard } from '@/components/rankings/stats-dashboard';
import { ChampionsSection } from '@/components/rankings/champions-section';

interface RankingsViewProps {
    initialGamemode?: string;
    showExtendedStats?: boolean;
}

export function RankingsView({ initialGamemode = "Overall", showExtendedStats = false }: RankingsViewProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([]);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 10;
    const [activeGamemode, setActiveGamemode] = useState<string>(initialGamemode);

    const gamemodeOptions = ['Overall', ...allGamemodes];

    // Sync activeGamemode with initialGamemode prop if it changes (e.g. navigation)
    useEffect(() => {
        setActiveGamemode(initialGamemode);
    }, [initialGamemode]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = activeGamemode.toLowerCase() === "overall"
                    ? await fetchLeaderboard()
                    : await fetchGamemodeLeaderboard(activeGamemode);

                setLeaderboardData(formatLeaderboardData(data, activeGamemode));
            } catch (error) {
                // Silent error handling
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeGamemode]);

    const filteredData = useMemo(
        () => filterLeaderboardData(leaderboardData, searchTerm),
        [leaderboardData, searchTerm]
    );

    const paginatedData = useMemo(
        () => paginateData(filteredData, currentPage, itemsPerPage),
        [filteredData, currentPage]
    );

    const totalPages = calculateTotalPages(filteredData.length, itemsPerPage);
    const totalPlayers = filteredData.length;
    const totalPoints = filteredData.reduce((sum, player) => sum + (player.points || 0), 0);
    const averagePoints = totalPlayers ? Math.round(totalPoints / totalPlayers) : 0;
    const uniqueProvinces = new Set(filteredData.map((row) => row.province)).size;
    const topThreePlayers = filteredData.slice(0, 3);

    return (
        <div className="min-h-screen bg-white dark:bg-dark-navy">
            <section className="py-8 px-2 max-w-7xl mx-auto space-y-8 sm:py-12 sm:px-4 sm:space-y-10">
                <GamemodeSelector gamemodes={gamemodeOptions} activeGamemode={activeGamemode} />

                {/* Search Bar & Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6"
                >
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Search Players
                        </label>
                        <div className="relative">
                            <SearchInput
                                value={searchTerm}
                                onChange={(value) => {
                                    setSearchTerm(value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search by player name..."
                            />
                        </div>
                    </div>

                    {showExtendedStats && (
                        <div className="grid w-full grid-cols-2 gap-3 md:w-auto">
                            <div className="bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm px-6 py-3 rounded-xl">
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-400 font-bold">Players</p>
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalPlayers || '—'}</p>
                            </div>
                            <div className="bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm px-6 py-3 rounded-xl">
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-400 font-bold">Avg Points</p>
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                    {averagePoints ? averagePoints.toLocaleString() : '—'}
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Extended Stats Dashboard */}
                {showExtendedStats && (
                    <StatsDashboard
                        totalPlayers={totalPlayers}
                        averagePoints={averagePoints}
                        uniqueProvinces={uniqueProvinces}
                    />
                )}

                {/* Champions Section */}
                {showExtendedStats && !!topThreePlayers.length && (
                    <ChampionsSection topThreePlayers={topThreePlayers} />
                )}

                {/* Leaderboard List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="space-y-6"
                >
                    <LeaderboardList data={paginatedData} loading={loading} />

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </motion.div>
            </section>
        </div>
    );
}
