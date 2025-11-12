// Bot API Server - Stellt Bot-Daten für Interface bereit
const express = require('express');
const app = express();

let botClient = null;

function startBotAPI(client) {
    botClient = client;
    
    app.use(express.json());
    
    // Health Check
    app.get('/api/health', (req, res) => {
        res.json({ 
            status: 'online',
            user: botClient.user.tag,
            guilds: botClient.guilds.cache.size
        });
    });
    
    // Get Guild Data
    app.get('/api/guilds/:guildId', async (req, res) => {
        try {
            const { guildId } = req.params;
            const guild = await botClient.guilds.fetch(guildId);
            
            if (!guild) {
                return res.status(404).json({ error: 'Guild nicht gefunden' });
            }
            
            // Hole Channels
            const channels = guild.channels.cache
                .filter(c => c.type === 0) // Text channels
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    position: c.position
                }))
                .sort((a, b) => a.position - b.position);
            
            // Hole Kategorien
            const categories = guild.channels.cache
                .filter(c => c.type === 4) // Category channels
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    position: c.position
                }))
                .sort((a, b) => a.position - b.position);
            
            // Hole Rollen
            const roles = guild.roles.cache
                .filter(r => r.id !== guild.id) // Keine @everyone
                .map(r => ({
                    id: r.id,
                    name: r.name,
                    color: r.hexColor,
                    position: r.position
                }))
                .sort((a, b) => b.position - a.position);
            
            res.json({
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                memberCount: guild.memberCount,
                channels,
                categories,
                roles
            });
        } catch (error) {
            console.error('Fehler beim Abrufen von Guild-Daten:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    // Send Test Welcome Message
    app.post('/api/guilds/:guildId/test-welcome', async (req, res) => {
        try {
            const { guildId } = req.params;
            const { channelId, userId, customMessage } = req.body;
            
            const guild = await botClient.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            const member = await guild.members.fetch(userId);
            
            if (!channel || channel.type !== 0) {
                return res.status(400).json({ error: 'Ungültiger Channel' });
            }
            
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🎉 Test-Willkommensnachricht')
                .setDescription(customMessage || `Willkommen ${member} auf **${guild.name}**!`)
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: 'Dies ist eine Test-Nachricht vom Dashboard' })
                .setTimestamp();
            
            await channel.send({ embeds: [embed] });
            res.json({ success: true, message: 'Test-Nachricht gesendet' });
        } catch (error) {
            console.error('Fehler beim Senden der Test-Nachricht:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    // Get all guilds (for dropdown)
    app.get('/api/guilds', (req, res) => {
        try {
            const guilds = botClient.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                icon: g.icon,
                memberCount: g.memberCount
            }));
            res.json(guilds);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Get Tickets for a guild with user names
    app.get('/api/guilds/:guildId/tickets', async (req, res) => {
        try {
            const { guildId } = req.params;
            const Ticket = require('./models/Ticket');
            
            const tickets = Ticket.find({ guildId }) || [];
            const guild = await botClient.guilds.fetch(guildId);
            
            // Enriche Tickets mit User-Namen
            const enrichedTickets = await Promise.all(
                tickets.map(async (ticket) => {
                    try {
                        const user = await botClient.users.fetch(ticket.userId);
                        ticket.userName = user.username;
                        
                        if (ticket.claimedBy) {
                            const claimer = await botClient.users.fetch(ticket.claimedBy);
                            ticket.claimerName = claimer.username;
                        }
                    } catch (error) {
                        // User nicht gefunden, verwende ID
                        ticket.userName = ticket.userId;
                    }
                    return ticket;
                })
            );
            
            res.json(enrichedTickets);
        } catch (error) {
            console.error('Fehler beim Abrufen von Tickets:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    // Send Announcement
    app.post('/api/guilds/:guildId/announcement', async (req, res) => {
        try {
            const { guildId } = req.params;
            const { channels, title, message, mention, useEmbed } = req.body;
            
            const guild = await botClient.guilds.fetch(guildId);
            const { EmbedBuilder } = require('discord.js');
            
            for (const channelId of channels) {
                try {
                    const channel = await guild.channels.fetch(channelId);
                    if (!channel || channel.type !== 0) continue;
                    
                    let content = '';
                    if (mention) {
                        if (mention === '@everyone') {
                            content = '@everyone';
                        } else if (mention === '@here') {
                            content = '@here';
                        } else {
                            content = `<@&${mention}>`;
                        }
                    }
                    
                    if (useEmbed) {
                        const embed = new EmbedBuilder()
                            .setTitle(title || '📢 Ankündigung')
                            .setDescription(message)
                            .setColor('#5865F2')
                            .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                            .setTimestamp();
                        
                        await channel.send({ content, embeds: [embed] });
                    } else {
                        const fullMessage = title ? `**${title}**\n\n${message}` : message;
                        await channel.send(content ? `${content}\n\n${fullMessage}` : fullMessage);
                    }
                } catch (error) {
                    console.error(`Fehler beim Senden in Channel ${channelId}:`, error);
                }
            }
            
            res.json({ success: true });
        } catch (error) {
            console.error('Fehler beim Senden der Ankündigung:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    const PORT = process.env.BOT_API_PORT || 3001;
    app.listen(PORT, () => {
        console.log(`✅ Bot API läuft auf Port ${PORT}`);
    });
}

module.exports = { startBotAPI };
