const express = require('express');
const router = express.Router();
const path = require('path');
const GuildConfig = require(path.join(__dirname, '../../bot/models/GuildConfig'));
const Ticket = require(path.join(__dirname, '../../bot/models/Ticket'));
const Application = require(path.join(__dirname, '../../bot/models/Application'));
const AdminUser = require(path.join(__dirname, '../../bot/models/AdminUser'));
const botClient = require('../utils/botClient');
const { checkDashboardAccess } = require(path.join(__dirname, '../../bot/middleware/featureCheck'));

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/discord');
}

// Middleware: Wartungsmodus-Check
function maintenanceCheck(req, res, next) {
    if (!req.user) return next();
    
    const access = checkDashboardAccess(req.user.id);
    
    console.log(`[Maintenance Check] User: ${req.user.username} (${req.user.id})`);
    console.log(`[Maintenance Check] Access:`, access);
    
    if (!access.allowed) {
        console.log(`[Maintenance Check] ❌ Zugriff verweigert - Zeige Wartungsseite`);
        return res.render('maintenance', {
            user: req.user,
            message: access.message,
            inMaintenance: access.inMaintenance
        });
    }
    
    console.log(`[Maintenance Check] ✅ Zugriff erlaubt`);
    next();
}

// Dashboard Hauptseite (ohne spezifischen Server)
router.get('/', isAuthenticated, maintenanceCheck, async (req, res) => {
    try {
        // Hole Bot Client
        const client = botClient.getClient();
        let botGuildIds = [];
        
        if (client && client.guilds) {
            // Sammle alle Guild IDs auf denen der Bot ist
            botGuildIds = Array.from(client.guilds.cache.keys());
            console.log(`🤖 Bot ist auf ${botGuildIds.length} Servern`);
        } else {
            console.warn('⚠️ Bot Client nicht verfügbar - zeige alle Server');
        }
        
        // Filtere Guilds: User muss Admin sein UND Bot muss auf dem Server sein
        const userGuilds = req.user.guilds.filter(guild => 
            (guild.permissions & 0x20) === 0x20
        );
        
        const guilds = botGuildIds.length > 0 
            ? userGuilds.filter(guild => botGuildIds.includes(guild.id))
            : userGuilds;
        
        console.log(`👤 User ${req.user.username}: ${userGuilds.length} Server mit Admin-Rechten, ${guilds.length} davon mit Bot`);
        
        // Admin-Check für Navigation
        const isMainAdmin = req.user.id === '901518853635444746';
        const adminUser = AdminUser.findOne({ userId: req.user.id });
        const canViewAdminPanel = isMainAdmin || (adminUser && adminUser.permissions.viewAdminPanel);
        
        res.render('dashboard', { 
            user: req.user, 
            guilds, 
            currentGuild: null,
            guild: null,
            config: {},
            tickets: [],
            applications: [],
            stats: {
                totalTickets: 0,
                openTickets: 0,
                totalApplications: 0,
                pendingApplications: 0
            },
            channels: [],
            roles: [],
            categories: [],
            scheduledMessages: [],
            autoRoles: [],
            customCommands: [],
            isMainAdmin: isMainAdmin,
            canViewAdminPanel: canViewAdminPanel
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Laden der Guilds');
    }
});

// Bug Report Routes müssen VOR dem :id route sein
router.get('/report-bug', isAuthenticated, (req, res) => {
    res.render('report-bug', { user: req.user });
});

router.post('/report-bug', isAuthenticated, async (req, res) => {
    console.log('\n🐛 ===== BUG REPORT SUBMISSION ===== ');
    console.log('User:', req.user.username, '(' + req.user.id + ')');
    console.log('Body:', req.body);
    
    try {
        const BugReport = require(path.join(__dirname, '../../bot/models/BugReport'));
        const { title, description, steps, expected, actual } = req.body;
        
        console.log('📝 Parsed data:', { title, description, steps, expected, actual });
        
        if (!title || !description) {
            console.log('❌ Validation failed: Missing title or description');
            return res.status(400).json({ error: 'Titel und Beschreibung sind erforderlich' });
        }
        
        console.log('📦 Creating bug report...');
        
        const bug = BugReport.create({
            userId: req.user.id,
            username: `${req.user.username}#${req.user.discriminator}`,
            title,
            description,
            steps: steps || null,
            expectedBehavior: expected || null,
            actualBehavior: actual || null
        });
        
        console.log('✅ Bug Report created:', bug.id);
        console.log('📄 Bug data:', JSON.stringify(bug, null, 2));
        
        // Sende DM an Admin
        console.log('📨 Attempting to send admin DM...');
        try {
            const botInstance = require('../utils/botClient').client;
            console.log('🤖 Bot instance:', botInstance ? 'Found' : 'Not found');
            console.log('🤖 Bot ready:', botInstance?.isReady() || false);
            
            if (botInstance?.isReady() && botInstance.users) {
                console.log('👤 Fetching admin user (ID: 901518853635444746)...');
                const admin = await botInstance.users.fetch('901518853635444746').catch(err => {
                    console.error('❌ Failed to fetch admin user:', err.message);
                    return null;
                });
                console.log('👤 Admin:', admin ? `${admin.username} (${admin.id})` : 'Not found');
                
                if (admin) {
                    console.log('📤 Sending DM to admin...');
                    await admin.send({
                        embeds: [{
                            title: '🐛 Neuer Bug Report (Web)',
                            color: 0xed4245,
                            fields: [
                                { name: 'Bug ID', value: bug.id, inline: true },
                                { name: 'User', value: `${bug.username} (${bug.userId})`, inline: true },
                                { name: 'Titel', value: title, inline: false },
                                { name: 'Beschreibung', value: description.substring(0, 500), inline: false }
                            ],
                            timestamp: new Date()
                        }]
                    });
                    console.log('✅ Admin DM sent successfully');
                } else {
                    console.log('⚠️ Admin user not found');
                }
            } else {
                console.log('⚠️ Bot instance or users not available');
            }
        } catch (dmError) {
            console.error('❌ Error sending admin DM:', dmError.message);
            console.error('Stack:', dmError.stack);
        }
        
        console.log('✅ Sending success response');
        console.log('===== BUG REPORT COMPLETE =====\n');
        res.json({ success: true, bugId: bug.id });
    } catch (error) {
        console.error('❌ ===== BUG REPORT ERROR =====');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('===== ERROR END =====\n');
        res.status(500).json({ error: error.message || 'Unbekannter Fehler' });
    }
});

router.get('/:id', isAuthenticated, maintenanceCheck, async (req, res) => {
    try {
        const guildId = req.params.id;
        
        // Hole Bot Client
        const client = botClient.getClient();
        let botGuildIds = [];
        
        if (client && client.guilds) {
            botGuildIds = Array.from(client.guilds.cache.keys());
        }
        
        // Filtere Guilds: User muss Admin sein UND Bot muss auf dem Server sein
        const userGuilds = req.user.guilds.filter(guild => 
            (guild.permissions & 0x20) === 0x20
        );
        
        const guilds = botGuildIds.length > 0 
            ? userGuilds.filter(guild => botGuildIds.includes(guild.id))
            : userGuilds;
        
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung für diesen Server');
        }
        
        // Prüfe ob Bot auf dem Server ist
        if (botGuildIds.length > 0 && !botGuildIds.includes(guildId)) {
            return res.status(404).render('access-denied', {
                user: req.user,
                message: 'Der Bot ist nicht auf diesem Server. Bitte lade den Bot zuerst ein!',
                inviteLink: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID || 'YOUR_BOT_ID'}&permissions=8&scope=bot%20applications.commands`
            });
        }

        const config = GuildConfig.findOne({ guildId }) || {};
        
        // Hole Tickets mit User-Namen vom Bot API
        let tickets = [];
        try {
            const axios = require('axios');
            const BOT_API = process.env.BOT_API_URL || 'http://localhost:3001';
            const response = await axios.get(`${BOT_API}/api/guilds/${guildId}/tickets`);
            tickets = response.data.slice(0, 20); // Zeige max 20 Tickets
        } catch (error) {
            console.warn('Tickets konnten nicht vom Bot API geladen werden:', error.message);
            // Fallback zu lokalen Daten ohne User-Namen
            const allTickets = Ticket.find({ guildId }) || [];
            tickets = Array.isArray(allTickets) ? allTickets.slice(0, 20) : [];
        }
        
        // Hole Applications und begrenze auf 10
        const allApplications = Application.find({ guildId }) || [];
        const applications = Array.isArray(allApplications) ? allApplications.slice(0, 10) : [];
        
        const stats = {
            totalTickets: Ticket.countDocuments({ guildId }) || 0,
            openTickets: Ticket.countDocuments({ guildId, status: 'open' }) || 0,
            totalApplications: Application.countDocuments({ guildId }) || 0,
            pendingApplications: Application.countDocuments({ guildId, status: 'pending' }) || 0
        };

        // Hole Guild-Daten vom Bot (Channels, Rollen)
        let guildData = { channels: [], roles: [], categories: [] };
        try {
            guildData = await botClient.getGuildData(guildId);
        } catch (error) {
            console.warn('Bot-Daten konnten nicht geladen werden:', error.message);
        }

        // Hole Scheduled Messages
        const ScheduledMessage = require(path.join(__dirname, '../../bot/models/ScheduledMessage'));
        const scheduledMessages = ScheduledMessage.find({ guildId }) || [];

        // Hole Auto-Roles
        const AutoRole = require(path.join(__dirname, '../../bot/models/AutoRole'));
        const autoRoles = AutoRole.find({ guildId }) || [];

        // Hole Custom Commands
        const CustomCommand = require(path.join(__dirname, '../../bot/models/CustomCommand'));
        const customCommands = CustomCommand.find({ guildId }) || [];

        // Admin-Check für Navigation
        const isMainAdmin = req.user.id === '901518853635444746';
        const adminUser = AdminUser.findOne({ userId: req.user.id });
        const canViewAdminPanel = isMainAdmin || (adminUser && adminUser.permissions.viewAdminPanel);

        res.render('dashboard', { 
            user: req.user, 
            guilds,
            currentGuild: guildId,
            guild, 
            config, 
            tickets, 
            applications,
            stats,
            channels: guildData.channels,
            roles: guildData.roles,
            categories: guildData.categories,
            scheduledMessages,
            autoRoles,
            customCommands,
            isMainAdmin: isMainAdmin,
            canViewAdminPanel: canViewAdminPanel
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Laden der Guild-Daten: ' + error.message);
    }
});

module.exports = router;
