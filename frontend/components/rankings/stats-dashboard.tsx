"use client";

import { motion } from "framer-motion";

interface StatsDashboardProps {
    totalPlayers: number;
    averagePoints: number;
    uniqueProvinces: number;
}

export function StatsDashboard({ totalPlayers, averagePoints, uniqueProvinces }: StatsDashboardProps) {
    const stats = [
        { label: 'Total Players', value: totalPlayers },
        { label: 'Avg Points', value: averagePoints ? averagePoints.toLocaleString() : '—' },
        { label: 'Provinces Represented', value: uniqueProvinces || '—' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-linear-to-br from-gray-100 dark:from-dark-navy-secondary to-gray-200 dark:to-dark-navy p-2 sm:grid-cols-3 sm:gap-4 sm:p-4 backdrop-blur-md shadow-2xl"
        >
            {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-4 text-center shadow-inner transition-transform hover:scale-105 duration-300">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400 font-bold">{stat.label}</p>
                    <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white drop-shadow-lg">{stat.value}</p>
                </div>
            ))}
        </motion.div>
    );
}
