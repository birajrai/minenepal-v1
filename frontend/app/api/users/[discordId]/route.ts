import { NextResponse } from 'next/server';
import { fetchExternalApi } from '@/lib/api-helpers';
import { API_ENDPOINTS } from '@/lib/config';

export async function GET(
    request: Request,
    context: { params: Promise<{ discordId: string }> }
) {
    const { discordId } = await context.params;

    if (!discordId || typeof discordId !== 'string') {
        return NextResponse.json(
            {
                success: false,
                error: 'Invalid Discord ID',
                message: 'Discord ID parameter is required'
            },
            { status: 400 }
        );
    }

    return fetchExternalApi(
        API_ENDPOINTS.user(discordId),
        { revalidate: 300 },
        `user ${discordId}`
    );
}
