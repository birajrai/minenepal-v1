import { fetchExternalApi } from '@/lib/api-helpers';
import { API_ENDPOINTS } from '@/lib/config';

export async function GET() {
  return fetchExternalApi(
    API_ENDPOINTS.servers(),
    { revalidate: 300 }, // 5 minutes cache
    'servers'
  );
}
