'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-dark-navy-secondary border-t border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-mahogany-red-2 dark:text-mahogany-red mb-4">MineNepal</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Discover Minecraft servers, player rankings (tierlist), events, and marketplace for Nepal's gaming community.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">About Us</Link></li>
              <li><Link href="/servers" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Servers</Link></li>
              <li><Link href="/rankings" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Rankings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="https://www.facebook.com/minenepal.official/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Facebook</Link></li>
              <li><Link href="https://discord.gg/SfQVUXUjD6" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Discord</Link></li>
              <li><Link href="https://www.youtube.com/@minenepal.official" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">YouTube</Link></li>
              <li><Link href="https://www.minenepal.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-mahogany-red-2 dark:hover:text-mahogany-red transition-colors">Official Website</Link></li>
            </ul>
          </div>
        </div>
        <div className="h-px bg-linear-to-r from-transparent via-gray-300 dark:via-slate-700 to-transparent mb-8" />
        <div className="text-center">
          <p className="text-gray-600 dark:text-white text-sm">&copy; {currentYear} MineNepal. All rights reserved. Built with passion for the Minecraft community.</p>
        </div>
      </div>
    </footer>
  );
}