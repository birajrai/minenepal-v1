export interface LeaderboardRow {
    rank: number;
    id: string;
    name: string;
    slug: string;
    points: number;
    province: string;
    city: string;
    gamemodeRanks: { [key: string]: { current: string; previous: string } };
}

export interface Player {
    // Basic Info
    discordId?: string;
    minecraftName: string;
    minecraftUUID?: string;
    
    // Location
    province?: string;
    city?: string;
    
    // Stats
    totalPoints: number;
    overallPoints?: number;
    gamemodePoints?: Record<string, number>;
    points?: Record<string, number>;
    ranks: Record<string, { current: string; previous: string }>;
    
    // Metadata
    createdAt?: string;
    updatedAt?: string;
}

export interface Server {
    // Basic Info
    name: string;
    slug: string;
    description: string;
    content?: string;
    
    // Connection Info
    display_address?: string;
    ip: string;
    port: number;
    bedrock_ip?: string | null;
    bedrock_port?: number | null;
    server_type?: string;
    
    // Status Info (from DB, synced every 5 min)
    online?: boolean;
    status?: string; // "online" | "offline"
    players?: { online: number; max: number };
    lastStatusSync?: string;
    
    // Media & Links
    image?: string;
    server_icon?: string;
    website?: string;
    discord?: string;
    youtube?: string;
    
    // Game Info
    gamemodes: string[];
    
    // Metadata
    vote?: number;
    voteCooldownMs?: number;
    featured?: boolean;
    disabled?: boolean;
    votingRewardEnabled?: boolean;
    secret?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp?: string;
}
