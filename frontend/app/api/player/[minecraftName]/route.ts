import { NextResponse } from 'next/server';
import { getFullPlayerData } from '@/lib/player-data';

export async function GET(
  request: Request,
  context: { params: Promise<{ minecraftName: string }> }
) {
  try {
    const { minecraftName } = await context.params;

    if (!minecraftName) {
      return NextResponse.json(
        { success: false, error: 'Invalid player name' },
        { status: 400 }
      );
    }

    const playerData = await getFullPlayerData(minecraftName);

    if (!playerData) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    // Add skinUrl for API consumers if needed, though client usually constructs it
    const enhancedData = {
      ...playerData,
      skinUrl: playerData.minecraftUUID ? `https://crafatar.com/avatars/${playerData.minecraftUUID}` : null
    };

    return NextResponse.json({
      success: true,
      data: enhancedData
    });

  } catch (error) {
    console.error('Error in player API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}