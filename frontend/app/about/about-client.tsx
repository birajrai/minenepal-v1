"use client";

import { motion } from 'framer-motion';

export default function AboutClientPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-dark-navy">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">About MineNepal</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
                        MineNepal is your go-to platform for discovering Minecraft servers, viewing player rankings (tierlists), joining events, and exploring the marketplace. We connect Nepal's Minecraft community through comprehensive server listings and competitive leaderboards.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        To provide a centralized platform where Minecraft servers gain visibility, players discover rankings and tierlists, participate in events, and access a thriving marketplace. We make it easier for everyone to find servers, track their progress, and connect with Nepal's gaming community.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">What We Offer</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { title: 'Server Listings', desc: 'Browse curated Minecraft servers with detailed information, player counts, and real-time status updates.' },
                            { title: 'Player Rankings', desc: 'View comprehensive tierlists and leaderboards across multiple gamemodes. Track your progress and climb the ranks.' },
                            { title: 'Events & Tournaments', desc: 'Participate in community events, tournaments, and special activities hosted across various servers.' },
                            { title: 'Professional Services', desc: 'Get custom Minecraft servers, professional websites, and Discord bots built by our expert development team.' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-gray-50 dark:bg-dark-navy-secondary rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-6"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="text-lg font-bold text-mahogany-red-2 dark:text-mahogany-red mb-2">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="bg-mahogany-red-2/10 dark:bg-mahogany-red/10 border border-mahogany-red-2/20 dark:border-mahogany-red/20 rounded-lg p-8"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Join Us Today</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        Whether you're looking to discover new servers, check player rankings, participate in events, or explore the marketplace, MineNepal has everything you need. Join Nepal's fastest-growing Minecraft platform today!
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
