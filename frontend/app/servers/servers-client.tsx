'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ServerCard } from '@/components/server-card';
import { ServerCardSkeleton } from '@/components/server-card-skeleton';

import { Server } from '@/types';

interface ServerData extends Server {}

export default function ServersClient() {
    const [servers, setServers] = useState<ServerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'java' | 'bedrock'>('all');

    useEffect(() => {
        const loadServers = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/servers', { 
                    next: { revalidate: 300 }
                });
                if (!res.ok) throw new Error('Failed to fetch servers');
                const json = await res.json();
                const list: ServerData[] = json.data || json || [];
                setServers(list);
            } catch (e) {
                setServers([]);
            } finally {
                setLoading(false);
            }
        };
        loadServers();
    }, []);

    const filteredServers = useMemo(() => {
        // Filter servers by search and status
        const filtered = servers.filter(server => {
            const matchesSearch =
                server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                server.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'java' && server.server_type?.includes('Java')) ||
                (statusFilter === 'bedrock' && server.server_type?.includes('Bedrock'));

            return matchesSearch && matchesStatus;
        });
        // Sort by vote count descending
        return filtered.sort((a, b) => (b.vote ?? 0) - (a.vote ?? 0));
    }, [searchTerm, statusFilter, servers]);

    return (
        <div className="bg-white dark:bg-dark-navy">
            {/* Page Header */}
            <section className="py-6 px-4 border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">Minecraft Servers</h1>
                    <p className="text-base text-gray-600 dark:text-gray-400">Find and join the best Minecraft servers in Nepal</p>
                </div>
            </section>

            <section className="py-12 px-4 max-w-7xl mx-auto">
                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <input
                        type="text"
                        placeholder="Search servers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-navy-secondary border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:focus:ring-blue-400/30 transition-all duration-200 text-base"
                    />
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-end"
                >
                    {/* Status Filter */}
                    <div className="w-full sm:max-w-xs">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Server Type
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-navy-secondary border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:focus:ring-blue-400/30 transition-all duration-200"
                        >
                            <option value="all">All Types</option>
                            <option value="java">Java</option>
                            <option value="bedrock">Bedrock</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex w-full sm:w-auto">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                            className="px-6 py-2.5 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-lg font-semibold transition-all duration-200 hover:bg-blue-600/20 dark:hover:bg-blue-400/20 w-full sm:w-auto justify-center"
                        >
                            Clear Filters
                        </button>
                    </div>
                </motion.div>

                {/* Results */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mb-6"
                >
                    <p className="text-gray-600 dark:text-gray-400">
                        {loading ? 'Loading servers...' : `Showing ${filteredServers.length} of ${servers.length} servers`}
                    </p>
                </motion.div>

                {/* Server Grid */}
                {!loading && filteredServers.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {filteredServers.map((server, idx) => (
                            <ServerCard
                                key={server.slug}
                                name={server.name}
                                description={server.description}
                                slug={server.slug}
                                gamemodes={server.gamemodes}
                                server_type={server.server_type}
                                vote={server.vote}
                                online={server.online}
                                players={server.players}
                                image={server.image}
                                server_icon={server.server_icon}
                                ip={server.ip}
                                index={idx}
                            />
                        ))}
                    </motion.div>
                ) : !loading ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 dark:bg-dark-navy-secondary rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-12 text-center"
                    >
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                            No servers found
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Try adjusting your filters or search term
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <ServerCardSkeleton key={idx} />
                        ))}
                    </motion.div>
                )}
            </section>
        </div>
    );
}
