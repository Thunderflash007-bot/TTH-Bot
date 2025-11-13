const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');

// Admin-User ID
const ADMIN_USER_ID = '901518853635444746';

// Middleware: Nur für Admin
function isAdmin(req, res, next) {
    if (!req.user) {
        return res.render('access-denied', {
            title: 'Nicht angemeldet',
            message: 'Du musst angemeldet sein, um diese Seite zu sehen.',
            user: null
        });
    }
    
    console.log('Admin Check - User ID:', req.user.id, 'Username:', req.user.username, 'Expected:', ADMIN_USER_ID);
    
    if (req.user.id !== ADMIN_USER_ID) {
        return res.render('access-denied', {
            title: 'Zugriff Verweigert',
            message: 'Du hast keine Berechtigung, auf diesen Bereich zuzugreifen.',
            user: req.user
        });
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

// Global Settings abrufen
router.get('/settings', isAdmin, async (req, res) => {
    try {
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.get('/api/admin/settings');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Wartungsmodus umschalten
router.post('/toggle-maintenance', isAdmin, async (req, res) => {
    try {
        const { enabled, message } = req.body;
        
        console.log('[Interface] ========== WARTUNGSMODUS REQUEST ==========');
        console.log('[Interface] Request Body:', { enabled, message, userId: req.user.id });
        
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.post('/api/admin/maintenance-mode', {
            enabled,
            message,
            userId: req.user.id
        });

        console.log('[Interface] Bot API Response:', response.data);
        console.log('[Interface] ========== WARTUNGSMODUS RESPONSE ==========');

        res.json(response.data);
    } catch (error) {
        console.error('[Interface] FEHLER bei Wartungsmodus-Request:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Feature umschalten
router.post('/toggle-feature', isAdmin, async (req, res) => {
    try {
        const { feature, enabled, reason } = req.body;
        
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.post('/api/admin/toggle-feature', {
            feature,
            enabled,
            reason,
            userId: req.user.id
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin-Bypass hinzufügen/entfernen
router.post('/admin-bypass', isAdmin, async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'add' oder 'remove'
        
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.post('/api/admin/bypass', {
            userId,
            action
        });

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

// Bug Reports - Get all
router.get('/bug-reports', isAdmin, async (req, res) => {
    try {
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.get('/api/admin/bug-reports');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bug Reports - Update Priority
router.patch('/bug-reports/:id/priority', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;
        
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.patch(`/api/admin/bug-reports/${id}/priority`, { priority });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bug Reports - Update Status
router.patch('/bug-reports/:id/status', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.patch(`/api/admin/bug-reports/${id}/status`, { status, note });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bug Reports - Add Note
router.post('/bug-reports/:id/note', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.post(`/api/admin/bug-reports/${id}/note`, { note });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bug Reports - Delete
router.delete('/bug-reports/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });

        const response = await botApi.delete(`/api/admin/bug-reports/${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === NEUE ADMIN ROUTEN ===

// Bot neustarten
router.post('/bot/restart', isAdmin, async (req, res) => {
    try {
        console.log('🔄 Admin requested bot restart');
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });
        
        const response = await botApi.post('/api/admin/restart');
        res.json(response.data);
    } catch (error) {
        console.error('Error restarting bot:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cache leeren
router.post('/bot/clear-cache', isAdmin, async (req, res) => {
    try {
        console.log('🧹 Admin requested cache clear');
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });
        
        const response = await botApi.post('/api/admin/clear-cache');
        res.json(response.data);
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({ error: error.message });
    }
});

// Commands synchronisieren
router.post('/bot/sync-commands', isAdmin, async (req, res) => {
    try {
        console.log('🔄 Admin requested command sync');
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 10000
        });
        
        const response = await botApi.post('/api/admin/sync-commands');
        res.json(response.data);
    } catch (error) {
        console.error('Error syncing commands:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bot Logs abrufen
router.get('/bot/logs', isAdmin, async (req, res) => {
    try {
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });
        
        const response = await botApi.get('/api/admin/logs');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: error.message });
    }
});

// User suchen
router.get('/users/search', isAdmin, async (req, res) => {
    try {
        const query = req.query.q;
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });
        
        const response = await botApi.get(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error searching user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Backup erstellen
router.post('/database/backup', isAdmin, async (req, res) => {
    try {
        console.log('💾 Admin requested database backup');
        const fs = require('fs');
        const path = require('path');
        const dataDir = path.join(__dirname, '../../data');
        const backupDir = path.join(__dirname, '../../backups');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
        
        const backup = {
            timestamp: new Date().toISOString(),
            data: {}
        };
        
        // Lese alle JSON-Dateien aus data/
        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
            backup.data[file] = JSON.parse(content);
        }
        
        fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
        
        const stats = fs.statSync(backupPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        res.json({ 
            success: true, 
            filename: `backup-${timestamp}.json`,
            size: `${sizeMB} MB`
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ error: error.message });
    }
});

// Backups auflisten
router.get('/database/backups', isAdmin, async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const backupDir = path.join(__dirname, '../../backups');
        
        if (!fs.existsSync(backupDir)) {
            return res.json({ success: true, backups: [] });
        }
        
        const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
        const backups = files.map(file => {
            const stats = fs.statSync(path.join(backupDir, file));
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            return {
                filename: file,
                size: `${sizeMB} MB`,
                date: new Date(stats.mtime).toLocaleString('de-DE')
            };
        });
        
        res.json({ success: true, backups });
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({ error: error.message });
    }
});

// Alte Daten bereinigen
router.post('/database/cleanup', isAdmin, async (req, res) => {
    try {
        console.log('🧹 Admin requested database cleanup');
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });
        
        const response = await botApi.post('/api/admin/cleanup');
        res.json(response.data);
    } catch (error) {
        console.error('Error cleaning up database:', error);
        res.status(500).json({ error: error.message });
    }
});

// Globale Statistiken
router.get('/stats/global', isAdmin, async (req, res) => {
    try {
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 5000
        });
        
        const response = await botApi.get('/api/admin/stats/global');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching global stats:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
