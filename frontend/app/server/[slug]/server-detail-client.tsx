'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { ServerDetailSkeleton } from '@/components/server-detail-skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/lib/user-context';
import VoteHistory from '@/components/vote-history';

import { Server } from '@/types';

interface ServerDetailClientProps {
    slug: string;
}

// Helper function to format cooldown
function formatCooldown(ms: number) {
    if (ms <= 0) return '0s';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

export default function ServerDetailClient({ slug }: ServerDetailClientProps) {
    const router = useRouter();
    const { user } = useUser();
    const [server, setServer] = useState<Server | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [cooldown, setCooldown] = useState<{ server: number | null; discord: number | null }>({ server: null, discord: null });
    const [cooldownActive, setCooldownActive] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

    useEffect(() => {
        const fetchServer = async () => {
            try {
                // Add timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(`/api/server/${slug}`, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setServer({
                    ...data.data,
                    online: data.data.online,
                    players: data.data.players || undefined,
                });
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    setError('Request timeout - server took too long to respond');
                } else {
                    setError(err.message);
                }
                setServer((prevServer) => prevServer ? { ...prevServer, online: false, players: undefined } : null);
            } finally {
                setLoading(false);
            }
        };

        fetchServer();
    }, [slug]);

    // Status is provided by the server API response

    useEffect(() => {
        const fetchCooldown = async () => {
            if (!user) return;
            try {
                const response = await fetch(`/api/vote/cooldown?username=${user.username}&server=${slug}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch cooldown');
                }
                const data = await response.json();
                setCooldown({ server: data.serverCooldownMs, discord: data.discordCooldownMs });
                if (data.cooldownMs && data.cooldownMs > 0) {
                    setCooldownActive(true);
                    setCooldownRemaining(data.cooldownMs);
                } else {
                    setCooldownActive(false);
                    setCooldownRemaining(0);
                }
            } catch (err) {
                console.error('Error fetching cooldown:', err);
            }
        };

        fetchCooldown();
    }, [user, slug]);

    // Countdown timer for cooldown
    useEffect(() => {
        if (!cooldownActive || cooldownRemaining <= 0) return;
        const interval = setInterval(() => {
            setCooldownRemaining((prev) => {
                if (prev <= 1000) {
                    setCooldownActive(false);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldownActive, cooldownRemaining]);

    if (loading) {
        return <ServerDetailSkeleton />;
    }

    if (error || !server) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark-navy px-4 py-12 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-dark-navy-secondary rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-8 text-center"
                >
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Server Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The server you're looking for doesn't exist or an error occurred.
                    </p>
                    <Link href="/servers" className="px-6 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-blue-700 dark:hover:bg-blue-800 active:scale-95 shadow-sm inline-block">
                        Back to Servers
                    </Link>
                </motion.div>
            </div>
        );
    }

    const buildPlaceholderUrl = (width: number, height: number, text: string) =>
        `https://placehold.co/${width}x${height}/2563eb/ffffff?text=${encodeURIComponent(text)}`;

    const serverIconPlaceholder = buildPlaceholderUrl(128, 128, server.name.charAt(0) || 'M');
    const serverBannerPlaceholder = buildPlaceholderUrl(1280, 420, server.name);

    const serverIcon = server.server_icon || serverIconPlaceholder;
    const serverImage = server.image || serverBannerPlaceholder;

    const handleCopyIp = () => {
        const text = server.display_address || server.ip;
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

    return (
        <div className="bg-white dark:bg-dark-navy">
            {/* Banner with Server Image */}
            <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative h-64 md:h-80 overflow-hidden"
            >
                <img
                    src={serverImage}
                    alt={server.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = serverBannerPlaceholder;
                    }}
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-white dark:to-dark-navy" />

                {/* Server Icon Overlay */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white/30 dark:border-slate-700/50 bg-gray-50 dark:bg-dark-navy-secondary shadow-2xl"
                    >
                        <img
                            src={serverIcon}
                            alt={`${server.name} icon`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = serverIconPlaceholder;
                            }}
                        />
                    </motion.div>
                </div>
            </motion.div>

            <section className="px-4 sm:px-6 max-w-7xl mx-auto mt-8 md:mt-4 relative z-10 mb-8">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-gray-50 dark:bg-dark-navy-secondary/90 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-6 md:p-8"
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                        <div className="w-full">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {server.name}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span
                                        className={`inline-flex w-3 h-3 rounded-full ${server.online ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    />
                                    <span>{server.online ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 break-all">
                                {server.display_address || `${server.ip}:${server.port}`}
                            </p>
                            <div className="mt-3">
                                <TooltipProvider>
                                    <Tooltip>
                                            <TooltipTrigger asChild>
                                            <button
                                                onClick={handleCopyIp}
                                                className="w-full sm:w-auto bg-green-600/10 dark:bg-green-400/10 hover:bg-green-600/20 dark:hover:bg-green-400/20 text-green-700 dark:text-green-300 border border-green-600/30 dark:border-green-400/30 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                                            >
                                                {copied ? 'COPIED' : (server.display_address || server.ip)}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-semibold">Click to copy</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <Link href="/servers" className="px-6 py-2.5 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-lg font-semibold transition-all duration-200 hover:bg-blue-600/20 dark:hover:bg-blue-400/20 w-full sm:w-auto text-center">
                            ← Back to Servers
                        </Link>
                    </div>

                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-6">
                        {server.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                        >
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Players
                            </div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {server.online && server.players && server.players.online !== undefined && server.players.max !== undefined
                                    ? `${server.players.online}/${server.players.max}`
                                    : server.online ? 'Online' : 'Offline'}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Votes
                            </div>
                            <div
                                className={`text-2xl font-bold text-blue-600 dark:text-blue-400`}
                            >
                                {server.vote}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Server Type
                            </div>
                            <div
                                className={`text-2xl font-bold text-blue-600 dark:text-blue-400`}
                            >
                                {server.server_type}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.25 }}
                        >
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Bedrock Support
                            </div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {server.bedrock_ip ? 'Yes' : 'No'}
                            </div>
                        </motion.div>
                    </div>

                    {/* Vote Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="mt-6"
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                                        onClick={() => router.push(`/server/${slug}/vote`)}
                                        disabled={cooldownActive}
                                    >
                                        <FontAwesomeIcon icon={faThumbsUp} className="h-5 w-5" />
                                        {cooldownActive
                                            ? `Vote available in ${formatCooldown(cooldownRemaining)}`
                                            : `Vote for ${server.name}`}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold">{cooldownActive ? 'You must wait for the cooldown to vote again.' : 'Record your vote'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </motion.div>

                    {/* Server Links */}
                    {(server.website || server.discord || server.youtube) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.35 }}
                            className="mt-6"
                        >
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                                Server Links
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {server.website && (
                                    <a
                                        href={server.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-gray-100 dark:bg-dark-navy-secondary text-gray-900 dark:text-white rounded-lg font-semibold text-sm transition-all duration-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                                    >
                                        <FontAwesomeIcon icon={faGlobe} className="h-4 w-4 mr-2" />
                                        Website
                                    </a>
                                )}
                                {server.discord && (
                                    <a
                                        href={server.discord}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-gray-100 dark:bg-dark-navy-secondary text-gray-900 dark:text-white rounded-lg font-semibold text-sm transition-all duration-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                                    >
                                        <FontAwesomeIcon icon={faDiscord} className="h-4 w-4 mr-2" />
                                        Discord
                                    </a>
                                )}
                                {server.youtube && (
                                    <a
                                        href={server.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-gray-100 dark:bg-dark-navy-secondary text-gray-900 dark:text-white rounded-lg font-semibold text-sm transition-all duration-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                                    >
                                        <FontAwesomeIcon icon={faYoutube} className="h-4 w-4 mr-2" />
                                        YouTube
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </section>

            {/* Content */}
            <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto space-y-12">
                {/* Gamemodes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Gamemodes
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {server.gamemodes.map((gamemode, idx) => (
                            <motion.div
                                key={gamemode}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                viewport={{ once: true }}
                                className="px-4 py-2 bg-blue-600/10 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300 border border-blue-600/20 dark:border-blue-400/20 rounded-lg font-medium"
                            >
                                {gamemode}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <div className="section-divider" />

                {/* Server Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 dark:bg-dark-navy-secondary rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-6 md:p-8"
                >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Server Content
                    </h3>
                    <div className="space-y-3 text-sm prose prose-slate dark:prose-invert max-w-none text-foreground dark:text-foreground prose-headings:text-foreground prose-p:text-foreground/85 prose-strong:text-foreground prose-a:text-primary">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {server.content}
                        </ReactMarkdown>
                    </div>
                </motion.div>

                <div className="section-divider" />

                {/* Vote History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    viewport={{ once: true }}
                >
                    <VoteHistory serverSlug={slug} />
                </motion.div>
            </section>
        </div>
    );
}
