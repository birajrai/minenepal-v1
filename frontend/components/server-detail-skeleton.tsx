import { motion } from 'framer-motion';

// Fixed widths to avoid hydration mismatch
const skeletonWidths = ['85%', '78%', '92%', '73%', '88%', '81%', '76%', '90%'];

export function ServerDetailSkeleton() {
    return (
        <div className="bg-white dark:bg-dark-navy">
            {/* Banner Skeleton */}
            <div className="relative h-64 md:h-80 bg-gray-200 dark:bg-dark-navy-secondary animate-pulse" />

            <section className="px-4 sm:px-6 max-w-7xl mx-auto -mt-20 relative z-10 mb-8">
                {/* Header Card Skeleton */}
                <div className="bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-6 md:p-8 animate-pulse">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                        <div className="w-full">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-64" />
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-200 dark:bg-slate-700 rounded-full" />
                                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-48 mt-2" />
                        </div>
                        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-40" />
                    </div>

                    <div className="space-y-2 mb-6">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx}>
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-2" />
                                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Skeleton */}
            <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto space-y-12">
                {/* Gamemodes Skeleton */}
                <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-40" />
                    <div className="flex flex-wrap gap-3">
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-24" />
                        ))}
                    </div>
                </div>

                <div className="h-px bg-gray-300 dark:bg-slate-700" />

                {/* Content Skeleton */}
                <div className="bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-6 md:p-8 animate-pulse">
                    <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-4" />
                    <div className="space-y-3">
                        {skeletonWidths.map((width, idx) => (
                            <div key={idx} className="h-4 bg-gray-200 dark:bg-slate-700 rounded" style={{ width }} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
