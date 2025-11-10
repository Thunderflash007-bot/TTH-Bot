const express = require('express');
const router = express.Router();
const path = require('path');
const GuildConfig = require(path.join(__dirname, '../../bot/models/GuildConfig'));
const Ticket = require(path.join(__dirname, '../../bot/models/Ticket'));
const Application = require(path.join(__dirname, '../../bot/models/Application'));

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/discord');
}

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const guilds = req.user.guilds.filter(guild => 
            (guild.permissions & 0x20) === 0x20
        );
        res.render('dashboard', { user: req.user, guilds });
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Laden der Guilds');
    }
});

router.get('/guild/:id', isAuthenticated, async (req, res) => {
    try {
        const guildId = req.params.id;
        const guild = req.user.guilds.find(g => g.id === guildId);
        
        if (!guild || (guild.permissions & 0x20) !== 0x20) {
            return res.status(403).send('Keine Berechtigung');
        }

        const config = await GuildConfig.findOne({ guildId }) || {};
        const tickets = Ticket.findSorted({ guildId }, 10);
        const applications = Application.findSorted({ guildId }, 10);
        
        const stats = {
            totalTickets: await Ticket.countDocuments({ guildId }),
            openTickets: await Ticket.countDocuments({ guildId, status: 'open' }),
            totalApplications: await Application.countDocuments({ guildId }),
            pendingApplications: await Application.countDocuments({ guildId, status: 'pending' })
        };

        res.render('guild-dashboard', { 
            user: req.user, 
            guild, 
            config, 
            tickets, 
            applications,
            stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Laden der Guild-Daten');
    }
});

module.exports = router;
