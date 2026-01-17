import mongoose from 'mongoose';

const voteCooldownSchema = new mongoose.Schema({
    username: { type: String, required: true },
    serverSlug: { type: String, required: true },
    lastVotedAt: { type: Number, required: true }, // timestamp in milliseconds
});

// Unique index: one document per username+server combination
voteCooldownSchema.index({ username: 1, serverSlug: 1 }, { unique: true });

const VoteCooldown = mongoose.models.VoteCooldown || mongoose.model('VoteCooldown', voteCooldownSchema);

export default VoteCooldown;
