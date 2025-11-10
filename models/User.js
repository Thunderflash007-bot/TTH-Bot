const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    warnings: [{
        reason: String,
        moderatorId: String,
        date: { type: Date, default: Date.now }
    }],
    lastDaily: Date,
    createdAt: { type: Date, default: Date.now }
});

userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
