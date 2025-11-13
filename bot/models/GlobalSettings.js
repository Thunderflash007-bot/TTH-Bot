const Database = require('../utils/database');

class GlobalSettings {
    constructor() {
        this.db = new Database('globalsettings');
    }

    findOne(query) {
        let settings = this.db.findOne(query);
        if (!settings) {
            settings = this.createDefault();
        }
        return settings;
    }

    createDefault() {
        const defaultSettings = {
            id: 'global',
            maintenanceMode: false,
            maintenanceMessage: 'Der Bot befindet sich im Wartungsmodus. Bitte versuche es später erneut.',
            adminBypass: ['1437453669699424276'], // Admin User IDs die trotz Wartung Zugriff haben
            features: {
                // Ticket System
                tickets: { enabled: true, reason: '' },
                ticketPriority: { enabled: true, reason: '' },
                ticketForward: { enabled: true, reason: '' },
                
                // Moderation
                warns: { enabled: true, reason: '' },
                reports: { enabled: true, reason: '' },
                ban: { enabled: true, reason: '' },
                kick: { enabled: true, reason: '' },
                clear: { enabled: true, reason: '' },
                
                // Projects & Management
                projects: { enabled: true, reason: '' },
                ports: { enabled: true, reason: '' },
                news: { enabled: true, reason: '' },
                
                // Communication
                vorschlag: { enabled: true, reason: '' },
                kummerkasten: { enabled: true, reason: '' },
                
                // Verification & Roles
                verify: { enabled: true, reason: '' },
                prefix: { enabled: true, reason: '' },
                
                // Automation
                scheduledMessages: { enabled: true, reason: '' },
                autoRoles: { enabled: true, reason: '' },
                customCommands: { enabled: true, reason: '' },
                
                // Dashboard
                dashboard: { enabled: true, reason: '' }
            },
            updatedAt: new Date().toISOString(),
            updatedBy: null
        };
        return this.db.insert(defaultSettings);
    }

    getSettings() {
        // Lade immer frisch aus der Datenbank
        this.db.reload();
        return this.findOne({ id: 'global' });
    }

    updateFeature(featureName, enabled, reason, userId) {
        this.db.reload();
        const settings = this.getSettings();
        
        if (settings.features[featureName]) {
            settings.features[featureName].enabled = enabled;
            settings.features[featureName].reason = reason || '';
            settings.updatedAt = new Date().toISOString();
            settings.updatedBy = userId;
            
            const result = this.db.updateOne({ id: 'global' }, settings);
            this.db.reload();
            return result;
        }
        
        return null;
    }

    setMaintenanceMode(enabled, message, userId) {
        this.db.reload();
        const settings = this.getSettings();
        
        console.log('[GlobalSettings] setMaintenanceMode VOR Update:', {
            maintenanceMode: settings.maintenanceMode,
            enabled: enabled
        });
        
        settings.maintenanceMode = enabled;
        if (message) settings.maintenanceMessage = message;
        settings.updatedAt = new Date().toISOString();
        settings.updatedBy = userId;
        
        const result = this.db.updateOne({ id: 'global' }, settings);
        this.db.reload();
        
        console.log('[GlobalSettings] setMaintenanceMode NACH Update:', {
            maintenanceMode: result.maintenanceMode,
            saved: result !== null
        });
        
        return result;
    }

    isFeatureEnabled(featureName) {
        const settings = this.getSettings();
        
        // Maintenance Mode überschreibt alles
        if (settings.maintenanceMode) return false;
        
        // Check specific feature
        if (settings.features[featureName]) {
            return settings.features[featureName].enabled;
        }
        
        return true; // Default: enabled
    }

    canBypassMaintenance(userId) {
        const settings = this.getSettings();
        const hasAccess = settings.adminBypass && settings.adminBypass.includes(userId);
        console.log('[canBypassMaintenance] UserID:', userId);
        console.log('[canBypassMaintenance] Bypass List:', settings.adminBypass);
        console.log('[canBypassMaintenance] Has Access:', hasAccess);
        return hasAccess;
    }

    addAdminBypass(userId) {
        const settings = this.getSettings();
        if (!settings.adminBypass) settings.adminBypass = [];
        if (!settings.adminBypass.includes(userId)) {
            settings.adminBypass.push(userId);
            return this.save(settings);
        }
        return settings;
    }

    removeAdminBypass(userId) {
        const settings = this.getSettings();
        if (settings.adminBypass) {
            settings.adminBypass = settings.adminBypass.filter(id => id !== userId);
            return this.save(settings);
        }
        return settings;
    }

    save(settings) {
        const result = this.db.updateOne({ id: 'global' }, settings);
        this.db.reload();
        return result;
    }
}

module.exports = new GlobalSettings();
