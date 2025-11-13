const { EmbedBuilder } = require('discord.js');
const GlobalSettings = require('../models/GlobalSettings');

/**
 * Middleware für Command-Checks
 * Prüft ob Feature global aktiviert ist
 */
function checkFeature(featureName) {
    return async (interaction) => {
        const settings = GlobalSettings.getSettings();
        
        // Maintenance Mode Check (mit Admin-Bypass)
        if (settings.maintenanceMode) {
            // Prüfe ob User Admin-Bypass hat
            if (!GlobalSettings.canBypassMaintenance(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🔧 Wartungsmodus')
                    .setDescription(settings.maintenanceMessage || 'Der Bot befindet sich im Wartungsmodus.')
                    .setFooter({ text: 'Bitte versuche es später erneut' })
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return false;
            }
        }
        
        // Feature Check (auch mit Admin-Bypass)
        if (!GlobalSettings.isFeatureEnabled(featureName)) {
            // Admin-Bypass gilt auch für einzelne Features
            if (!GlobalSettings.canBypassMaintenance(interaction.user.id)) {
                const reason = settings.features[featureName]?.reason || 'Dieses Feature ist vorübergehend deaktiviert.';
                
                const embed = new EmbedBuilder()
                    .setColor('#FEE75C')
                    .setTitle('⚠️ Feature deaktiviert')
                    .setDescription(`**${featureName}** ist derzeit deaktiviert.\n\n**Grund:** ${reason}`)
                    .setFooter({ text: 'Kontaktiere einen Administrator für weitere Informationen' })
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return false;
            }
        }
        
        return true; // Feature ist verfügbar oder User hat Bypass
    };
}

/**
 * Prüft Dashboard-Zugriff
 */
function checkDashboardAccess(userId) {
    const settings = GlobalSettings.getSettings();
    const hasBypass = GlobalSettings.canBypassMaintenance(userId);
    
    console.log('[checkDashboardAccess] UserID:', userId);
    console.log('[checkDashboardAccess] Maintenance Mode:', settings.maintenanceMode);
    console.log('[checkDashboardAccess] Has Bypass:', hasBypass);
    console.log('[checkDashboardAccess] Bypass List:', settings.adminBypass);
    
    // Wartungsmodus aktiv + kein Bypass
    if (settings.maintenanceMode && !hasBypass) {
        return {
            allowed: false,
            inMaintenance: true,
            message: settings.maintenanceMessage || 'Dashboard befindet sich im Wartungsmodus.'
        };
    }
    
    // Dashboard-Feature deaktiviert + kein Bypass
    if (!GlobalSettings.isFeatureEnabled('dashboard') && !GlobalSettings.canBypassMaintenance(userId)) {
        return {
            allowed: false,
            inMaintenance: false,
            message: settings.features.dashboard?.reason || 'Dashboard ist temporär deaktiviert.'
        };
    }
    
    return { allowed: true, inMaintenance: false };
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

module.exports = { checkFeature, withFeatureCheck, checkDashboardAccess };
