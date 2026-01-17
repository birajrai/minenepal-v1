import { NextResponse } from 'next/server';

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const CACHE_DURATION = 120; // 2 minutes default

interface FetchOptions extends RequestInit {
    timeout?: number;
    revalidate?: number;
}

export async function fetchExternalApi(
    url: string,
    options: FetchOptions = {},
    errorContext: string = 'external API'
): Promise<NextResponse> {
    const { timeout = DEFAULT_TIMEOUT, revalidate = CACHE_DURATION, ...fetchOptions } = options;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
                next: { revalidate },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch from ${url}:`, errorText);

                return NextResponse.json(
                    {
                        success: false,
                        error: `Failed to fetch ${errorContext}`,
                        message: 'Data temporarily unavailable'
                    },
                    { status: response.status }
                );
            }

            const data = await response.json();

            return NextResponse.json(
                {
                    success: true,
                    data: data,
                    count: Array.isArray(data) ? data.length : undefined,
                    timestamp: new Date().toISOString()
                },
                {
                    status: 200,
                    headers: {
                        'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`,
                    },
                }
            );

        } catch (fetchError) {
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Request timeout',
                        message: `${errorContext} request took too long to respond`
                    },
                    { status: 504 }
                );
            }
            throw fetchError;
        }
    } catch (error) {
        console.error(`Error in ${errorContext} API route:`, error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
