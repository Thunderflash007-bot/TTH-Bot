const Database = require('../utils/database');
const db = new Database('warnings');

class Warning {
    static find(query = {}) {
        return db.find(query);
    }
    
    static findOne(query) {
        return db.findOne(query);
    }
    
    static create(data) {
        const newWarning = {
            id: Date.now().toString(),
            userId: data.userId,
            guildId: data.guildId,
            moderatorId: data.moderatorId,
            reason: data.reason,
            timestamp: new Date().toISOString(),
            active: true
        };
        
        return db.insert(newWarning);
    }
    
    static remove(id) {
        return db.deleteOne({ id });
    }
    
    static save(warning) {
        return db.updateOne({ id: warning.id }, warning);
    }
    
    static getUserWarnings(userId, guildId) {
        return this.find({ userId, guildId, active: true });
    }
    
    static getGuildWarnings(guildId) {
        return this.find({ guildId });
    }
}

module.exports = Warning;
