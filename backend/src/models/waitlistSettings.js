const mongoose = require('mongoose');

const waitlistSettingsSchema = new mongoose.Schema({
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true, unique: true },
});

const WaitlistSettings = mongoose.model('WaitlistSettings', waitlistSettingsSchema);

module.exports = WaitlistSettings;
