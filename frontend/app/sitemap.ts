import { MetadataRoute } from 'next';
import { gamemodes } from '@/utils/gamemodes-data';
import { API_ENDPOINTS } from '@/lib/config';

// Revalidate sitemap every 24 hours (86400 seconds)
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.minenepal.xyz';
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/servers`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/rankings`, lastModified, changeFrequency: 'daily', priority: 0.9 },
  ];

  // Fetch servers from external API with timeout
  let servers: any[] = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(API_ENDPOINTS.servers(), {
      signal: controller.signal,
      next: { revalidate: 86400 }, // 24 hours
      cache: 'force-cache'
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // Handle both array and object response formats
      servers = Array.isArray(data) ? data : (data.data || []);
    }
  } catch (error) {
    console.error('Error fetching servers for sitemap:', error);
    // Continue with empty servers array if fetch fails
  }

  const serverRoutes: MetadataRoute.Sitemap = servers.map((server) => ({
    url: `${baseUrl}/server/${server.slug}`,
    lastModified,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // Fetch leaderboard directly from external API
  let leaderboard: any[] = [];
  try {
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 5000);

    const response = await fetch(API_ENDPOINTS.leaderboard(), {
      signal: controller2.signal,
      next: { revalidate: 86400 },
      cache: 'force-cache'
    });

    clearTimeout(timeoutId2);

    if (response.ok) {
      const data = await response.json();
      // Handle both array and object response formats
      leaderboard = Array.isArray(data) ? data : (data.data || []);
    }
  } catch (error) {
    console.error('Error fetching leaderboard for sitemap:', error);
    // Continue with empty leaderboard if fetch fails
  }

  const playerRoutes: MetadataRoute.Sitemap = leaderboard
    .filter((player: any) => typeof player?.name === 'string' && player.name.trim().length > 0)
    .map((player: any) => ({
      url: `${baseUrl}/profile/${player.name.toLowerCase()}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.6,
    }));

  const gamemodeRankingRoutes: MetadataRoute.Sitemap = gamemodes.map((gamemode) => ({
    url: `${baseUrl}/rankings/${gamemode.toLowerCase()}`,
    lastModified,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticRoutes, ...serverRoutes, ...playerRoutes, ...gamemodeRankingRoutes];
}