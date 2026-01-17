"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-dark-navy-secondary border border-gray-200 dark:border-slate-700" />
        );
    }

    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-dark-navy-secondary shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-blue-600/30 dark:hover:border-blue-400/30"
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="moon"
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                        className="absolute"
                    >
                        <FontAwesomeIcon
                            icon={faMoon}
                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ y: 20, opacity: 0, rotate: 90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                        className="absolute"
                    >
                        <FontAwesomeIcon
                            icon={faSun}
                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Animated background glow */}
            <motion.div
                className="absolute inset-0 rounded-full bg-blue-600/10 dark:bg-blue-400/10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isDark ? 1 : 0, opacity: isDark ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}
