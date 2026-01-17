const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    ip: { type: String, required: true },
    port: { type: Number, required: true },
    display_address: { type: String }, // User-friendly address to display (e.g., "play.example.com")
    description: { type: String, required: true },
    content: { type: String, required: true },
    vote: { type: Number, required: true },
    voteCooldownMs: { type: Number, default: 12 * 60 * 60 * 1000 }, // Default 12 hours
    gamemodes: [{ type: String }],
    server_type: { type: String, required: true },
    bedrock_ip: { type: String },
    bedrock_port: { type: Number },
    image: { type: String },
    server_icon: { type: String },
    disabled: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    website: { type: String },
    discord: { type: String },
    youtube: { type: String },
    secret: { type: String, unique: true },
    votingRewardEnabled: { type: Boolean, default: false },
    // Server status fields (populated by background sync)
    online: { type: Boolean, default: false },
    players: { type: Number, default: null },
    maxPlayers: { type: Number, default: null },
    lastStatusSync: { type: Date, default: null }
}, { timestamps: true });

// Add indexes to speed up sorting and queries
// Note: slug already has unique index from schema definition
serverSchema.index({ vote: -1 });
serverSchema.index({ featured: -1, vote: -1 });
serverSchema.index({ online: -1, players: -1 }); // For status sorting
serverSchema.index({ lastStatusSync: 1 }); // For sync tracking

const Server = mongoose.model('Server', serverSchema);

module.exports = Server;
