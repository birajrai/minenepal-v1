import mongoose from 'mongoose';

const userInfoSchema = new mongoose.Schema({
    discordId: { type: String, unique: true, required: true, index: true },
    minecraftName: { type: String, required: false, default: 'N/A' },
    minecraftUUID: { type: String, required: false },
    province: { type: String, required: false, default: 'N/A' },
    city: { type: String, required: false, default: 'N/A' },
    points: { type: Map, of: Number, default: {} },
    ranks: { type: Map, of: new mongoose.Schema({ current: { type: String, default: 'Unranked' }, previous: { type: String, default: 'N/A' } }), default: {} },
    lastVoted: { type: Map, of: Date, default: {} }
}, { timestamps: true });

const UserInfo = mongoose.models.UserInfo || mongoose.model('UserInfo', userInfoSchema);

export default UserInfo;
