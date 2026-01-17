import { fetchExternalApi } from '@/lib/api-helpers';
import { API_ENDPOINTS } from '@/lib/config';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  return fetchExternalApi(
    API_ENDPOINTS.server(slug),
    { revalidate: 300 }, // 5 minutes cache
    `server ${slug}`
  );
}