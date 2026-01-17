export function ServerCardSkeleton() {
    return (
        <div className="bg-gray-50/80 dark:bg-dark-navy-secondary/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl p-6 animate-pulse">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                    <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                    </div>
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Description */}
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
            </div>

            {/* Gamemodes */}
            <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20" />
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-24" />
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-16" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-full w-28" />
            </div>
        </div>
    );
}
