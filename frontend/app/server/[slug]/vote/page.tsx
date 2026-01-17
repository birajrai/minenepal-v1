import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, COMMON_KEYWORDS } from '@/lib/seo';
import React from 'react';
import ServerVoteClientWrapper from './client-wrapper';
import { API_ENDPOINTS } from '@/lib/config';

interface ServerVotePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServerVotePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await fetch(API_ENDPOINTS.servers(), {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch servers');
    }

    const servers = await response.json();
    const server = servers.find((s: any) => s.slug === slug);

    if (!server) {
      return generateSEOMetadata({
        title: 'Vote | MineNepal',
        description: 'Submit your vote for MineNepal servers.',
        keywords: COMMON_KEYWORDS,
        canonical: `/server/${slug}/vote`,
      });
    }

    return generateSEOMetadata({
      title: `Vote for ${server.name}`,
      description: `Support ${server.name} by casting your vote on MineNepal.`,
      keywords: [
        ...COMMON_KEYWORDS,
        server.name,
        ...(server.gamemodes || []),
        server.server_type || '',
        'minecraft server vote',
      ],
      canonical: `/server/${slug}/vote`,
    });
  } catch (error) {
    console.error('Error generating vote page metadata:', error);
    return generateSEOMetadata({
      title: 'Vote | MineNepal',
      description: 'Submit your vote for MineNepal servers.',
      keywords: COMMON_KEYWORDS,
      canonical: `/server/${slug}/vote`,
    });
  }
}

export default async function ServerVotePage({ params }: ServerVotePageProps) {
  const { slug } = await params;
  return <ServerVoteClientWrapper slug={slug} />;
}
