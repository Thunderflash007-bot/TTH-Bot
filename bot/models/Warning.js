const db = require('../utils/database');

class Warning {
    static find(query = {}) {
        const warnings = db.getData('/warnings') || [];
        
        if (Object.keys(query).length === 0) {
            return warnings;
        }
        
        return warnings.filter(warning => {
            return Object.keys(query).every(key => warning[key] === query[key]);
        });
    }
    
    static findOne(query) {
        const warnings = this.find(query);
        return warnings.length > 0 ? warnings[0] : null;
    }
    
    static create(data) {
        const warnings = db.getData('/warnings') || [];
        const newWarning = {
            id: Date.now().toString(),
            userId: data.userId,
            guildId: data.guildId,
            moderatorId: data.moderatorId,
            reason: data.reason,
            timestamp: new Date().toISOString(),
            active: true
        };
        
        warnings.push(newWarning);
        db.setData('/warnings', warnings);
        return newWarning;
    }
    
    static remove(id) {
        const warnings = db.getData('/warnings') || [];
        const filtered = warnings.filter(w => w.id !== id);
        db.setData('/warnings', filtered);
        return filtered.length < warnings.length;
    }
    
    static save(warning) {
        const warnings = db.getData('/warnings') || [];
        const index = warnings.findIndex(w => w.id === warning.id);
        
        if (index !== -1) {
            warnings[index] = warning;
            db.setData('/warnings', warnings);
        }
        
        return warning;
    }
    
    static getUserWarnings(userId, guildId) {
        return this.find({ userId, guildId, active: true });
    }
    
    static getGuildWarnings(guildId) {
        return this.find({ guildId });
    }
}

module.exports = Warning;
