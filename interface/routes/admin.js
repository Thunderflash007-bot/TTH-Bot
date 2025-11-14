const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const AdminUser = require(path.join(__dirname, '../../bot/models/AdminUser'));

// Haupt-Admin-User ID
const MAIN_ADMIN_ID = '901518853635444746';

// Middleware: Admin-Check mit Berechtigungen
function isAdmin(req, res, next) {
    if (!req.user) {
        return res.render('access-denied', {
            title: 'Nicht angemeldet',
            message: 'Du musst angemeldet sein, um diese Seite zu sehen.',
            user: null
        });
    }
    
    const userId = req.user.id;
    
    // Haupt-Admin hat immer Zugriff
    if (userId === MAIN_ADMIN_ID) {
        req.isMainAdmin = true;
        return next();
    }
    
    // Prüfe ob User in AdminUser-Liste ist
    const adminUser = AdminUser.findOne({ userId });
    
    if (!adminUser || !adminUser.permissions.viewAdminPanel) {
        return res.render('access-denied', {
            title: 'Zugriff Verweigert',
            message: 'Du hast keine Berechtigung, auf diesen Bereich zuzugreifen.',
            user: req.user
        });
    }
    
    req.adminUser = adminUser;
    req.isMainAdmin = false;
    next();
}

// Middleware: Prüfe spezifische Berechtigung
function requirePermission(permission) {
    return (req, res, next) => {
        // Haupt-Admin hat immer alle Berechtigungen
        if (req.isMainAdmin) return next();
        
        if (!req.adminUser || !req.adminUser.permissions[permission]) {
            return res.status(403).json({ 
                error: 'Fehlende Berechtigung', 
                required: permission 
            });
        }
        
        next();
    };
}

// Bot-Status API Endpoint
router.get('/bot-status', isAdmin, async (req, res) => {
    try {
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
        
        res.json({ success: true, botStatus });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

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

        // Admin-User Liste für Haupt-Admin
        let adminUsers = [];
        if (req.isMainAdmin) {
            adminUsers = AdminUser.findAll();
            
            // Füge Haupt-Admin zur Liste hinzu (falls nicht schon drin)
            const mainAdminExists = adminUsers.some(admin => admin.userId === '901518853635444746');
            if (!mainAdminExists) {
                adminUsers.unshift({
                    userId: '901518853635444746',
                    username: req.user.username,
                    addedAt: 'System',
                    isMainAdmin: true,
                    permissions: {
                        // Alle Berechtigungen für Haupt-Admin
                        viewAdminPanel: true,
                        viewBotStatus: true,
                        restartBot: true,
                        manageCommands: true,
                        viewLogs: true,
                        toggleMaintenance: true,
                        toggleFeatures: true,
                        manageBypass: true,
                        searchUsers: true,
                        viewUserStats: true,
                        createBackup: true,
                        viewBackups: true,
                        cleanupDatabase: true,
                        sendAnnouncements: true,
                        sendBroadcast: true,
                        viewBugReports: true,
                        manageBugReports: true,
                        viewGlobalStats: true,
                        viewServerList: true
                    }
                });
            } else {
                // Markiere existierenden Haupt-Admin
                adminUsers = adminUsers.map(admin => {
                    if (admin.userId === '901518853635444746') {
                        return { ...admin, isMainAdmin: true };
                    }
                    return admin;
                });
            }
        }

        res.render('admin', {
            user: req.user,
            botStatus: botStatus,
            isMainAdmin: req.isMainAdmin,
            permissions: req.isMainAdmin ? null : req.adminUser.permissions,
            adminUsers: adminUsers
        });
    } catch (error) {
        console.error('Admin Panel Fehler:', error);
        res.status(500).send('Server Error');
    }
});

// === ADMIN USER MANAGEMENT (nur Haupt-Admin) ===

