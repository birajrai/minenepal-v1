import { NextResponse } from 'next/server';
import { fetchExternalApi } from '@/lib/api-helpers';
import { API_ENDPOINTS } from '@/lib/config';

export async function GET(
  request: Request,
  context: { params: Promise<{ gamemode: string }> }
) {
  const { gamemode } = await context.params;

  // Validate gamemode
  if (!gamemode || typeof gamemode !== 'string') {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid gamemode',
        message: 'Gamemode parameter is required'
      },
      { status: 400 }
    );
  }

  return fetchExternalApi(
    API_ENDPOINTS.gamemodeLeaderboard(gamemode),
    {},
    `${gamemode} leaderboard`
  );
}