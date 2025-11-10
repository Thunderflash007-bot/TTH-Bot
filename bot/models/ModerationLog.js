const Database = require('../utils/database');

class ModerationLog {
    constructor() {
        this.db = new Database('moderationlogs');
    }

    async save(data) {
        return this.db.insert(data);
    }

    async find(query) {
        return this.db.find(query);
    }

    findSorted(query, limit) {
        return this.db.findSorted(query, 'createdAt', limit);
    }
}

module.exports = new ModerationLog();
