const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
    gamemode: { type: String, required: true, unique: true },
    usersInWaitlist: { type: [String], default: [] },
    testerID: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

module.exports = Waitlist;
