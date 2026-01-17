import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/lib/models/Vote';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'Server slug is required' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const requestedLimit = parseInt(limit, 10);
    const finalLimit = !isNaN(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 10) : 10;

    const votes = await Vote.find({ serverSlug: slug })
      .sort({ timestamp: -1 })
      .limit(finalLimit)
      .select('username timestamp')
      .lean();

    return NextResponse.json(
      { success: true, data: votes },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Unable to fetch vote history' },
      { status: 500 }
    );
  }
}
