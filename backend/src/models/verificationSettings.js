const mongoose = require('mongoose');

const verificationSettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
});

const VerificationSettings = mongoose.model('VerificationSettings', verificationSettingsSchema);

module.exports = VerificationSettings;
