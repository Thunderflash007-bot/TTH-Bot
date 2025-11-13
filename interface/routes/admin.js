const express = require('express');
const router = express.Router();
const axios = require('axios');

// Admin-User ID (thunderflash.0.0.7)
const ADMIN_USERNAME = 'thunderflash.0.0.7';

// Middleware: Nur für Admin
function isAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    
    if (req.user.username !== ADMIN_USERNAME) {
        return res.status(403).send('Access Denied');
    }
    
    next();
}

// Admin Panel Route (versteckte URL)
router.get('/secret-control-panel-x7k9m2p', isAdmin, async (req, res) => {
    try {
        // Bot-Status abrufen
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        let botStatus = { online: false, guilds: [] };
        try {
            const healthResponse = await botApi.get('/api/health');
            const guildsResponse = await botApi.get('/api/guilds');
            botStatus = {
                online: true,
                uptime: healthResponse.data.uptime,
                guilds: guildsResponse.data.guilds
            };
        } catch (error) {
            console.error('Bot API nicht erreichbar:', error.message);
        }

        res.render('admin', {
            user: req.user,
            botStatus: botStatus
        });
    } catch (error) {
        console.error('Admin Panel Fehler:', error);
        res.status(500).send('Server Error');
    }
});

// Wartungsankündigung an alle Server senden
router.post('/maintenance-announcement', isAdmin, async (req, res) => {
    try {
        const { title, message, startTime, endTime, severity } = req.body;

        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 10000
        });

        const response = await botApi.post('/api/admin/maintenance', {
            title,
            message,
            startTime,
            endTime,
            severity
        });

        res.json({ 
            success: true, 
            sentTo: response.data.sentTo,
            failed: response.data.failed 
        });
    } catch (error) {
        console.error('Fehler beim Senden der Wartungsankündigung:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bot-Statistiken für alle Server
router.get('/bot-stats', isAdmin, async (req, res) => {
    try {
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.get('/api/admin/stats');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bot neu starten (nur Befehle neu laden)
router.post('/reload-bot', isAdmin, async (req, res) => {
    try {
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.post('/api/admin/reload');
        res.json({ success: true, message: response.data.message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Global Broadcast an alle Server
router.post('/global-broadcast', isAdmin, async (req, res) => {
    try {
        const { message, channelType } = req.body; // channelType: 'log', 'general', 'all'

        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 10000
        });

        const response = await botApi.post('/api/admin/broadcast', {
            message,
            channelType
        });

        res.json({ 
            success: true, 
            sentTo: response.data.sentTo 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Global Settings API
router.get('/api/global-settings', isAdmin, async (req, res) => {
    try {
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.get('/api/admin/global-settings');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/api/global-settings/feature/:featureName', isAdmin, async (req, res) => {
    try {
        const { featureName } = req.params;
        const { enabled, reason, userId } = req.body;

        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.patch(`/api/admin/global-settings/feature/${featureName}`, {
            enabled,
            reason,
            userId
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/maintenance', isAdmin, async (req, res) => {
    try {
        const { enabled, message, userId } = req.body;

        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.post('/api/admin/maintenance', {
            enabled,
            message,
            userId
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
