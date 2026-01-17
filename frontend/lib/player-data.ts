import { Player } from '@/types';

// Server-side only - never expose API URL to client
if (typeof window !== 'undefined') {
  throw new Error('player-data should only be used server-side');
}

const API_BASE = process.env.HEART_API_URL || 'https://heart.minenepal.xyz';
const PROFILE_API_URL = `${API_BASE}/api/profile`;

export async function getFullPlayerData(slug: string): Promise<Player | null> {
    try {
        // Use the new profile API endpoint that handles both minecraftName and discordId
        const profileRes = await fetch(`${PROFILE_API_URL}/${slug}`, { 
            next: { revalidate: 600 }
        });

        if (!profileRes.ok) {
            return null;
        }

        const profileData = await profileRes.json();
        
        // The API returns a compact profile object with organized fields
        const player: Player = {
            discordId: profileData.discordId,
            minecraftName: profileData.minecraftName,
            minecraftUUID: profileData.minecraftUUID,
            province: profileData.province,
            city: profileData.city,
            totalPoints: profileData.overallPoints || 0,
            overallPoints: profileData.overallPoints || 0,
            gamemodePoints: profileData.points || {},
            points: profileData.points || {},
            ranks: profileData.ranks || {},
        };

        return player;
    } catch (error) {
        // Log error only in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error in getFullPlayerData:', error);
        }
        return null;
    }
}
