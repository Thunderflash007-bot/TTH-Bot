const User = require('../models/User');
const CustomCommand = require('../models/CustomCommand');
const GlobalSettings = require('../models/GlobalSettings');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const cooldowns = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Custom Commands prüfen
        if (message.content.startsWith('!')) {
            // Feature Check
            if (!GlobalSettings.isFeatureEnabled('customCommands')) {
                return;
            }
            
            const args = message.content.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            
            try {
                const customCommand = CustomCommand.findOne({ 
                    guildId: message.guild.id, 
                    name: commandName,
                    enabled: true 
                });
                
                if (customCommand) {
                    // Variablen ersetzen
                    let response = customCommand.response;
                    
                    // Basis-Variablen
                    response = response.replace(/{user}/g, message.author.username);
                    response = response.replace(/{user\.tag}/g, message.author.tag);
                    response = response.replace(/{user\.id}/g, message.author.id);
                    response = response.replace(/{mention}/g, `<@${message.author.id}>`);
                    response = response.replace(/{server}/g, message.guild.name);
                    response = response.replace(/{server\.id}/g, message.guild.id);
                    response = response.replace(/{members}/g, message.guild.memberCount);
                    response = response.replace(/{channel}/g, message.channel.name);
                    response = response.replace(/{channel\.mention}/g, `<#${message.channel.id}>`);
                    
                    // Argumente
                    response = response.replace(/{args}/g, args.join(' ') || 'keine');
                    response = response.replace(/{args\.0}/g, args[0] || '');
                    response = response.replace(/{args\.1}/g, args[1] || '');
                    response = response.replace(/{args\.2}/g, args[2] || '');
                    
                    // Datum/Zeit
                    const now = new Date();
                    response = response.replace(/{date}/g, now.toLocaleDateString('de-DE'));
                    response = response.replace(/{time}/g, now.toLocaleTimeString('de-DE'));
                    
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
                    
                    return;
                }
            } catch (error) {
                console.error('❌ Fehler bei Custom Command:', error);
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
