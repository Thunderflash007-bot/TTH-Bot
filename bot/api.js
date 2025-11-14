// Bot API Server - Stellt Bot-Daten für Interface bereit
const express = require('express');
const app = express();

let botClient = null;

function startBotAPI(client) {
    botClient = client;
    
    app.use(express.json());
    
    // Health Check
    app.get('/api/health', (req, res) => {
        const uptimeSeconds = Math.floor(process.uptime());
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeFormatted = `${hours}h ${minutes}m`;
        
        res.json({ 
            status: 'online',
            user: botClient.user.tag,
            guilds: botClient.guilds.cache.size,
            uptime: uptimeFormatted
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
            res.json({ guilds });
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

    // ADMIN ROUTES (nur für Admin-Panel)
    
    // Wartungsankündigung an alle Server
    app.post('/api/admin/maintenance', async (req, res) => {
        try {
            const { title, message, startTime, endTime, severity } = req.body;
            const GuildConfig = require('./models/GuildConfig');
            const { EmbedBuilder } = require('discord.js');
            
            let sentTo = 0;
            let failed = 0;
            
            // Farben je nach Schweregrad
            const colors = {
                info: '#5865F2',
                warning: '#FEE75C', 
                critical: '#ED4245'
            };
            
            const icons = {
                info: '🔧',
                warning: '⚠️',
                critical: '🚨'
            };
            
            // Alle Guilds durchgehen
            for (const [guildId, guild] of botClient.guilds.cache) {
                try {
                    const config = GuildConfig.findOne({ guildId });
                    
                    // Log-Channel aus Config holen
                    if (!config || !config.logChannelId) {
                        failed++;
                        continue;
                    }
                    
                    const logChannel = await guild.channels.fetch(config.logChannelId);
                    if (!logChannel || logChannel.type !== 0) {
                        failed++;
                        continue;
                    }
                    
                    const embed = new EmbedBuilder()
                        .setTitle(`${icons[severity]} ${title}`)
                        .setDescription(message)
                        .setColor(colors[severity])
                        .addFields(
                            { name: '🕐 Startzeit', value: new Date(startTime).toLocaleString('de-DE'), inline: true },
                            { name: '🕐 Geschätzte Endzeit', value: new Date(endTime).toLocaleString('de-DE'), inline: true },
                            { name: '⚡ Status', value: severity === 'critical' ? 'Bot kann offline sein' : 'Bot bleibt online', inline: false }
                        )
                        .setFooter({ text: 'TTH-Bot Wartungsankündigung', iconURL: botClient.user.displayAvatarURL() })
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [embed] });
                    sentTo++;
                } catch (error) {
                    console.error(`Fehler beim Senden an Guild ${guild.name}:`, error.message);
                    failed++;
                }
            }
            
            res.json({ success: true, sentTo, failed });
        } catch (error) {
            console.error('Fehler bei Wartungsankündigung:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    // Global Broadcast
    app.post('/api/admin/broadcast', async (req, res) => {
        try {
            const { message, channelType } = req.body;
            const GuildConfig = require('./models/GuildConfig');
            
            let sentTo = 0;
            
            for (const [guildId, guild] of botClient.guilds.cache) {
                try {
                    const config = GuildConfig.findOne({ guildId });
                    let targetChannels = [];
                    
                    // Channel-Typ bestimmen
                    if (channelType === 'log' && config?.logChannelId) {
                        targetChannels.push(config.logChannelId);
                    } else if (channelType === 'general' && config?.welcomeChannelId) {
                        targetChannels.push(config.welcomeChannelId);
                    } else if (channelType === 'all') {
                        if (config?.logChannelId) targetChannels.push(config.logChannelId);
                        if (config?.welcomeChannelId) targetChannels.push(config.welcomeChannelId);
                    }
                    
                    // Nachricht senden
                    for (const channelId of targetChannels) {
                        const channel = await guild.channels.fetch(channelId);
                        if (channel && channel.type === 0) {
                            await channel.send(message);
                            sentTo++;
                        }
                    }
                } catch (error) {
                    console.error(`Fehler beim Broadcast an ${guild.name}:`, error.message);
                }
            }
            
            res.json({ success: true, sentTo });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Bot Statistiken
    app.get('/api/admin/stats', async (req, res) => {
        try {
            const Ticket = require('./models/Ticket');
            const User = require('./models/User');
            const ScheduledMessage = require('./models/ScheduledMessage');
            const AutoRole = require('./models/AutoRole');
            const CustomCommand = require('./models/CustomCommand');
            
            const stats = {
                guilds: botClient.guilds.cache.size,
                totalMembers: botClient.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                channels: botClient.channels.cache.size,
                totalTickets: Ticket.find({}).length,
                openTickets: Ticket.find({ status: 'open' }).length,
                totalUsers: User.find({}).length,
                scheduledMessages: ScheduledMessage.find({}).length,
                autoRoles: AutoRole.find({}).length,
                customCommands: CustomCommand.find({}).length,
                uptime: process.uptime()
            };
            
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Commands neu laden
    app.post('/api/admin/reload', async (req, res) => {
        try {
            // Commands neu laden
            botClient.commands.clear();
            const fs = require('fs');
            const path = require('path');
            
            const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
            let reloadedCount = 0;
            
            for (const folder of commandFolders) {
                const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder))
                    .filter(file => file.endsWith('.js'));
                
                for (const file of commandFiles) {
                    delete require.cache[require.resolve(`./commands/${folder}/${file}`)];
                    const command = require(`./commands/${folder}/${file}`);
                    botClient.commands.set(command.data.name, command);
                    reloadedCount++;
                }
            }
            
            res.json({ success: true, message: `${reloadedCount} Commands neu geladen` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Global Settings abrufen
    app.get('/api/admin/settings', async (req, res) => {
        try {
            const GlobalSettings = require('./models/GlobalSettings');
            const settings = GlobalSettings.getSettings();
            console.log('[API] Admin Settings abgerufen:', {
                maintenanceMode: settings.maintenanceMode,
                adminBypass: settings.adminBypass,
                featureCount: Object.keys(settings.features || {}).length
            });
            res.json(settings);
        } catch (error) {
            console.error('[API] Fehler beim Laden der Settings:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Wartungsmodus umschalten
    app.post('/api/admin/maintenance-mode', async (req, res) => {
        try {
            const { enabled, message, userId } = req.body;
            const GlobalSettings = require('./models/GlobalSettings');
            
            console.log('[API] ========== WARTUNGSMODUS UPDATE START ==========');
            console.log('[API] Request Body:', { enabled, message, userId });
            
            const beforeSettings = GlobalSettings.getSettings();
            console.log('[API] Status VOR Update:', beforeSettings.maintenanceMode);
            
            const result = GlobalSettings.setMaintenanceMode(enabled, message, userId);
            console.log('[API] Update Result:', result ? 'SUCCESS' : 'FAILED');
            
            const afterSettings = GlobalSettings.getSettings();
            console.log('[API] Status NACH Update:', afterSettings.maintenanceMode);
            console.log('[API] ========== WARTUNGSMODUS UPDATE ENDE ==========');
            
            // Bot-Status aktualisieren
            if (enabled) {
                await botClient.user.setPresence({
                    activities: [{ name: '🔧 Wartungsmodus', type: 0 }],
                    status: 'dnd'
                });
                console.log('[API] Bot-Status gesetzt: Wartungsmodus');
            } else {
                await botClient.user.setPresence({
                    activities: [{ name: '/help | TTH-Bot', type: 0 }],
                    status: 'online'
                });
                console.log('[API] Bot-Status gesetzt: Online');
            }
            
            res.json({ 
                success: true, 
                maintenanceMode: afterSettings.maintenanceMode,
                settings: afterSettings
            });
        } catch (error) {
            console.error('[API] FEHLER beim Wartungsmodus-Update:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Feature umschalten
    app.post('/api/admin/toggle-feature', async (req, res) => {
        try {
            const { feature, enabled, reason, userId } = req.body;
            const GlobalSettings = require('./models/GlobalSettings');
            
            GlobalSettings.updateFeature(feature, enabled, reason, userId);
            
            res.json({ success: true, feature, enabled });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Admin-Bypass verwalten
    app.post('/api/admin/bypass', async (req, res) => {
        try {
            const { userId, action } = req.body;
            const GlobalSettings = require('./models/GlobalSettings');
            
            if (action === 'add') {
                GlobalSettings.addAdminBypass(userId);
            } else if (action === 'remove') {
                GlobalSettings.removeAdminBypass(userId);
            }
            
            const settings = GlobalSettings.getSettings();
            res.json({ success: true, adminBypass: settings.adminBypass });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // User-Info abrufen (für Admin-Bypass-Liste)
    app.get('/api/user/:userId', async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await botClient.users.fetch(userId);
            
            res.json({
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                avatar: user.avatar,
                bot: user.bot
            });
        } catch (error) {
            res.status(404).json({ error: 'User nicht gefunden' });
        }
    });

    // Get Warnings für Dashboard
    app.get('/api/guilds/:guildId/warnings', async (req, res) => {
        try {
            const { guildId } = req.params;
            const Warning = require('./models/Warning');
            
            const warnings = Warning.find({ guildId, active: true });
            
            // Enriche mit User-Daten
            const enrichedWarnings = await Promise.all(
                warnings.map(async (warning) => {
                    try {
                        const user = await botClient.users.fetch(warning.userId);
                        const moderator = await botClient.users.fetch(warning.moderatorId);
                        
                        return {
                            ...warning,
                            userName: user.username,
                            userTag: user.tag,
                            userAvatar: user.displayAvatarURL(),
                            moderatorName: moderator.username,
                            moderatorTag: moderator.tag
                        };
                    } catch (error) {
                        return {
                            ...warning,
                            userName: 'Unknown User',
                            userTag: 'Unknown#0000',
                            moderatorName: 'Unknown Moderator',
                            moderatorTag: 'Unknown#0000'
                        };
                    }
                })
            );
            
            res.json(enrichedWarnings);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Remove Warning via Dashboard
    app.delete('/api/guilds/:guildId/warnings/:warnId', async (req, res) => {
        try {
            const { warnId } = req.params;
            const Warning = require('./models/Warning');
            
            const removed = Warning.remove(warnId);
            res.json({ success: removed });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Set Ticket Priority
    app.post('/api/guilds/:guildId/tickets/:ticketId/priority', async (req, res) => {
        try {
            const { ticketId } = req.params;
            const { priority } = req.body; // low, medium, high
            const Ticket = require('./models/Ticket');
            
            const ticket = Ticket.findOne({ id: ticketId });
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket nicht gefunden' });
            }
            
            ticket.priority = priority;
            Ticket.save(ticket);
            
            // Update Channel Name mit Priority Emoji
            const guild = await botClient.guilds.fetch(req.params.guildId);
            const channel = await guild.channels.fetch(ticket.channelId);
            
            const priorityEmojis = { low: '🟢', medium: '🟠', high: '🔴' };
            const emoji = priorityEmojis[priority] || '';
            
            const newName = `${emoji}ticket-${ticket.userId.slice(-4)}`;
            await channel.setName(newName);
            
            res.json({ success: true, priority });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Create Report
    app.post('/api/guilds/:guildId/reports', async (req, res) => {
        try {
            const { guildId } = req.params;
            const { type, targetId, reason, reporterId, evidence } = req.body;
            
            const fs = require('fs');
            const path = require('path');
            const reportsFile = path.join(__dirname, '../data/reports.json');
            
            let reports = [];
            if (fs.existsSync(reportsFile)) {
                reports = JSON.parse(fs.readFileSync(reportsFile, 'utf8'));
            }
            
            const report = {
                id: Date.now().toString(),
                guildId,
                type, // 'message' or 'user'
                targetId,
                reason,
                reporterId,
                evidence: evidence || null,
                status: 'open',
                timestamp: new Date().toISOString()
            };
            
            reports.push(report);
            fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2));
            
            res.json({ success: true, report });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get Reports
    app.get('/api/guilds/:guildId/reports', async (req, res) => {
        try {
            const { guildId } = req.params;
            const fs = require('fs');
            const path = require('path');
            const reportsFile = path.join(__dirname, '../data/reports.json');
            
            let reports = [];
            if (fs.existsSync(reportsFile)) {
                reports = JSON.parse(fs.readFileSync(reportsFile, 'utf8'));
            }
            
            const guildReports = reports.filter(r => r.guildId === guildId);
            
            // Enriche mit User-Daten
            const enrichedReports = await Promise.all(
                guildReports.map(async (report) => {
                    try {
                        const target = await botClient.users.fetch(report.targetId);
                        const reporter = await botClient.users.fetch(report.reporterId);
                        
                        return {
                            ...report,
                            targetName: target.username,
                            targetTag: target.tag,
                            reporterName: reporter.username,
                            reporterTag: reporter.tag
                        };
                    } catch (error) {
                        return report;
                    }
                })
            );
            
            res.json(enrichedReports);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Send Custom Embed
    app.post('/api/guilds/:guildId/embed', async (req, res) => {
        try {
            const { guildId } = req.params;
            const { channelId, embed } = req.body;
            
            const guild = await botClient.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            
            if (!channel || channel.type !== 0) {
                return res.status(400).json({ error: 'Ungültiger Channel' });
            }
            
            const { EmbedBuilder } = require('discord.js');
            const discordEmbed = new EmbedBuilder()
                .setTitle(embed.title || null)
                .setDescription(embed.description || null)
                .setColor(embed.color || '#5865F2')
                .setTimestamp(embed.timestamp ? new Date() : null);
            
            if (embed.author) discordEmbed.setAuthor({ name: embed.author });
            if (embed.footer) discordEmbed.setFooter({ text: embed.footer });
            if (embed.url) discordEmbed.setURL(embed.url);
            
            if (embed.fields && Array.isArray(embed.fields)) {
                embed.fields.forEach(field => {
                    discordEmbed.addFields({
                        name: field.name || 'Field',
                        value: field.value || 'Value',
                        inline: field.inline || false
                    });
                });
            }
            
            await channel.send({ embeds: [discordEmbed] });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Get Kummerkasten Entries
    app.get('/api/guilds/:guildId/kummerkasten', async (req, res) => {
        try {
            const { guildId } = req.params;
            const Kummerkasten = require('./models/Kummerkasten');
            
            const entries = Kummerkasten.find({ guildId });
            res.json(entries);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Get Nickname Prefixes
    app.get('/api/guilds/:guildId/prefixes', async (req, res) => {
        try {
            const { guildId } = req.params;
            const GuildConfig = require('./models/GuildConfig');
            
            const config = GuildConfig.findOne({ guildId });
            res.json(config?.nicknamePrefixes || []);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Global Settings - Get
    app.get('/api/admin/global-settings', async (req, res) => {
        try {
            const GlobalSettings = require('./models/GlobalSettings');
            const settings = GlobalSettings.getSettings();
            res.json(settings);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Global Settings - Update Feature
    app.patch('/api/admin/global-settings/feature/:featureName', async (req, res) => {
        try {
            const { featureName } = req.params;
            const { enabled, reason, userId } = req.body;
            
            const GlobalSettings = require('./models/GlobalSettings');
            const updated = GlobalSettings.updateFeature(featureName, enabled, reason, userId);
            
            if (!updated) {
                return res.status(404).json({ error: 'Feature nicht gefunden' });
            }
            
            res.json({ success: true, settings: GlobalSettings.getSettings() });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Global Settings - Maintenance Mode
    app.post('/api/admin/maintenance', async (req, res) => {
        try {
            const { enabled, message, userId } = req.body;
            
            const GlobalSettings = require('./models/GlobalSettings');
            GlobalSettings.setMaintenanceMode(enabled, message, userId);
            
            res.json({ success: true, settings: GlobalSettings.getSettings() });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Bug Reports - Get all
    app.get('/api/admin/bug-reports', async (req, res) => {
        try {
            const BugReport = require('./models/BugReport');
            const reports = BugReport.findAll();
            
            // Sortiere nach Datum (neueste zuerst)
            reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            res.json(reports);
        } catch (error) {
            console.error('API Error - Bug Reports:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Bug Reports - Update Priority
    app.patch('/api/admin/bug-reports/:id/priority', async (req, res) => {
        try {
            const { id } = req.params;
            const { priority } = req.body;
            
            const BugReport = require('./models/BugReport');
            const updated = BugReport.updatePriority(id, priority);
            
            if (updated) {
                res.json({ success: true, report: updated });
            } else {
                res.status(404).json({ error: 'Bug Report nicht gefunden' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Bug Reports - Update Status
    app.patch('/api/admin/bug-reports/:id/status', async (req, res) => {
        try {
            const { id } = req.params;
            const { status, note } = req.body;
            
            const BugReport = require('./models/BugReport');
            const updated = BugReport.updateStatus(id, status, note);
            
            if (updated) {
                res.json({ success: true, report: updated });
            } else {
                res.status(404).json({ error: 'Bug Report nicht gefunden' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Bug Reports - Add Note
    app.post('/api/admin/bug-reports/:id/note', async (req, res) => {
        try {
            const { id } = req.params;
            const { note } = req.body;
            
            const BugReport = require('./models/BugReport');
            const updated = BugReport.addNote(id, note);
            
            if (updated) {
                res.json({ success: true, report: updated });
            } else {
                res.status(404).json({ error: 'Bug Report nicht gefunden' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Bug Reports - Delete
    app.delete('/api/admin/bug-reports/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            const BugReport = require('./models/BugReport');
            const deleted = BugReport.delete(id);
            
            if (deleted) {
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Bug Report nicht gefunden' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // === NEUE ADMIN API ENDPUNKTE ===
    
    // Bot neustarten
    app.post('/api/admin/restart', async (req, res) => {
        try {
            console.log('🔄 Admin requested bot restart');
            
            // Check if running under PM2
            if (process.env.PM2_HOME || process.env.pm_id !== undefined) {
                console.log('✅ Running under PM2, performing restart...');
                res.json({ success: true, message: 'Bot wird neu gestartet...' });
                
                setTimeout(() => {
                    console.log('🔄 Initiating PM2 restart...');
                    process.exit(0); // PM2 will auto-restart
                }, 1000);
            } else {
                // Not running under PM2 - use restart script
                console.log('⚠️ Not running under PM2, using restart script...');
                const { spawn } = require('child_process');
                const path = require('path');
                
                res.json({ success: true, message: 'Bot wird neu gestartet...' });
                
                setTimeout(() => {
                    console.log('🔄 Executing restart script...');
                    const scriptPath = path.join(__dirname, '../restart.sh');
                    
                    // Make script executable
                    const { execSync } = require('child_process');
                    try {
                        execSync(`chmod +x "${scriptPath}"`);
                    } catch (err) {
                        console.log('⚠️ Could not chmod restart script:', err.message);
                    }
                    
                    // Spawn detached process to run restart script
                    const child = spawn('bash', [scriptPath], {
                        detached: true,
                        stdio: 'ignore'
                    });
                    child.unref();
                    
                    console.log('✅ Restart script spawned, exiting...');
                    process.exit(0);
                }, 1000);
            }
        } catch (error) {
            console.error('❌ Restart failed:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message,
                message: 'Restart fehlgeschlagen. Bitte PM2 verwenden: npm run pm2:start'
            });
        }
    });
    
    // Cache leeren
    app.post('/api/admin/clear-cache', async (req, res) => {
        try {
            console.log('🧹 Clearing cache...');
            
            // Lade alle Database-Instanzen neu
            const Database = require('./utils/database');
            const GlobalSettings = require('./models/GlobalSettings');
            
            GlobalSettings.db.reload();
            
            res.json({ success: true, message: 'Cache geleert' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Commands synchronisieren
    app.post('/api/admin/sync-commands', async (req, res) => {
        try {
            console.log('🔄 Syncing commands...');
            
            if (!client || !client.application) {
                return res.status(503).json({ error: 'Bot nicht bereit' });
            }
            
            const commands = [];
            const fs = require('fs');
            const path = require('path');
            const commandsPath = path.join(__dirname, 'commands');
            
            // Lade alle Commands
            const loadCommands = (dir) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        loadCommands(fullPath);
                    } else if (file.endsWith('.js')) {
                        try {
                            delete require.cache[require.resolve(fullPath)];
                            const command = require(fullPath);
                            if (command.data) {
                                commands.push(command.data.toJSON());
                            }
                        } catch (error) {
                            console.error(`Fehler beim Laden von ${file}:`, error);
                        }
                    }
                }
            };
            
            loadCommands(commandsPath);
            
            await client.application.commands.set(commands);
            console.log(`✅ ${commands.length} Commands synchronisiert`);
            
            res.json({ success: true, message: `${commands.length} Commands synchronisiert` });
        } catch (error) {
            console.error('Error syncing commands:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    // Bot Logs
    app.get('/api/admin/logs', async (req, res) => {
        try {
            const fs = require('fs');
            const path = require('path');
            const logsPath = path.join(__dirname, '../logs/bot.log');
            
            if (fs.existsSync(logsPath)) {
                const logs = fs.readFileSync(logsPath, 'utf8');
                const lines = logs.split('\n').slice(-100); // Letzte 100 Zeilen
                res.json({ success: true, logs: lines.join('\n') });
            } else {
                res.json({ success: true, logs: 'Keine Logs vorhanden' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // User suchen
    app.get('/api/admin/users/search', async (req, res) => {
        try {
            const query = req.query.q;
            
            if (!client || !client.isReady()) {
                return res.status(503).json({ error: 'Bot nicht bereit' });
            }
            
            let user = null;
            
            // Versuche als User-ID
            if (/^\d+$/.test(query)) {
                try {
                    user = await client.users.fetch(query);
                } catch (error) {
                    console.log('User nicht gefunden mit ID:', query);
                }
            }
            
            if (user) {
                res.json({
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        discriminator: user.discriminator,
                        bot: user.bot,
                        avatar: user.displayAvatarURL(),
                        createdTimestamp: user.createdTimestamp
                    }
                });
            } else {
                res.json({ success: false, message: 'User nicht gefunden' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Datenbank bereinigen
    app.post('/api/admin/cleanup', async (req, res) => {
        try {
            console.log('🧹 Cleaning up old data...');
            
            const Ticket = require('./models/Ticket');
            const Application = require('./models/Application');
            
            let removed = 0;
            
            // Lösche geschlossene Tickets älter als 30 Tage
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const tickets = Ticket.find({ status: 'closed' });
            for (const ticket of tickets) {
                if (new Date(ticket.closedAt) < thirtyDaysAgo) {
                    Ticket.deleteOne({ _id: ticket._id });
                    removed++;
                }
            }
            
            // Lösche abgelehnte Applications älter als 7 Tage
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const applications = Application.find({ status: 'rejected' });
            for (const app of applications) {
                if (new Date(app.createdAt) < sevenDaysAgo) {
                    Application.deleteOne({ _id: app._id });
                    removed++;
                }
            }
            
            res.json({ success: true, removed });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Globale Statistiken
    app.get('/api/admin/stats/global', async (req, res) => {
        try {
            if (!client || !client.isReady()) {
                return res.status(503).json({ error: 'Bot nicht bereit' });
            }
            
            const Ticket = require('./models/Ticket');
            const User = require('./models/User');
            
            const stats = {
                servers: client.guilds.cache.size,
                users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
                tickets: Ticket.count({}),
                commands: 0 // TODO: Command counter implementieren
            };
            
            res.json({ success: true, stats });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // User-Statistiken abrufen
    app.get('/api/admin/users/:userId/stats', async (req, res) => {
        try {
            const { userId } = req.params;
            
            if (!client || !client.isReady()) {
                return res.status(503).json({ error: 'Bot nicht bereit' });
            }
            
            // Hole User-Daten
            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return res.status(404).json({ error: 'User nicht gefunden' });
            }
            
            const Ticket = require('./models/Ticket');
            const Warning = require('./models/Warning');
            const ModerationLog = require('./models/ModerationLog');
            
            // Zähle Tickets von diesem User
            const tickets = Ticket.find({ userId });
            const ticketCount = tickets.length;
            const openTickets = tickets.filter(t => t.status === 'open').length;
            const closedTickets = tickets.filter(t => t.status === 'closed').length;
            
            // Zähle Warnungen
            const warnings = Warning.find({ userId });
            const warningCount = warnings.length;
            const activeWarnings = warnings.filter(w => !w.removed).length;
            
            // Zähle Moderation Logs
            const moderationLogs = ModerationLog.find({ userId });
            const modActions = {
                warns: moderationLogs.filter(l => l.action === 'warn').length,
                kicks: moderationLogs.filter(l => l.action === 'kick').length,
                bans: moderationLogs.filter(l => l.action === 'ban').length,
                reports: moderationLogs.filter(l => l.action === 'report').length
            };
            
            // Hole Server-Liste wo User Mitglied ist
            const guilds = [];
            for (const [guildId, guild] of client.guilds.cache) {
                try {
                    const member = await guild.members.fetch(userId).catch(() => null);
                    if (member) {
                        guilds.push({
                            id: guild.id,
                            name: guild.name,
                            icon: guild.iconURL(),
                            joinedAt: member.joinedAt,
                            roles: member.roles.cache
                                .filter(r => r.id !== guild.id)
                                .map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
                        });
                    }
                } catch (error) {
                    // Skip if can't fetch member
                }
            }
            
            const stats = {
                user: {
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator,
                    tag: user.tag,
                    avatar: user.displayAvatarURL({ size: 256 }),
                    bot: user.bot,
                    createdAt: user.createdAt,
                    accountAge: Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24)) + ' Tage'
                },
                tickets: {
                    total: ticketCount,
                    open: openTickets,
                    closed: closedTickets
                },
                warnings: {
                    total: warningCount,
                    active: activeWarnings,
                    removed: warningCount - activeWarnings
                },
                moderation: modActions,
                guilds: {
                    count: guilds.length,
                    list: guilds
                }
            };
            
            res.json({ success: true, stats });
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({ error: error.message });
        }
    });
    
    const PORT = process.env.BOT_API_PORT || 3001;
    app.listen(PORT, () => {
        console.log(`✅ Bot API läuft auf Port ${PORT}`);
    });
}

module.exports = { startBotAPI };
