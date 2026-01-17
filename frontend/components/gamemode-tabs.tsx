'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface GamemodeTabsProps {
  gamemodes: string[];
  onSelect: (gamemode: string) => void;
  children: (activeGamemode: string) => React.ReactNode;
}

export function GamemodeTabs({
  gamemodes,
  onSelect,
  children,
}: GamemodeTabsProps) {
  const [activeGamemode, setActiveGamemode] = useState(gamemodes[0]);

  const handleSelect = (gamemode: string) => {
    setActiveGamemode(gamemode);
    onSelect(gamemode);
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {gamemodes.map((gamemode) => (
          <motion.button
            key={gamemode}
            onClick={() => handleSelect(gamemode)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeGamemode === gamemode
                ? 'bg-primary text-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            {gamemode}
          </motion.button>
        ))}
      </div>
      <motion.div
        key={activeGamemode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children(activeGamemode)}
      </motion.div>
    </div>
  );
}
