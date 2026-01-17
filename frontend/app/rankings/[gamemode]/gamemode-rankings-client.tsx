"use client";

import { RankingsView } from "@/components/rankings-view";
import { gamemodes as allGamemodes } from "@/utils/gamemodes-data";

interface GamemodeRankingsClientProps {
    gamemode: string;
}

export default function GamemodeRankingsClient({ gamemode }: GamemodeRankingsClientProps) {
    const getCorrectlyCasedGamemode = (gm: string) => {
        const found = allGamemodes.find(
            (g) => g.toLowerCase() === gm.toLowerCase()
        );
        return found || gm;
    };

    const initialGamemode = getCorrectlyCasedGamemode(gamemode);

    return <RankingsView initialGamemode={initialGamemode} showExtendedStats={false} />;
}
