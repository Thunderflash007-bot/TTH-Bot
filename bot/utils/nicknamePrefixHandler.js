const GuildConfig = require('../models/GuildConfig');

/**
 * Aktualisiert den Nickname eines Members basierend auf Auto-Prefixes
 * @param {GuildMember} member - Der Member dessen Nickname aktualisiert werden soll
 */
async function updateMemberNickname(member) {
    try {
        const config = GuildConfig.findOne({ guildId: member.guild.id });
        
        if (!config || !config.nicknamePrefixes || config.nicknamePrefixes.length === 0) {
            return;
        }
        
        // Finde alle Prefixes die für diesen User gelten
        const applicablePrefixes = [];
        for (const prefixData of config.nicknamePrefixes) {
            if (member.roles.cache.has(prefixData.roleId)) {
                applicablePrefixes.push(prefixData.prefix);
            }
        }
        
        // Original-Name (ohne alte Prefixes)
        let originalName = member.displayName;
        
        // Entferne alle vorhandenen Prefixes aus dem Namen
        for (const prefixData of config.nicknamePrefixes) {
            const regex = new RegExp(`^\\s*${escapeRegex(prefixData.prefix)}\\s*`, 'i');
            originalName = originalName.replace(regex, '').trim();
        }
        
        // Baue neuen Nickname mit Prefixes
        let newNickname = originalName;
        if (applicablePrefixes.length > 0) {
            newNickname = applicablePrefixes.join(' ') + ' ' + originalName;
        }
        
        // Nur ändern wenn unterschiedlich
        if (newNickname !== member.displayName && newNickname.length <= 32) {
            await member.setNickname(newNickname);
        }
        
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Nicknames:', error);
    }
}

/**
 * Hilfsfunktion zum Escapen von Regex-Sonderzeichen
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { updateMemberNickname };
