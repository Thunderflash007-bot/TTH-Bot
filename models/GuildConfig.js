const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '!' },
    
    // Ticket System
    ticketCategoryId: String,
    applicationChannelId: String,
    
    // Welcome/Leave
    welcomeChannelId: String,
    welcomeMessage: String,
    leaveChannelId: String,
    leaveMessage: String,
    
    // Logging
    logChannelId: String,
    
    // Moderation
    muteRoleId: String,
    
    // Leveling
    levelUpMessage: { type: Boolean, default: true },
    levelUpChannelId: String,
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
