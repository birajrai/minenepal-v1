import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VoteCooldown from '@/lib/models/VoteCooldown';
import Vote from '@/lib/models/Vote';
import Server from '@/lib/models/Server';
import UserInfo from '@/lib/models/UserInfo';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, RateLimitPresets.VOTE);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many vote attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
          }
        }
      );
    }
    await dbConnect();

    const { username, server, discordId, secret, token } = await request.json();

    if (!username || !server) {
      return NextResponse.json(
        { success: false, error: 'username and server are required' },
        { status: 400 }
      );
    }

    // Verify Turnstile Token if not using secret (API votes might use secret, web votes use token)
    // If secret is present, we assume it's a trusted source (like a plugin) or we check the secret.
    // However, the current logic checks secret later for rewards.
    // We should enforce Turnstile for web votes (where secret is likely empty or not the server secret).
    // Let's assume if 'token' is provided, we verify it. If not provided, we might skip if it's a plugin vote?
    // But the request comes from the client which now sends a token.
    // Let's enforce token if no secret is provided (web vote).

    if (!secret && !token) {
      return NextResponse.json(
        { success: false, error: 'Security check failed (missing token)' },
        { status: 400 }
      );
    }

    if (token) {
      const verifyFormData = new FormData();
      verifyFormData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
      verifyFormData.append('response', token);
      // verifyFormData.append('remoteip', request.headers.get('x-forwarded-for') || request.ip); // Optional

      const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verifyFormData,
      });

      const turnstileOutcome = await turnstileResult.json();
      if (!turnstileOutcome.success) {
        return NextResponse.json(
          { success: false, error: 'Security check failed' },
          { status: 403 }
        );
      }
    }

    const cleanServer = server.trim();
    const cleanUsername = username.trim();

    // Find server using case-insensitive match to get canonical slug
    const serverDoc = await Server.findOne({ slug: cleanServer, disabled: { $ne: true } }).collation({ locale: 'en', strength: 2 });
    if (!serverDoc) {
      return NextResponse.json(
        { success: false, error: 'Server not found or disabled' },
        { status: 404 }
      );
    }

    const targetSlug = serverDoc.slug;
    const serverCooldownMs = serverDoc.voteCooldownMs || 12 * 60 * 60 * 1000;

    let sendRewards = false;
    if (secret && secret.trim() !== '') {
      if (!serverDoc.secret || secret.trim() !== serverDoc.secret.trim()) {
        return NextResponse.json(
          { success: false, error: 'Invalid secret for vote reward' },
          { status: 403 }
        );
      }
      if (!serverDoc.votingRewardEnabled) {
        return NextResponse.json(
          { success: false, error: 'Voting rewards are not enabled for this server' },
          { status: 403 }
        );
      }
      sendRewards = true;
    }

    const now = Date.now();

    // Check cooldown from VoteCooldown collection
    const cooldownDoc = await VoteCooldown.findOne({
      username: cleanUsername,
      serverSlug: targetSlug
    }).collation({ locale: 'en', strength: 2 });

    if (cooldownDoc) {
      const diff = now - cooldownDoc.lastVotedAt;
      if (diff < serverCooldownMs) {
        const cooldown = serverCooldownMs - diff;
        const hours = Math.floor(cooldown / (1000 * 60 * 60));
        const minutes = Math.floor((cooldown % (1000 * 60 * 60)) / (1000 * 60));
        const timeMsg = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        return NextResponse.json(
          {
            success: false,
            error: `You can vote again in ${timeMsg}`,
            cooldownMs: cooldown,
            serverCooldownMs
          },
          { status: 429 }
        );
      }

      // Update existing cooldown document
      cooldownDoc.lastVotedAt = now;
      await cooldownDoc.save();
    } else {
      // Create new cooldown document
      await VoteCooldown.create({
        username: cleanUsername,
        serverSlug: targetSlug,
        lastVotedAt: now
      });
    }

    // Ensure user exists in UserInfo (create if not exists)
    let user = await UserInfo.findOne({ minecraftName: cleanUsername }).collation({ locale: 'en', strength: 2 });
    if (!user) {
      user = new UserInfo({
        minecraftName: cleanUsername,
        discordId: discordId || `web_${cleanUsername}_${Date.now()}`, // Generate unique ID for web users
        lastVoted: new Map()
      });
      await user.save();
    }

    // Increment server vote count atomically
    await Server.updateOne({ _id: serverDoc._id }, { $inc: { vote: 1 } });

    // Record the vote in Vote collection (for history)
    const newVote = new Vote({
      username: cleanUsername,
      server: serverDoc._id,
      serverSlug: targetSlug,
      timestamp: new Date(now)
    });
    await newVote.save();

    if (sendRewards) {
      // TODO: Implement WebSocket broadcast for rewards
    }

    return NextResponse.json({
      success: true,
      data: { server: targetSlug, username: cleanUsername, rewardSent: sendRewards }
    });
  } catch (err: any) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Vote API error:', err);
    }
    return NextResponse.json(
      { success: false, error: 'An error occurred while processing your vote' },
      { status: 500 }
    );
  }
}
