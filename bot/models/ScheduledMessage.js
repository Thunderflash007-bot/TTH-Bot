const Database = require('../utils/database');

class ScheduledMessage {
    constructor() {
        this.db = new Database('scheduledmessages');
    }

    findOne(query) {
        return this.db.findOne(query);
    }

    find(query) {
        return this.db.find(query);
    }

    save(data) {
        if (data._id) {
            return this.db.updateOne({ _id: data._id }, data);
        }
        return this.db.insert({
            ...data,
            createdAt: new Date(),
            enabled: data.enabled !== false
        });
    }

    delete(query) {
        return this.db.deleteOne(query);
    }

    countDocuments(query) {
        return this.db.count(query);
    }
}

module.exports = new ScheduledMessage();
