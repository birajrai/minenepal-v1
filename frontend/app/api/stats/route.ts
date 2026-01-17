import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://heart.minenepal.xyz/api/public_stats', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }

    const data = await response.json();

    // Return the response with cache headers
    return NextResponse.json(
      {
        total_discord_members: data.total_discord_members || 0,
        total_servers: data.total_servers || 0,
        total_active_players: data.total_active_players || 0,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch stats from external API:', error);
    return NextResponse.json(
      {
        total_discord_members: 0,
        total_servers: 0,
        total_active_players: 0,
      },
      { status: 500 }
    );
  }
}
