import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
    username: { type: String, required: true },
    server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
    serverSlug: { type: String, required: true }, // Denormalized for easier querying
    timestamp: { type: Date, default: Date.now }
});

voteSchema.index({ serverSlug: 1, timestamp: -1 });
voteSchema.index({ username: 1 });

const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);

export default Vote;
