import { ApiResponse } from '@/types';

interface FetchOptions extends RequestInit {
  revalidate?: number;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {},
  errorMessage: string = "API request failed"
): Promise<T | null> {
  try {
    const { revalidate = 300, ...fetchOptions } = options;
    const response = await fetch(endpoint, {
      ...fetchOptions,
      next: { revalidate },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Server returned ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    return null;
  }
}

// Leaderboard API
export async function fetchLeaderboard() {
  const data = await fetchApi<any[]>('/api/leaderboard', { revalidate: 300 }, 'Failed to fetch leaderboard');
  return data || [];
}

export async function fetchGamemodeLeaderboard(gamemode: string) {
  const data = await fetchApi<any[]>(`/api/leaderboard/${gamemode}`, { revalidate: 300 }, `Failed to fetch ${gamemode} leaderboard`);
  return data || [];
}

// Player API
export async function fetchPlayer(minecraftName: string) {
  return fetchApi<{
    minecraftName: string;
    uuid: string;
    formattedUuid: string;
    skinUrl: string;
  }>(`/api/player/${minecraftName}`, { revalidate: 600 }, `Failed to fetch player ${minecraftName}`);
}

// Server API - now includes status from database
export async function fetchServerData(slug: string) {
  const data = await fetchApi<any>(`/api/server/${slug}`, { revalidate: 300 }, `Failed to fetch server ${slug}`);
  return data || { hostname: slug, online: false, players: 0 };
}

// Servers List API - now includes status from database
export async function fetchServers() {
  const data = await fetchApi<any[]>('/api/servers', { revalidate: 300 }, 'Failed to fetch servers');
  return data || [];
}

// User API
export async function fetchUser(discordId: string) {
  return fetchApi<any>(`/api/users/${discordId}`, { revalidate: 300 }, `Failed to fetch user ${discordId}`);
}