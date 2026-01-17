'use client';

import { motion } from 'framer-motion';

export default function PrivacyContent() {
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    Privacy Policy
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        1. Introduction
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        MineNepal ("we", "us", "our") operates the MineNepal website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        2. Information Collection and Use
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        We collect several different types of information for various purposes to provide and improve our Service to you.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Types of Data Collected:
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                                <li>Personal Data: Name, email address, Minecraft username</li>
                                <li>Usage Data: Browser type, pages visited, time spent</li>
                                <li>Cookies: Information stored on your device</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        3. Use of Data
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        MineNepal uses the collected data for various purposes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service</li>
                        <li>To provide customer care and support</li>
                        <li>To gather analysis or valuable information about how our Service is used</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        4. Security of Data
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        5. Changes to This Privacy Policy
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        6. Contact Us
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at contact@minenepal.xyz.
                    </p>
                </section>
            </motion.div>
        </>
    );
}
