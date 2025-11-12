const express = require('express');
const router = express.Router();
const path = require('path');
const GuildConfig = require(path.join(__dirname, '../../bot/models/GuildConfig'));
const Ticket = require(path.join(__dirname, '../../bot/models/Ticket'));
const Application = require(path.join(__dirname, '../../bot/models/Application'));
const botClient = require('../utils/botClient');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/discord');
}

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const guilds = req.user.guilds.filter(guild => 
            (guild.permissions & 0x20) === 0x20
        );
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
            customCommands: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Laden der Guilds');
    }
});

router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        const guilds = req.user.guilds.filter(guild => 
            (guild.permissions & 0x20) === 0x20
        );
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung für diesen Server');
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
            customCommands
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Laden der Guild-Daten: ' + error.message);
    }
});

module.exports = router;
