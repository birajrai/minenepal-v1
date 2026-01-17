import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VoteCooldown from '@/lib/models/VoteCooldown';
import Server from '@/lib/models/Server';
import UserInfo from '@/lib/models/UserInfo';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const server = url.searchParams.get('server');
    const discordId = url.searchParams.get('discordId');

    if (!server || (!username && !discordId)) {
      return NextResponse.json(
        { success: false, error: 'server and username or discordId are required' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    const cleanServer = server.trim();
    let cleanUsername = username ? username.trim() : null;

    // If discordId provided but no username, try to resolve username from UserInfo
    if (!cleanUsername && discordId) {
      const user = await UserInfo.findOne({ discordId });
      if (user && user.minecraftName) {
        cleanUsername = user.minecraftName;
      }
    }

    // If still no username, we can't check cooldown effectively
    if (!cleanUsername) {
      return NextResponse.json(
        {
          success: true,
          cooldownMs: 0,
          serverCooldownMs: 12 * 60 * 60 * 1000 // Default
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Get server-specific cooldown using canonical slug
    const serverDoc = await Server.findOne({ slug: cleanServer, disabled: { $ne: true } }).collation({ locale: 'en', strength: 2 });
    const serverCooldownMs = serverDoc && serverDoc.voteCooldownMs ? serverDoc.voteCooldownMs : 12 * 60 * 60 * 1000;
    const targetSlug = serverDoc ? serverDoc.slug : cleanServer;

    // Check cooldown from VoteCooldown collection
    const cooldownDoc = await VoteCooldown.findOne({
      username: cleanUsername,
      serverSlug: targetSlug
    }).collation({ locale: 'en', strength: 2 });

    const now = Date.now();
    let cooldown = 0;

    if (cooldownDoc) {
      const diff = now - cooldownDoc.lastVotedAt;
      if (diff < serverCooldownMs) {
        cooldown = serverCooldownMs - diff;
      }
    }

    return NextResponse.json(
      {
        success: true,
        cooldownMs: cooldown,
        serverCooldownMs
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (err: any) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Vote cooldown API error:', err);
    }
    return NextResponse.json(
      { success: false, error: 'Unable to check vote cooldown' },
      { status: 500 }
    );
  }
}
