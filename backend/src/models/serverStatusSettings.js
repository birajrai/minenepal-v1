const mongoose = require('mongoose');

const serverStatusSettingsSchema = new mongoose.Schema({
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true, unique: true },
});

const ServerStatusSettings = mongoose.model('ServerStatusSettings', serverStatusSettingsSchema);

module.exports = ServerStatusSettings;
