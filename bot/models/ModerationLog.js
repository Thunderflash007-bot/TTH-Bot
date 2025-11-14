const Database = require('../utils/database');

class ModerationLog {
    constructor() {
        this.db = new Database('moderationlogs');
    }

    create(data) {
        const log = {
            id: Date.now().toString(),
            guildId: data.guildId,
            userId: data.userId,
            moderatorId: data.moderatorId,
            action: data.action,
            reason: data.reason || 'Kein Grund angegeben',
            timestamp: new Date().toISOString()
        };
        return this.db.insert(log);
    }

    save(data) {
        return this.db.insert(data);
    }

    find(query) {
        return this.db.find(query);
    }

    findSorted(query, limit) {
        return this.db.findSorted(query, 'createdAt', limit);
    }
}

module.exports = new ModerationLog();
