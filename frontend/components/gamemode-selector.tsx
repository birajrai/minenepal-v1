'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { gamemodeIcons, gamemodeColors } from '@/utils/gamemode-icons';

interface GamemodeSelectorProps {
    gamemodes: string[];
    activeGamemode: string;
}

export function GamemodeSelector({ gamemodes, activeGamemode }: GamemodeSelectorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap justify-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-dark-navy-secondary/50 p-2 shadow-lg backdrop-blur-md sm:gap-3 sm:p-4"
        >
            {gamemodes.map((gamemode) => {
                const icon = gamemodeIcons[gamemode];
                const color = gamemodeColors[gamemode] || "text-gray-400";

                const isActive = activeGamemode.toLowerCase() === gamemode.toLowerCase();

                return (
                    <Link
                        key={gamemode}
                        href={`/rankings/${gamemode.toLowerCase()}`}
                        className={`bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border shadow-sm flex items-center gap-2 rounded-full px-6 py-3 text-base font-bold transition-all duration-300 hover:scale-105 hover:bg-gray-100 dark:hover:bg-slate-700 ${isActive
                                ? "border-blue-600/60 dark:border-blue-400/60 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400"
                                : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400"
                            }`}
                    >
                        {icon && (
                            <Image src={icon} alt={`${gamemode} icon`} width={20} height={20} className="h-5 w-5" />
                        )}
                        <span>{gamemode}</span>
                    </Link>
                );
            })}
        </motion.div>
    );
}
