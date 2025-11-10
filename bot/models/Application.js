const Database = require('../utils/database');

class Application {
    constructor() {
        this.db = new Database('applications');
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
            status: data.status || 'pending',
            reviewedBy: null,
            reviewedAt: null
        });
    }

    async countDocuments(query) {
        return this.db.count(query);
    }

    findSorted(query, limit) {
        return this.db.findSorted(query, 'createdAt', limit);
    }
}

module.exports = new Application();
