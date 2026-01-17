'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  children,
}: HeroSectionProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setIsDark(isDarkNow);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center overflow-hidden px-6 py-20 sm:py-28 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-gray-900'
          : 'bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50'
      }`}
    >
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        {isDark ? (
          <>
            <motion.div 
              animate={{ 
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300/25 rounded-full blur-3xl opacity-40"
            />
            <motion.div 
              animate={{ 
                x: [0, -30, 0],
                y: [0, 20, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl opacity-40"
            />
            <motion.div 
              animate={{ 
                x: [0, 20, 0],
                y: [0, -15, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-1/3 right-1/3 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl opacity-30"
            />
          </>
        ) : (
          <>
            <motion.div 
              animate={{ 
                x: [0, 25, 0],
                y: [0, -15, 0],
                scale: [1, 1.08, 1]
              }}
              transition={{ 
                duration: 9, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-0 left-1/4 w-96 h-96 bg-amber-300/35 rounded-full blur-3xl opacity-50"
            />
            <motion.div 
              animate={{ 
                x: [0, -25, 0],
                y: [0, 15, 0],
                scale: [1, 1.12, 1]
              }}
              transition={{ 
                duration: 11, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300/35 rounded-full blur-3xl opacity-50"
            />
          </>
        )}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight ${isDark
              ? 'text-white drop-shadow-2xl'
              : 'text-gray-900 drop-shadow-lg'
            }`}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className={`text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'
              }`}
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="pt-4 flex w-full max-w-xl mx-auto flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
