const Database = require('../utils/database');

class CustomCommand {
    constructor() {
        this.db = new Database('customcommands');
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
            enabled: data.enabled !== false,
            uses: 0
        });
    }

    delete(query) {
        return this.db.deleteOne(query);
    }

    incrementUses(commandId) {
        const command = this.findOne({ _id: commandId });
        if (command) {
            command.uses = (command.uses || 0) + 1;
            this.save(command);
        }
    }
}

module.exports = new CustomCommand();
