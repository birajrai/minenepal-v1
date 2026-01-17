'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface LeaderboardRow {
  rank: number;
  minecraftName: string;
  slug: string;
  gamemode: string;
  points: number;
}

interface LeaderboardTableProps {
  data: LeaderboardRow[];
}

export function LeaderboardTable({ data }: LeaderboardTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border bg-dust-grey/20 dark:bg-carbon-black/30">
              <th className="text-left px-4 py-3 font-semibold text-sm text-foreground">
                Rank
              </th>
              <th className="text-left px-4 py-3 font-semibold text-sm text-foreground">
                Player
              </th>
              <th className="text-left px-4 py-3 font-semibold text-sm text-foreground">
                Points
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <motion.tr
                key={`${row.rank}-${row.minecraftName}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                viewport={{ once: true }}
                className="border-b border-card-border hover:bg-muted/20 transition-colors duration-150"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-mahogany-red-2 text-white font-bold text-sm">
                    {row.rank}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/profile/${row.slug}`}
                    className="text-mahogany-red-2 font-semibold hover:underline"
                  >
                    {row.minecraftName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-strawberry-red">
                    {row.points.toLocaleString()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
