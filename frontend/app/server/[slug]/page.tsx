import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, COMMON_KEYWORDS } from '@/lib/seo';
import ServerDetailClient from './server-detail-client';
import { API_ENDPOINTS } from '@/lib/config';

interface ServerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServerPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Fetch server data from external API
    const response = await fetch(API_ENDPOINTS.servers(), {
      next: { revalidate: 1800 } // 30 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch servers');
    }

    const servers = await response.json();
    const server = servers.find((s: any) => s.slug === slug);

    if (!server) {
      return generateSEOMetadata({
        title: 'Server Not Found',
        description: 'The requested Minecraft server could not be found.',
        keywords: COMMON_KEYWORDS,
        canonical: `/server/${slug}`,
      });
    }

    return generateSEOMetadata({
      title: server.name,
      description: server.description,
      keywords: [
        ...COMMON_KEYWORDS,
        server.name,
        ...server.gamemodes,
        server.server_type || '',
        'minecraft server',
      ],
      // Use API-provided image for Open Graph / Twitter if available
      ogImage: server.image || undefined,
      canonical: `/server/${slug}`,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return generateSEOMetadata({
      title: 'Minecraft Server',
      description: 'View detailed information about this Minecraft server.',
      keywords: COMMON_KEYWORDS,
      canonical: `/server/${slug}`,
    });
  }
}

export default async function ServerDetailPage({ params }: ServerPageProps) {
  const { slug } = await params;
  return <ServerDetailClient slug={slug} />;
}