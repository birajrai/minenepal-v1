'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PlayerCardProps {
  slug: string;
  minecraftName: string;
  totalPoints: number;
  index?: number;
}

export function PlayerCard({
  slug,
  minecraftName,
  totalPoints,
  index = 0,
}: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <Link href={`/profile/${slug}`}>
        <div className="glass-card p-4 hover:shadow-lg cursor-pointer group rounded-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/10 group-hover:border-primary/50 transition-colors shadow-md relative">
              <Image
                src={`https://render.crafty.gg/3d/bust/${minecraftName}`}
                alt={minecraftName}
                fill
                className="object-cover"
                sizes="48px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `/placeholder.svg?height=64&width=64&query=${minecraftName}`;
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                {minecraftName}
              </h3>

              <div className="flex items-center justify-between text-sm mb-2 bg-white/5 rounded-lg p-2">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">
                  Points
                </span>
                <span className="text-primary font-black">
                  {totalPoints.toLocaleString()}
                </span>
              </div>

              <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-70">
                MineNepal Member
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
