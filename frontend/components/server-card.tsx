'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faGamepad, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ServerCardProps {
  name: string;
  slug: string;
  description: string;
  gamemodes: string[];
  server_type?: string;
  vote?: number;
  online?: boolean;
  players?: { online: number; max: number };
  image?: string;
  server_icon?: string;
  ip: string;
  display_address?: string;
  index?: number;
}

export function ServerCard({
  slug,
  name,
  description,
  gamemodes,
  server_type,
  vote,
  online,
  players,
  image,
  server_icon,
  ip,
  display_address,
  index = 0,
}: ServerCardProps) {
  const [copied, setCopied] = React.useState(false);
  // Removed vote handler; voting is available on the server detail page only.

  const handleCopyIp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = display_address || ip;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const buildPlaceholderUrl = (width: number, height: number, text: string) =>
    `https://placehold.co/${width}x${height}/2563eb/ffffff?text=${encodeURIComponent(text)}`;

  const serverIconPlaceholder = buildPlaceholderUrl(64, 64, name.charAt(0) || 'M');
  const serverBannerPlaceholder = buildPlaceholderUrl(640, 360, name);

  const serverIcon = server_icon || serverIconPlaceholder;
  const serverImage = image || serverBannerPlaceholder;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <div className="relative bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl overflow-hidden group h-full flex flex-col hover:shadow-2xl transition-all duration-300">
        <Link href={`/server/${slug}`} className="absolute inset-0 z-0">
          <span className="sr-only">View {name}</span>
        </Link>

        {/* Server Banner with Icon Overlay */}
        <div className="relative h-40 overflow-hidden pointer-events-none">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={serverImage}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = serverBannerPlaceholder;
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-white dark:from-dark-navy via-white/60 dark:via-dark-navy/60 to-transparent" />
          </div>

          {/* Server Icon */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end justify-between">
            <div className="flex items-end gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 dark:border-slate-700/50 bg-gray-50 dark:bg-dark-navy-secondary shadow-xl group-hover:scale-110 transition-transform duration-300">
                <img
                  src={serverIcon}
                  alt={`${name} icon`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = serverIconPlaceholder;
                  }}
                />
              </div>
              <div className="mb-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] line-clamp-1">
                  {name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-900 dark:text-white">
                  <span className={`inline-flex w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'} shadow-lg`} />
                  <span className="font-medium drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex-1 flex flex-col pointer-events-none">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-100 dark:bg-slate-700/50 rounded-lg p-2.5 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <FontAwesomeIcon icon={faUsers} className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Players</span>
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white">
                {online && players && players.online !== undefined && players.max !== undefined
                  ? `${players.online}/${players.max}`
                  : online ? 'Online' : 'Offline'}
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-slate-700/50 rounded-lg p-2.5 border border-gray-200 dark:border-slate-600">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <FontAwesomeIcon icon={faThumbsUp} className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Votes</span>
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white">
                {vote ?? 0}
              </div>
            </div>
          </div>

          {/* Server Type Badge */}
          {server_type && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-600/20 dark:border-blue-400/20">
                <FontAwesomeIcon icon={faGamepad} className="h-3 w-3" />
                {server_type}
              </span>
            </div>
          )}

          {/* Gamemodes */}
          {gamemodes && gamemodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {gamemodes.slice(0, 3).map((gamemode) => (
                <span
                  key={gamemode}
                  className="px-2 py-0.5 text-xs bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded border border-blue-600/20 dark:border-blue-400/20 font-medium"
                >
                  {gamemode}
                </span>
              ))}
              {gamemodes.length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded border border-gray-300 dark:border-slate-600 font-medium">
                  +{gamemodes.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Copy IP Button */}
          <div className="mt-auto pointer-events-auto relative z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopyIp}
                    className="w-full mb-2 bg-green-600/10 dark:bg-green-400/10 hover:bg-green-600/20 dark:hover:bg-green-400/20 text-green-700 dark:text-green-300 border border-green-600/30 dark:border-green-400/30 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                  >
                    {copied ? 'COPIED' : (display_address || ip)}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">Click to copy</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Vote button removed from servers list as requested */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}