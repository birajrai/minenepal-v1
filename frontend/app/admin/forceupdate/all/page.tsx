'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminForceUpdatePage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleForceUpdate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/admin/forceupdate/all');
            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.message || 'Failed to update data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-dark-navy py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Admin: Force Data Update
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Manually trigger a fresh data fetch from all external APIs
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-gray-50 dark:bg-dark-navy-secondary rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-8"
                >
                    <div className="space-y-6">
                        <div className="bg-coffee/10 dark:bg-coffee-dark/20 border border-coffee/30 dark:border-coffee-dark/30 rounded-lg p-4">
                            <h2 className="text-lg font-bold text-coffee-dark dark:text-white mb-2">
                                ℹ️ What does this do?
                            </h2>
                            <ul className="text-sm text-coffee-dark dark:text-gray-200 space-y-1 list-disc list-inside">
                                <li>Fetches fresh data from external APIs (servers, leaderboard)</li>
                                <li>Bypasses Next.js cache completely</li>
                                <li>Revalidates all relevant pages (/, /servers, /rankings)</li>
                                <li>Shows real-time update status</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleForceUpdate}
                            disabled={loading}
                            className="w-full px-6 py-4 bg-coffee dark:bg-coffee-dark text-white rounded-lg font-bold text-lg transition-all duration-200 hover:bg-coffee-dark dark:hover:bg-coffee-light active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-coffee dark:disabled:hover:bg-coffee-dark"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Updating Data...
                                </span>
                            ) : (
                                '🔄 Force Update All Data'
                            )}
                        </button>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                            >
                                <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-2">
                                    ❌ Error
                                </h3>
                                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <h3 className="text-lg font-bold text-green-900 dark:text-green-400 mb-2">
                                        ✅ Update Successful
                                    </h3>
                                    <div className="text-sm text-green-800 dark:text-green-300 space-y-1">
                                        <p>Duration: <strong>{result.duration}</strong></p>
                                        <p>Timestamp: <strong>{new Date(result.timestamp).toLocaleString()}</strong></p>
                                    </div>
                                </div>

                                <div className="bg-gray-100 dark:bg-dark-navy rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">Results:</h4>
                                    <div className="space-y-3">
                                        {Object.entries(result.results || {}).map(([key, value]: [string, any]) => (
                                            <div
                                                key={key}
                                                className="bg-white dark:bg-dark-navy-secondary rounded-lg p-3 border border-gray-200 dark:border-slate-700"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                                        {key}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-bold ${value.success
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {value.success ? '✓ Success' : '✗ Failed'}
                                                    </span>
                                                </div>
                                                {value.count !== undefined && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Count: {value.count}
                                                    </p>
                                                )}
                                                {value.error && (
                                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                        Error: {value.error}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {result.revalidatedPaths && (
                                    <div className="bg-gray-100 dark:bg-dark-navy rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                            Revalidated Paths:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.revalidatedPaths.map((path: string) => (
                                                <span
                                                    key={path}
                                                    className="px-3 py-1 bg-coffee/10 dark:bg-coffee-dark/30 text-coffee dark:text-white rounded-full text-sm font-mono"
                                                >
                                                    {path}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                    <p>This endpoint can also be triggered programmatically via:</p>
                    <code className="block mt-2 px-4 py-2 bg-gray-100 dark:bg-dark-navy-secondary rounded text-gray-900 dark:text-white font-mono">
                        GET /api/admin/forceupdate/all
                    </code>
                </motion.div>
            </div>
        </div>
    );
}
