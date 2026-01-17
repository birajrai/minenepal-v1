"use client";

import { RankingsView } from "@/components/rankings-view";

export default function RankingsClientPage() {
    return <RankingsView initialGamemode="Overall" showExtendedStats={true} />;
}
