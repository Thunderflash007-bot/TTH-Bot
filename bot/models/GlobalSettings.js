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
                twitch: { enabled: true, reason: '' },
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
        return this.findOne({ id: 'global' });
    }

    updateFeature(featureName, enabled, reason, userId) {
        const settings = this.getSettings();
        
        if (settings.features[featureName]) {
            settings.features[featureName].enabled = enabled;
            settings.features[featureName].reason = reason || '';
            settings.updatedAt = new Date().toISOString();
            settings.updatedBy = userId;
            
            return this.db.updateOne({ id: 'global' }, settings);
        }
        
        return null;
    }

    setMaintenanceMode(enabled, message, userId) {
        const settings = this.getSettings();
        settings.maintenanceMode = enabled;
        if (message) settings.maintenanceMessage = message;
        settings.updatedAt = new Date().toISOString();
        settings.updatedBy = userId;
        
        return this.db.updateOne({ id: 'global' }, settings);
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

    save(settings) {
        return this.db.updateOne({ id: 'global' }, settings);
    }
}

module.exports = new GlobalSettings();
