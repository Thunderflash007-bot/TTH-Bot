const { updateMemberNickname } = require('../utils/nicknamePrefixHandler');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        // Prüfe ob Rollen geändert wurden
        if (oldMember.roles.cache.size !== newMember.roles.cache.size ||
            !oldMember.roles.cache.equals(newMember.roles.cache)) {
            
            // Aktualisiere Nickname mit neuen Prefixes
            await updateMemberNickname(newMember);
        }
    }
};
