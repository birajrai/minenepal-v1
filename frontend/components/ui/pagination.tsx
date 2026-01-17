'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 mt-8"
        >
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            {(() => {
                const maxVisible = Math.min(totalPages, 5);
                let startPage = Math.max(1, currentPage - 2);
                if (startPage + maxVisible - 1 > totalPages) {
                    startPage = Math.max(1, totalPages - maxVisible + 1);
                }
                const pages = Array.from({ length: maxVisible }, (_, i) => startPage + i);
                
                return pages.map((page) => (
                    <motion.button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                ? "bg-mahogany-red-2 text-white"
                                : "bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-neutral-600"
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {page}
                    </motion.button>
                ));
            })()}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </motion.div>
    );
}
