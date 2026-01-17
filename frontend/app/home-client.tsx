"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { AnimatedCounter } from "@/components/animated-counter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faTrophy, faUsers, faCalendar, faShoppingCart, faServer, faPeopleGroup } from '@fortawesome/free-solid-svg-icons';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function HomeClient() {
    const [copiedIP, setCopiedIP] = useState<string | null>(null);
    const [stats, setStats] = useState([
        { label: "Total Members", value: 0, icon: faPeopleGroup },
        { label: "Total Servers", value: 0, icon: faServer },
        { label: "Online Players", value: 0, icon: faGamepad },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();
                const statsData = [
                    { label: "Total Members", value: data.total_discord_members || 0, icon: faPeopleGroup },
                    { label: "Total Servers", value: data.total_servers || 0, icon: faServer },
                    { label: "Online Players", value: data.total_active_players || 0, icon: faGamepad },
                ];
                setStats(statsData);
                // Save to localStorage with timestamp
                localStorage.setItem('minenepal_stats', JSON.stringify({ stats: statsData, ts: Date.now() }));
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        // Try to load from localStorage first
        const cached = localStorage.getItem('minenepal_stats');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.ts && Date.now() - parsed.ts < 5 * 60 * 1000 && Array.isArray(parsed.stats)) {
                    setStats(parsed.stats);
                    return;
                }
            } catch {}
        }
        fetchStats();
    }, []);

    // Arrays for static homepage data

    const topServers = [
        { icon: "https://news.minenepal.xyz/wp-content/uploads/2025/11/infinityrealms.webp", name: "InfinityRealms", players: "50+", ip: "infinitynp.fun", server: "/server/infinityrealms" },
        { icon: "https://news.minenepal.xyz/wp-content/uploads/2025/11/minecraftnepal.png", name: "Minecraft Nepal", players: "40+", ip: "mc.minecraftnepal.com", server: "/server/minecraft-nepal" },
        { icon: "https://news.minenepal.xyz/wp-content/uploads/2025/11/diamond.png", name: "NepaliPVP", players: "35+", ip: "nppvp.in", server: "/server/nppvp" },
    ];

    const topPlayers = [
        { name: "ShaqRbcauxe", profile: "/profile/ShaqRbcauxe" },
        { name: "REG_MI", profile: "/profile/REG_MI" },
        { name: "ShaqDext3r", profile: "/profile/ShaqDext3r" },
    ];

    const topCreators = [
        { name: "NishantSAMA", profile: "https://explore.minenepal.xyz/creator/NishantSAMA" },
        { name: "Awpain", profile: "https://explore.minenepal.xyz/creator/Awpain" },
        { name: "NepAayuz", profile: "https://explore.minenepal.xyz/creator/NepAayuz" },
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIP(text);
        setTimeout(() => setCopiedIP(null), 2000);
    };

    const marketplaceItems = [
        { title: "Custom Discord Bot", image: "/marketplace/discord.svg", link: "https://app.minenepal.xyz/resources/categories/discord-bot.10/" },
        { title: "Custom Minecraft Plugins", image: "/marketplace/plugins.svg", link: "https://app.minenepal.xyz/resources/categories/custom-plugin.13/" },
        { title: "Custom Website", image: "/marketplace/website.svg", link: "https://app.minenepal.xyz/resources/categories/custom-website.12/" },
    ];

    const testimonials = [
        { name: "sharzydrawz", msg: "Great discord bot package. love it!", avatar: "https://mc-heads.net/avatar/sharzydrawz/100" },
        { name: "gaurav87565", msg: "Thanks for great MC website & great support!", avatar: "https://mc-heads.net/avatar/gaurav87565/100" },
        { name: "GTMSudarshan", msg: "Love the server listings and stats!", avatar: "https://mc-heads.net/avatar/GTMSudarshan/100" },
    ];

    return (
        <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-dark-navy dark:via-dark-navy-secondary dark:to-dark-navy">
            {/* Hero + short intro */}
            <HeroSection
                title="Welcome to MineNepal"
                subtitle="Nepal's largest Minecraft community — discover servers, top players, marketplace and more."
            >
                <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/servers" className="btn-primary shadow-xl hover:shadow-2xl">
                        Explore Servers
                    </Link>
                    <Link href="/about" className="btn-secondary shadow-lg hover:shadow-xl">
                        About Us
                    </Link>
                </div>
            </HeroSection>

            {/* Stats Section (arrays) */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {stats.map((s) => (
                        <div key={s.label} className="group rounded-2xl border border-gray-200/80 dark:border-neutral-800/50 p-8 text-center bg-white/80 dark:bg-dark-navy/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                                <AnimatedCounter value={s.value} duration={2000} />
                            </div>
                            <div className="mt-1 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 text-lg">
                                <FontAwesomeIcon icon={s.icon} className="mr-1" /> {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-neutral-700 to-transparent"></div>
            </div>

            {/* Top Servers, Players & Creators (arrays) */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">Top Rankings</h2>
                    <p className="text-gray-600 dark:text-gray-400">Discover the best servers, players, and creators in Nepal</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="group rounded-2xl border border-gray-200/80 dark:border-neutral-800/50 p-6 bg-white/80 dark:bg-dark-navy/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-coffee/30 dark:hover:border-coffee-dark/30 transition-all duration-300">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Top Servers</h3>
                        <ul className="space-y-3">
                            {topServers.map((s, i) => (
                                <li key={s.name} className="flex items-center justify-between rounded-lg bg-gray-100 dark:bg-dark-navy-secondary p-4 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300">
                                    <Link href={s.server} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <FontAwesomeIcon icon={faTrophy} className={`w-6 h-6 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                            <Image src={s.icon} alt={s.name} fill sizes="40px" className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{s.name}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">{s.ip}</div>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => copyToClipboard(s.ip)}
                                        className="px-3 py-1.5 text-xs rounded-md bg-coffee text-white hover:bg-coffee-dark transition-colors"
                                    >
                                        {copiedIP === s.ip ? 'Copied!' : 'Copy IP'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="group rounded-2xl border border-gray-200/80 dark:border-neutral-800/50 p-6 bg-white/80 dark:bg-dark-navy/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-coffee/30 dark:hover:border-coffee-dark/30 transition-all duration-300">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Top Players</h3>
                        <ul className="space-y-3">
                            {topPlayers.map((p, i) => (
                                <li key={p.name}>
                                    <Link href={p.profile} className="flex items-center gap-3 rounded-lg bg-gray-100 dark:bg-dark-navy-secondary p-4 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300">
                                        <FontAwesomeIcon icon={faTrophy} className={`w-6 h-6 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                            <Image src={`https://mc-heads.net/avatar/${p.name}/100`} alt={p.name} fill sizes="40px" className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="group rounded-2xl border border-gray-200/80 dark:border-neutral-800/50 p-6 bg-white/80 dark:bg-dark-navy/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-coffee/30 dark:hover:border-coffee-dark/30 transition-all duration-300">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Top Creators</h3>
                        <ul className="space-y-3">
                            {topCreators.map((c, i) => (
                                <li key={c.name}>
                                    <Link href={c.profile} className="flex items-center gap-3 rounded-lg bg-gray-100 dark:bg-dark-navy-secondary p-4 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300">
                                        <FontAwesomeIcon icon={faTrophy} className={`w-6 h-6 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                            <Image src={`https://mc-heads.net/avatar/${c.name}/100`} alt={c.name} fill sizes="40px" className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-neutral-700 to-transparent"></div>
            </div>

            {/* Marketplace (arrays) */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="relative bg-gradient-to-br from-gray-100/50 to-gray-50/50 dark:from-neutral-900/30 dark:to-neutral-800/30 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200/50 dark:border-neutral-800/30">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-2">Marketplace</h2>
                            <p className="text-gray-600 dark:text-gray-400">Premium services for your Minecraft community</p>
                        </div>
                        <Link href="https://app.minenepal.xyz/resources/categories/official-resources.9/" className="text-coffee dark:text-white font-semibold hover:opacity-80 transition-opacity flex items-center gap-2 group">
                            <span>View All</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {marketplaceItems.map((item, idx) => (
                            <div key={`${item.title}-${idx}`} className="group rounded-2xl border border-gray-200/80 dark:border-neutral-800/50 bg-white/90 dark:bg-dark-navy/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-navy-secondary mb-4">
                                <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                            </div>
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">{item.title}</h4>
                            <Link href={item.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2 rounded-lg bg-coffee text-white hover:bg-coffee-dark transition-colors font-semibold">
                                Order Now
                            </Link>
                        </div>
                    ))}
                </div>
                </div>
            </section>

            {/* Divider */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-neutral-700 to-transparent"></div>
            </div>

            {/* Testimonials slider (arrays) */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">What Players Say</h2>
                    <p className="text-gray-600 dark:text-gray-400">Hear from our amazing community members</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, idx) => (
                        <div key={`${t.name}-${idx}`} className="group rounded-2xl border border-gray-200/80 dark:border-neutral-800/50 bg-white/80 dark:bg-dark-navy/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                <div className="flex flex-col items-center text-center">
                                    <Image src={t.avatar} alt={t.name} width={80} height={80} className="rounded-md shadow-lg" />
                                    <div className="mt-3 font-semibold text-coffee dark:text-white">{t.name}</div>
                                    <p className="mt-2 text-gray-700 dark:text-gray-300 italic">{t.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
            </section>

            {/* Divider */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-neutral-700 to-transparent"></div>
            </div>

            {/* CTA Section */}
            <section className="py-24 px-4 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden bg-gradient-to-br from-coffee via-coffee-dark to-coffee-light dark:from-coffee-dark dark:via-coffee-light dark:to-coffee rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl border border-coffee/20"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                    <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Join the Community?
                    </h2>
                    <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
                        Explore amazing servers, find skilled players, and become part of
                        the thriving MineNepal community today.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link
                            href="/servers"
                            className="bg-white text-coffee hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
                        >
                            Browse Servers
                        </Link>
                        <Link
                            href="/about"
                            className="border-2 border-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                        >
                            Learn More
                        </Link>
                    </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
