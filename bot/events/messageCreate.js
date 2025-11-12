const User = require('../models/User');
const CustomCommand = require('../models/CustomCommand');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const cooldowns = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Custom Commands prüfen
        if (message.content.startsWith('!')) {
            const args = message.content.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            
            const customCommand = CustomCommand.findOne({ 
                guildId: message.guild.id, 
                name: commandName,
                enabled: true 
            });
            
            if (customCommand) {
                try {
                    // Variablen ersetzen
                    let response = customCommand.response;
                    response = response.replace(/{user}/g, message.author.username);
                    response = response.replace(/{mention}/g, `${message.author}`);
                    response = response.replace(/{server}/g, message.guild.name);
                    response = response.replace(/{members}/g, message.guild.memberCount);
                    
                    if (customCommand.useEmbed) {
                        const embed = new EmbedBuilder()
                            .setDescription(response)
                            .setColor(customCommand.embedColor || '#5865F2')
                            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
                            .setTimestamp();
                        
                        await message.channel.send({ embeds: [embed] });
                    } else {
                        await message.channel.send(response);
                    }
                    
                    // Zähler erhöhen
                    CustomCommand.incrementUses(customCommand._id);
                    
                    // Befehlsnachricht löschen
                    if (customCommand.deleteInvoke) {
                        await message.delete().catch(() => {});
                    }
                } catch (error) {
                    console.error('Fehler bei Custom Command:', error);
                }
                return;
            }
        }

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
                
                // Auto-Role bei Level-Up prüfen
                if (client.autoRoleHandler) {
                    await client.autoRoleHandler.handleLevelUp(message.member, newLevel);
                }
            }

            await User.save(userData);
            cooldowns.set(cooldownKey, now);
        }
    }
};
