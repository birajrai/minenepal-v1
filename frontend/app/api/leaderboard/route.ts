import { fetchExternalApi } from '@/lib/api-helpers';
import { API_ENDPOINTS } from '@/lib/config';

export async function GET() {
    return fetchExternalApi(
        API_ENDPOINTS.leaderboard(),
        { revalidate: 60 },
        'leaderboard'
    );
}
