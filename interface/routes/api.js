const express = require('express');
const router = express.Router();
const path = require('path');
const GuildConfig = require(path.join(__dirname, '../../bot/models/GuildConfig'));
const Ticket = require(path.join(__dirname, '../../bot/models/Ticket'));
const Application = require(path.join(__dirname, '../../bot/models/Application'));

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
        const applications = await Application.find({ guildId: req.params.id });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

module.exports = router;
