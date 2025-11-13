const Database = require('../utils/database');

class AdminUser {
    constructor() {
        this.db = new Database('adminusers');
    }

    // Admin-User finden
    findOne(query) {
        return this.db.findOne(query);
    }

    // Alle Admin-User
    findAll() {
        return this.db.find({});
    }

    // Admin-User erstellen
    create(data) {
        const adminUser = {
            userId: data.userId,
            username: data.username || 'Unknown',
            addedBy: data.addedBy,
            addedAt: new Date().toISOString(),
            permissions: data.permissions || {
                // Admin Panel Zugriff
                viewAdminPanel: false,
                
                // Bot Verwaltung
                viewBotStatus: false,
                restartBot: false,
                manageCommands: false,
                viewLogs: false,
                
                // Wartung & Features
                toggleMaintenance: false,
                toggleFeatures: false,
                manageBypass: false,
                
                // User Verwaltung
                searchUsers: false,
                viewUserStats: false,
                
                // Datenbank
                createBackup: false,
                viewBackups: false,
                cleanupDatabase: false,
                
                // Kommunikation
                sendAnnouncements: false,
                sendBroadcast: false,
                
                // Bug Reports
                viewBugReports: false,
                manageBugReports: false,
                
                // Statistiken
                viewGlobalStats: false,
                viewServerList: false
            }
        };
        
        return this.db.insert(adminUser);
    }

    // Berechtigungen aktualisieren
    updatePermissions(userId, permissions) {
        const admin = this.findOne({ userId });
        if (!admin) return null;
        
        admin.permissions = { ...admin.permissions, ...permissions };
        admin.updatedAt = new Date().toISOString();
        
        return this.db.updateOne({ userId }, admin);
    }

    // Admin-User entfernen
    remove(userId) {
        return this.db.deleteOne({ userId });
    }

    // Prüfe ob User Admin ist
    isAdmin(userId) {
        const admin = this.findOne({ userId });
        return admin !== null;
    }

    // Prüfe spezifische Berechtigung
    hasPermission(userId, permission) {
        const admin = this.findOne({ userId });
        if (!admin) return false;
        
        return admin.permissions[permission] === true;
    }

    // Hole alle Berechtigungen eines Users
    getPermissions(userId) {
        const admin = this.findOne({ userId });
        if (!admin) return null;
        
        return admin.permissions;
    }
}

module.exports = new AdminUser();
