const express = require('express');
const router = express.Router();
const path = require('path');
const GuildConfig = require(path.join(__dirname, '../../bot/models/GuildConfig'));
const Ticket = require(path.join(__dirname, '../../bot/models/Ticket'));
const Application = require(path.join(__dirname, '../../bot/models/Application'));
const botClient = require('../utils/botClient');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Nicht authentifiziert' });
}

router.post('/guild/:id/config', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        let config = await GuildConfig.findOne({ guildId });
        Object.assign(config, req.body);
        await GuildConfig.save(config);

        res.json({ success: true, config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

// Welcome-System Konfiguration
router.post('/config/welcome', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        let config = GuildConfig.findOne({ guildId });
        if (!config) {
            config = GuildConfig.create(guildId);
        }
        
        // Update welcome settings
        if (req.body.welcomeChannel) {
            config.welcomeChannelId = req.body.welcomeChannel === 'manual' ? null : req.body.welcomeChannel;
        }
        if (req.body.welcomeMessage !== undefined) {
            config.welcomeMessage = req.body.welcomeMessage;
        }
        if (req.body.leaveChannel) {
            config.leaveChannelId = req.body.leaveChannel === 'manual' ? null : req.body.leaveChannel;
        }
        
        GuildConfig.save(config);
        res.redirect(`/dashboard/${guildId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Speichern: ' + error.message);
    }
});

// Ticket-System Konfiguration
router.post('/config/tickets', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        let config = GuildConfig.findOne({ guildId });
        if (!config) {
            config = GuildConfig.create(guildId);
        }
        
        // Update ticket settings
        if (req.body.ticketCategory) {
            config.ticketCategoryId = req.body.ticketCategory === 'create' ? null : req.body.ticketCategory;
        }
        if (req.body.supportRole) {
            config.supportRoleId = req.body.supportRole === 'create' ? null : req.body.supportRole;
        }
        
        GuildConfig.save(config);
        res.redirect(`/dashboard/${guildId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Speichern: ' + error.message);
    }
});

router.get('/guild/:id/tickets', isAuthenticated, async (req, res) => {
    try {
        const tickets = await Ticket.find({ guildId: req.params.id });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

router.get('/guild/:id/applications', isAuthenticated, async (req, res) => {
    try {
        const applications = Application.find({ guildId: req.params.id });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

// Hole Channels und Rollen vom Bot
router.get('/guild/:id/data', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        const data = await botClient.getGuildData(guildId);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Laden: ' + error.message });
    }
});

// Test Welcome-Nachricht
router.post('/test/welcome', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        await botClient.sendTestWelcome(
            guildId,
            req.body.channelId,
            req.user.id,
            req.body.message
        );

        res.json({ 
            success: true, 
            message: 'Test-Nachricht wurde gesendet!' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Team-Rolle hinzufügen
router.post('/team/add', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        let config = GuildConfig.findOne({ guildId });
        if (!config) {
            config = GuildConfig.create(guildId);
        }

        if (!config.teamRoles) {
            config.teamRoles = [];
        }

        // Prüfe ob Rolle bereits existiert
        const exists = config.teamRoles.find(r => r.roleId === req.body.roleId);
        if (exists) {
            return res.status(400).json({ error: 'Rolle bereits hinzugefügt' });
        }

        config.teamRoles.push({
            roleId: req.body.roleId,
            roleName: req.body.roleName,
            rank: req.body.rank
        });

        GuildConfig.save(config);
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Team-Rolle entfernen
router.post('/team/remove', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        let config = GuildConfig.findOne({ guildId });
        if (!config) {
            return res.status(404).json({ error: 'Keine Konfiguration gefunden' });
        }

        config.teamRoles = config.teamRoles.filter(r => r.roleId !== req.body.roleId);
        GuildConfig.save(config);
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Moderation-Konfiguration
router.post('/config/moderation', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        let config = GuildConfig.findOne({ guildId });
        if (!config) {
            config = GuildConfig.create(guildId);
        }
        
        // Update moderation settings
        if (req.body.logChannel !== undefined) {
            config.logChannelId = req.body.logChannel || null;
        }
        if (req.body.muteRole !== undefined) {
            config.muteRoleId = req.body.muteRole || null;
        }
        
        GuildConfig.save(config);
        res.redirect(`/dashboard/${guildId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Speichern: ' + error.message);
    }
});

// XP/Level-System Konfiguration
router.post('/config/xp', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        let config = GuildConfig.findOne({ guildId });
        if (!config) {
            config = GuildConfig.create(guildId);
        }
        
        // Update XP settings
        config.levelUpMessage = req.body.levelUpMessage === 'true';
        config.levelUpChannelId = req.body.levelUpChannel || null;
        
        GuildConfig.save(config);
        res.redirect(`/dashboard/${guildId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Speichern: ' + error.message);
    }
});

// Application-System Konfiguration
router.post('/config/applications', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        let config = GuildConfig.findOne({ guildId });
        if (!config) {
            config = GuildConfig.create(guildId);
        }
        
        // Update application settings
        config.applicationChannelId = req.body.applicationChannel || null;
        
        GuildConfig.save(config);
        res.redirect(`/dashboard/${guildId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Speichern: ' + error.message);
    }
});

// Scheduled Message erstellen
router.post('/automation/scheduled-message', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        const ScheduledMessage = require(path.join(__dirname, '../../bot/models/ScheduledMessage'));
        
        const scheduleData = {
            guildId,
            channelId: req.body.channel,
            message: req.body.message,
            scheduleType: req.body.scheduleType,
            enabled: req.body.enabled === 'true',
            createdBy: req.user.id
        };

        // Add schedule-specific fields
        if (req.body.scheduleType === 'once') {
            scheduleData.date = req.body.date;
            scheduleData.time = req.body.time;
        } else if (req.body.scheduleType === 'daily') {
            scheduleData.time = req.body.time;
        } else if (req.body.scheduleType === 'weekly') {
            scheduleData.time = req.body.time;
            scheduleData.day = parseInt(req.body.day);
        } else if (req.body.scheduleType === 'interval') {
            scheduleData.intervalValue = parseInt(req.body.intervalValue);
            scheduleData.intervalUnit = req.body.intervalUnit;
        } else if (req.body.scheduleType === 'cron') {
            scheduleData.cron = req.body.cron;
        }

        ScheduledMessage.save(scheduleData);
        res.redirect(`/dashboard/${guildId}#automation`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Erstellen: ' + error.message);
    }
});

// Auto-Role erstellen
router.post('/automation/auto-role', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        const AutoRole = require(path.join(__dirname, '../../bot/models/AutoRole'));
        
        const autoRoleData = {
            guildId,
            roleId: req.body.roleId,
            type: req.body.type,
            enabled: req.body.enabled === 'true',
            createdBy: req.user.id
        };

        // Add type-specific fields
        if (req.body.type === 'level') {
            autoRoleData.level = parseInt(req.body.level);
        } else if (req.body.type === 'time') {
            autoRoleData.timeValue = parseInt(req.body.timeValue);
            autoRoleData.timeUnit = req.body.timeUnit;
        }

        AutoRole.save(autoRoleData);
        res.redirect(`/dashboard/${guildId}#automation`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Erstellen: ' + error.message);
    }
});

// Delete Scheduled Message
router.delete('/automation/scheduled-message/:id', isAuthenticated, async (req, res) => {
    try {
        const ScheduledMessage = require(path.join(__dirname, '../../bot/models/ScheduledMessage'));
        ScheduledMessage.delete({ _id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Auto-Role
router.delete('/automation/auto-role/:id', isAuthenticated, async (req, res) => {
    try {
        const AutoRole = require(path.join(__dirname, '../../bot/models/AutoRole'));
        AutoRole.delete({ _id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Custom Command erstellen
router.post('/automation/custom-command', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.body.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        const CustomCommand = require(path.join(__dirname, '../../bot/models/CustomCommand'));
        
        const commandData = {
            guildId,
            name: req.body.name.toLowerCase().trim(),
            response: req.body.response,
            useEmbed: req.body.useEmbed === 'true',
            embedColor: req.body.embedColor || '#5865F2',
            deleteInvoke: req.body.deleteInvoke === 'true',
            enabled: req.body.enabled === 'true',
            createdBy: req.user.id
        };

        CustomCommand.save(commandData);
        res.redirect(`/dashboard/${guildId}#automation`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Erstellen: ' + error.message);
    }
});

// Delete Custom Command
router.delete('/automation/custom-command/:id', isAuthenticated, async (req, res) => {
    try {
        const CustomCommand = require(path.join(__dirname, '../../bot/models/CustomCommand'));
        CustomCommand.delete({ _id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Backup erstellen
router.get('/tools/backup/:guildId', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        const CustomCommand = require(path.join(__dirname, '../../bot/models/CustomCommand'));
        const ScheduledMessage = require(path.join(__dirname, '../../bot/models/ScheduledMessage'));
        const AutoRole = require(path.join(__dirname, '../../bot/models/AutoRole'));
        
        const backup = {
            version: '1.0',
            guildId,
            timestamp: new Date().toISOString(),
            config: GuildConfig.findOne({ guildId }) || {},
            tickets: Ticket.find({ guildId }) || [],
            applications: Application.find({ guildId }) || [],
            customCommands: CustomCommand.find({ guildId }) || [],
            scheduledMessages: ScheduledMessage.find({ guildId }) || [],
            autoRoles: AutoRole.find({ guildId }) || []
        };
        
        res.json(backup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Backup wiederherstellen
router.post('/tools/restore/:guildId', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        const backup = req.body;
        const CustomCommand = require(path.join(__dirname, '../../bot/models/CustomCommand'));
        const ScheduledMessage = require(path.join(__dirname, '../../bot/models/ScheduledMessage'));
        const AutoRole = require(path.join(__dirname, '../../bot/models/AutoRole'));
        
        // Config wiederherstellen
        if (backup.config) {
            backup.config.guildId = guildId;
            GuildConfig.save(backup.config);
        }
        
        // Custom Commands wiederherstellen
        if (backup.customCommands) {
            backup.customCommands.forEach(cmd => {
                cmd.guildId = guildId;
                delete cmd._id;
                CustomCommand.save(cmd);
            });
        }
        
        // Scheduled Messages wiederherstellen
        if (backup.scheduledMessages) {
            backup.scheduledMessages.forEach(msg => {
                msg.guildId = guildId;
                delete msg._id;
                ScheduledMessage.save(msg);
            });
        }
        
        // Auto-Roles wiederherstellen
        if (backup.autoRoles) {
            backup.autoRoles.forEach(ar => {
                ar.guildId = guildId;
                delete ar._id;
                AutoRole.save(ar);
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Daten exportieren
router.get('/tools/export/:guildId/:type', isAuthenticated, async (req, res) => {
    try {
        const { guildId, type } = req.params;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        let data = [];
        
        if (type === 'tickets') {
            data = Ticket.find({ guildId }) || [];
        } else if (type === 'users') {
            const User = require(path.join(__dirname, '../../bot/models/User'));
            data = User.find({ guildId }) || [];
        } else if (type === 'logs') {
            const ModerationLog = require(path.join(__dirname, '../../bot/models/ModerationLog'));
            data = ModerationLog.find({ guildId }) || [];
        }
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send Announcement
router.post('/automation/announcement', isAuthenticated, async (req, res) => {
    try {
        const { guildId, channels, title, message, mention, useEmbed } = req.body;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        // Sende an Bot API
        const axios = require('axios');
        const BOT_API = process.env.BOT_API_URL || 'http://localhost:3001';
        
        await axios.post(`${BOT_API}/api/guilds/${guildId}/announcement`, {
            channels,
            title,
            message,
            mention,
            useEmbed
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
