const Database = require('../utils/database');

class GuildConfig {
    constructor() {
        this.db = new Database('guildconfigs');
    }

    async findOne(query) {
        let config = this.db.findOne(query);
        if (!config && query.guildId) {
            config = this.create(query.guildId);
        }
        return config;
    }

    create(guildId) {
        const defaultConfig = {
            guildId,
            prefix: '!',
            ticketCategoryId: null,
            applicationChannelId: null,
            welcomeChannelId: null,
            welcomeMessage: null,
            leaveChannelId: null,
            leaveMessage: null,
            logChannelId: null,
            muteRoleId: null,
            levelUpMessage: true,
            levelUpChannelId: null
        };
        return this.db.insert(defaultConfig);
    }

    async save(config) {
        if (config._id) {
            return this.db.updateOne({ _id: config._id }, config);
        }
        return this.db.insert(config);
    }
}

module.exports = new GuildConfig();