// Admin-User hinzufügen
router.post('/admin-users/add', isAdmin, async (req, res) => {
    try {
        if (!req.isMainAdmin) {
            return res.status(403).json({ error: 'Nur der Haupt-Admin kann Admin-User hinzufügen' });
        }

        const { userId, username, permissions } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User-ID erforderlich' });
        }

        // Prüfe ob User der Haupt-Admin ist
        if (userId === '901518853635444746') {
            return res.status(400).json({ error: 'Der Haupt-Admin ist bereits in der Liste und kann nicht hinzugefügt werden' });
        }

        // Prüfe ob User bereits Admin ist (nur in der Datenbank)
        const existingAdmin = AdminUser.findOne({ userId });
        if (existingAdmin) {
            return res.status(400).json({ error: 'User ist bereits Admin' });
        }

        const adminUser = AdminUser.create({
            userId,
            username,
            addedBy: req.user.id,
            permissions
        });

        res.json({ success: true, adminUser });
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Admin-Users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin-User Berechtigungen aktualisieren
router.patch('/admin-users/:userId/permissions', isAdmin, async (req, res) => {
    try {
        if (!req.isMainAdmin) {
            return res.status(403).json({ error: 'Nur der Haupt-Admin kann Berechtigungen ändern' });
        }

        const { userId } = req.params;
        const { permissions } = req.body;

        const updated = AdminUser.updatePermissions(userId, permissions);

        if (!updated) {
            return res.status(404).json({ error: 'Admin-User nicht gefunden' });
        }

        res.json({ success: true, adminUser: updated });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Berechtigungen:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin-User entfernen
router.delete('/admin-users/:userId', isAdmin, async (req, res) => {
    try {
        if (!req.isMainAdmin) {
            return res.status(403).json({ error: 'Nur der Haupt-Admin kann Admin-User entfernen' });
        }

        const { userId } = req.params;

        // Verhindere Selbst-Entfernung
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Du kannst dich nicht selbst entfernen' });
        }

        const removed = AdminUser.remove(userId);

        if (!removed) {
            return res.status(404).json({ error: 'Admin-User nicht gefunden' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Fehler beim Entfernen des Admin-Users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Alle Admin-User abrufen (nur Haupt-Admin)
router.get('/admin-users', isAdmin, async (req, res) => {
    try {
        if (!req.isMainAdmin) {
            return res.status(403).json({ error: 'Nur der Haupt-Admin kann Admin-User einsehen' });
        }

        const adminUsers = AdminUser.findAll();
        res.json({ success: true, adminUsers });
    } catch (error) {
        console.error('Fehler beim Abrufen der Admin-User:', error);
        res.status(500).json({ error: error.message });
    }
});

// === BESTEHENDE ROUTEN MIT BERECHTIGUNGSPRÜFUNG ===

// Wartungsankündigung an alle Server senden
router.post('/maintenance-announcement', isAdmin, requirePermission('sendAnnouncements'), async (req, res) => {
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
router.get('/bot-stats', isAdmin, requirePermission('viewBotStatus'), async (req, res) => {
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
router.get('/settings', isAdmin, requirePermission('viewAdminPanel'), async (req, res) => {
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
router.post('/toggle-maintenance', isAdmin, requirePermission('toggleMaintenance'), async (req, res) => {
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

        // Sende Live-Update an alle verbundenen Clients
        if (global.notifyMaintenanceMode) {
            global.notifyMaintenanceMode(enabled);
        }

        res.json(response.data);
    } catch (error) {
        console.error('[Interface] FEHLER bei Wartungsmodus-Request:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Feature umschalten
router.post('/toggle-feature', isAdmin, requirePermission('toggleFeatures'), async (req, res) => {
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
router.post('/admin-bypass', isAdmin, requirePermission('manageBypass'), async (req, res) => {
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
router.post('/reload-bot', isAdmin, requirePermission('restartBot'), async (req, res) => {
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
router.post('/global-broadcast', isAdmin, requirePermission('sendBroadcast'), async (req, res) => {
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
router.get('/bug-reports', isAdmin, requirePermission('viewBugReports'), async (req, res) => {
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
router.patch('/bug-reports/:id/priority', isAdmin, requirePermission('manageBugReports'), async (req, res) => {
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
router.patch('/bug-reports/:id/status', isAdmin, requirePermission('manageBugReports'), async (req, res) => {
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
router.post('/bot/restart', isAdmin, requirePermission('restartBot'), async (req, res) => {
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
router.get('/users/search', isAdmin, requirePermission('searchUsers'), async (req, res) => {
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
router.post('/database/backup', isAdmin, requirePermission('createBackup'), async (req, res) => {
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
router.get('/stats/global', isAdmin, requirePermission('viewGlobalStats'), async (req, res) => {
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

// User-Statistiken abrufen
router.get('/users/:userId/stats', isAdmin, requirePermission('viewUserStats'), async (req, res) => {
    try {
        const { userId } = req.params;
        const botApi = axios.create({
            baseURL: process.env.BOT_API_URL || 'http://localhost:4301',
            timeout: 10000
        });
        
        const response = await botApi.get(`/api/admin/users/${userId}/stats`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
