"use client";
import dynamic from 'next/dynamic';

export default function ServerVoteClientWrapper({ slug }: { slug: string }) {
  const ServerVoteClient = dynamic(() => import('./vote-client'), { ssr: false });
  return <ServerVoteClient slug={slug} />;
}
