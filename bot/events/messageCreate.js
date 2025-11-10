const User = require('../models/User');
const config = require('../config.json');

const cooldowns = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // XP System
        const cooldownKey = `${message.author.id}_${message.guild.id}`;
        const now = Date.now();
        
        if (!cooldowns.has(cooldownKey) || now - cooldowns.get(cooldownKey) >= config.xp.cooldown) {
            const xpGain = Math.floor(Math.random() * (config.xp.maxPerMessage - config.xp.minPerMessage + 1)) + config.xp.minPerMessage;
            
            let userData = await User.findOne({ userId: message.author.id, guildId: message.guild.id });
            
            if (!userData) {
                userData = {
                    userId: message.author.id,
                    guildId: message.guild.id,
                    xp: 0,
                    level: 0
                };
            }

            const oldLevel = userData.level;
            userData.xp += xpGain;
            
            // Level berechnen
            const newLevel = Math.floor(0.1 * Math.sqrt(userData.xp));
            
            if (newLevel > oldLevel) {
                userData.level = newLevel;
                message.channel.send(`🎉 ${message.author}, du bist jetzt Level **${newLevel}**!`);
            }

            await User.save(userData);
            cooldowns.set(cooldownKey, now);
        }
    }
};
