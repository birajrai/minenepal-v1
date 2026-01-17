import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { API_ENDPOINTS } from '@/lib/config';

const EXTERNAL_API_ENDPOINTS = {
    servers: API_ENDPOINTS.servers(),
    leaderboard: API_ENDPOINTS.leaderboard(),
};

export async function GET(request: Request) {
    try {
        // Optional: Add basic authentication
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Check for secret key (optional security measure)
        if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid or missing secret key'
                },
                { status: 401 }
            );
        }

        const results: Record<string, any> = {};
        const startTime = Date.now();

        // Force fetch fresh data from all endpoints
        console.log('[Force Update] Starting data refresh...');

        // 1. Update servers data
        try {
            const serversResponse = await fetch(EXTERNAL_API_ENDPOINTS.servers, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            if (serversResponse.ok) {
                const serversData = await serversResponse.json();
                results.servers = {
                    success: true,
                    count: serversData.length || 0,
                    timestamp: new Date().toISOString(),
                };
                console.log(`[Force Update] Servers: ${serversData.length} fetched`);
            } else {
                results.servers = {
                    success: false,
                    error: `Failed with status ${serversResponse.status}`,
                };
            }
        } catch (error) {
            results.servers = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }

        // 2. Update leaderboard data
        try {
            const leaderboardResponse = await fetch(EXTERNAL_API_ENDPOINTS.leaderboard, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            if (leaderboardResponse.ok) {
                const leaderboardData = await leaderboardResponse.json();
                results.leaderboard = {
                    success: true,
                    count: leaderboardData.length || 0,
                    timestamp: new Date().toISOString(),
                };
                console.log(`[Force Update] Leaderboard: ${leaderboardData.length} players fetched`);
            } else {
                results.leaderboard = {
                    success: false,
                    error: `Failed with status ${leaderboardResponse.status}`,
                };
            }
        } catch (error) {
            results.leaderboard = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }

        // 3. Revalidate all relevant paths
        const pathsToRevalidate = [
            '/',
            '/servers',
            '/rankings',
            '/rankings/overall',
        ];

        for (const path of pathsToRevalidate) {
            try {
                revalidatePath(path);
                console.log(`[Force Update] Revalidated path: ${path}`);
            } catch (error) {
                console.error(`[Force Update] Failed to revalidate ${path}:`, error);
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`[Force Update] Completed in ${duration}ms`);

        return NextResponse.json(
            {
                success: true,
                message: 'Force update completed successfully',
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
                results,
                revalidatedPaths: pathsToRevalidate,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            }
        );
    } catch (error) {
        console.error('[Force Update] Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
