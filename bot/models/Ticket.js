const Database = require('../utils/database');

class Ticket {
    constructor() {
        this.db = new Database('tickets');
    }

    async findOne(query) {
        return this.db.findOne(query);
    }

    async find(query) {
        return this.db.find(query);
    }

    async save(data) {
        if (data._id) {
            return this.db.updateOne({ _id: data._id }, data);
        }
        return this.db.insert({
            ...data,
            type: data.type || 'support',
            status: data.status || 'open'
        });
    }

    async countDocuments(query) {
        return this.db.count(query);
    }

    findSorted(query, limit) {
        return this.db.findSorted(query, 'createdAt', limit);
    }
}

module.exports = new Ticket();
