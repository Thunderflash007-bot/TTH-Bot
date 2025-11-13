const Database = require('../utils/database');

class CustomCommand {
    constructor() {
        this.db = new Database('customcommands');
    }

    findOne(query) {
        return this.db.findOne(query);
    }

    find(query = {}) {
        return this.db.find(query);
    }

    save(data) {
        // Validierung
        if (!data.name || !data.response || !data.guildId) {
            throw new Error('Name, Response und GuildId sind erforderlich');
        }
        
        // Name formatieren
        data.name = data.name.toLowerCase().trim().replace(/\s+/g, '-');
        
        // Prüfe auf Duplikate
        if (!data._id) {
            const existing = this.findOne({ guildId: data.guildId, name: data.name });
            if (existing) {
                throw new Error(`Command "${data.name}" existiert bereits!`);
            }
        }
        
        if (data._id) {
            return this.db.updateOne({ _id: data._id }, data);
        }
        
        return this.db.insert({
            ...data,
            createdAt: new Date().toISOString(),
            enabled: data.enabled !== false,
            uses: 0,
            lastUsed: null
        });
    }

    delete(query) {
        return this.db.deleteOne(query);
    }

    incrementUses(commandId) {
        const command = this.findOne({ _id: commandId });
        if (command) {
            command.uses = (command.uses || 0) + 1;
            command.lastUsed = new Date().toISOString();
            this.db.updateOne({ _id: commandId }, command);
        }
    }
    
    getTopCommands(guildId, limit = 10) {
        return this.db.findSorted({ guildId }, 'uses', limit);
    }
}

module.exports = new CustomCommand();
