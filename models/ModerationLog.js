const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    moderatorId: { type: String, required: true },
    action: { type: String, enum: ['ban', 'kick', 'timeout', 'warn', 'unban'], required: true },
    reason: String,
    duration: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ModerationLog', moderationLogSchema);
