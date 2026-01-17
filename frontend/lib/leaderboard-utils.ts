import { LeaderboardRow } from '@/types';

/**
 * Formats raw player data from API into LeaderboardRow format
 */
export function formatLeaderboardData(data: any[], gamemode?: string): LeaderboardRow[] {
    if (!Array.isArray(data)) return [];

    return data.map((player: any, index: number) => {
        let ranks = player.ranks || {};

        // If ranks is missing but we have currentRank and a gamemode context, create the ranks object
        if (Object.keys(ranks).length === 0 && player.currentRank && gamemode && gamemode.toLowerCase() !== 'overall') {
            ranks = {
                [gamemode]: {
                    current: player.currentRank,
                    previous: 'N/A'
                }
            };
        }

        const playerName = player.minecraftName || player.name || "Unknown";
        const playerPoints = player.totalPoints !== undefined ? player.totalPoints : (player.points || 0);

        return {
            rank: player.rankId || index + 1,
            id: player.discordId || player.id || `player-${index}`,
            name: playerName,
            slug: playerName !== "Unknown" ? playerName.toLowerCase() : `unknown-${index}`,
            points: playerPoints,
            province: player.province || "N/A",
            city: player.city || "N/A",
            gamemodeRanks: ranks,
        };
    });
}

/**
 * Filters leaderboard data by search term
 */
export function filterLeaderboardData(
    data: LeaderboardRow[],
    searchTerm: string
): LeaderboardRow[] {
    if (!searchTerm) return data;

    return data.filter((row) =>
        row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

/**
 * Paginates data
 */
export function paginateData<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number
): T[] {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
}

/**
 * Calculates total pages
 */
export function calculateTotalPages(
    totalItems: number,
    itemsPerPage: number
): number {
    return Math.ceil(totalItems / itemsPerPage);
}
