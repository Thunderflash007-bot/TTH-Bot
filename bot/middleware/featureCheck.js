const { EmbedBuilder } = require('discord.js');
const GlobalSettings = require('../models/GlobalSettings');

/**
 * Middleware für Command-Checks
 * Prüft ob Feature global aktiviert ist
 */
function checkFeature(featureName) {
    return async (interaction) => {
        const settings = GlobalSettings.getSettings();
        
        // Maintenance Mode Check
        if (settings.maintenanceMode) {
            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('🔧 Wartungsmodus')
                .setDescription(settings.maintenanceMessage || 'Der Bot befindet sich im Wartungsmodus.')
                .setFooter({ text: 'Bitte versuche es später erneut' });
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }
        
        // Feature Check
        if (!settings.features[featureName]?.enabled) {
            const reason = settings.features[featureName]?.reason || 'Dieses Feature ist vorübergehend deaktiviert.';
            
            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('❌ Feature deaktiviert')
                .setDescription(`**${featureName}** ist derzeit deaktiviert.\n\n**Grund:** ${reason}`)
                .setFooter({ text: 'Kontaktiere einen Administrator für weitere Informationen' });
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }
        
        return true; // Feature ist verfügbar
    };
}

/**
 * Decorator für Commands
 */
function withFeatureCheck(featureName) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(interaction) {
            const checker = checkFeature(featureName);
            const allowed = await checker(interaction);
            
            if (allowed) {
                return originalMethod.call(this, interaction);
            }
        };
        
        return descriptor;
    };
}

module.exports = { checkFeature, withFeatureCheck };
