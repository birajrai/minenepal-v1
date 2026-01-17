'use client';

import { motion } from 'framer-motion';

export default function TermsClientPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-dark-navy">
            <div className="max-w-4xl mx-auto px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            By accessing and using the MineNepal website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Use License</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            Permission is granted to temporarily download one copy of the materials (information or software) on MineNepal's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose or for any public display</li>
                            <li>Attempt to decompile or reverse engineer any software contained on MineNepal</li>
                            <li>Remove any copyright or other proprietary notations from the materials</li>
                            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Disclaimer</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            The materials on MineNepal's website are provided on an 'as is' basis. MineNepal makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Limitations</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            In no event shall MineNepal or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MineNepal's website, even if MineNepal or a MineNepal authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Accuracy of Materials</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            The materials appearing on MineNepal's website could include technical, typographical, or photographic errors. MineNepal does not warrant that any of the materials on the website are accurate, complete, or current. MineNepal may make changes to the materials contained on its website at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. User Conduct</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Users agree not to post, transmit, or distribute any unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable material. Users further agree not to disrupt the normal flow of dialogue within MineNepal's website or servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Modifications</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            MineNepal may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Contact Information</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            If you have any questions about these Terms of Service, please contact us at contact@minenepal.xyz.
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
