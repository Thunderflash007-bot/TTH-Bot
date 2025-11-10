const Database = require('../utils/database');

class User {
    constructor() {
        this.db = new Database('users');
    }

    async findOne(query) {
        return this.db.findOne(query);
    }

    async save(data) {
        if (data._id) {
            return this.db.updateOne({ _id: data._id }, data);
        }
        return this.db.insert({
            ...data,
            xp: data.xp || 0,
            level: data.level || 0,
            coins: data.coins || 0,
            warnings: data.warnings || [],
            lastDaily: null
        });
    }
}

module.exports = new User();
