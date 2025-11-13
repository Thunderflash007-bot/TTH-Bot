const { EmbedBuilder } = require('discord.js');
const GlobalSettings = require('../models/GlobalSettings');
const { getFeatureForCommand, getFeatureForButton, getFeatureForModal } = require('../utils/featureMapping');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        const settings = GlobalSettings.getSettings();
        const hasBypass = GlobalSettings.canBypassMaintenance(interaction.user.id);
        
        // Global Maintenance Mode Check (mit Admin-Bypass)
        if (settings.maintenanceMode && !hasBypass) {
            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🔧 Wartungsmodus')
                .setDescription(settings.maintenanceMessage || 'Der Bot befindet sich im Wartungsmodus.')
                .setFooter({ text: 'Bitte versuche es später erneut' })
                .setTimestamp();
            
            if (interaction.replied || interaction.deferred) {
                return await interaction.followUp({ embeds: [embed], ephemeral: true });
            } else {
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
        
        // Slash Commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            // Feature-Check für Command
            const feature = getFeatureForCommand(interaction.commandName);
            if (feature && !hasBypass) {
                if (!GlobalSettings.isFeatureEnabled(feature)) {
                    const featureData = settings.features[feature];
                    const reason = featureData?.reason || 'Dieses Feature ist vorübergehend deaktiviert.';
                    
                    const embed = new EmbedBuilder()
                        .setColor('#FEE75C')
                        .setTitle('⚠️ Feature deaktiviert')
                        .setDescription(`**${feature}** ist derzeit deaktiviert.\n\n**Grund:** ${reason}`)
                        .setFooter({ text: 'Kontaktiere einen Administrator für weitere Informationen' })
                        .setTimestamp();
                    
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                const errorMessage = { content: '❌ Es gab einen Fehler bei der Ausführung!', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }

        // Buttons
        if (interaction.isButton()) {
            // Feature-Check für Button
            const feature = getFeatureForButton(interaction.customId);
            if (feature && !hasBypass) {
                if (!GlobalSettings.isFeatureEnabled(feature)) {
                    const featureData = settings.features[feature];
                    const reason = featureData?.reason || 'Dieses Feature ist vorübergehend deaktiviert.';
                    
                    const embed = new EmbedBuilder()
                        .setColor('#FEE75C')
                        .setTitle('⚠️ Feature deaktiviert')
                        .setDescription(`**${feature}** ist derzeit deaktiviert.\n\n**Grund:** ${reason}`)
                        .setFooter({ text: 'Kontaktiere einen Administrator für weitere Informationen' })
                        .setTimestamp();
                    
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
            
            // Versuche zuerst die volle customId, dann nur den ersten Teil
            let button = client.buttons.get(interaction.customId);
            if (!button) {
                const buttonId = interaction.customId.split('_')[0];
                button = client.buttons.get(buttonId);
            }
            
            if (button) {
                try {
                    await button.execute(interaction, client);
                } catch (error) {
                    console.error(error);
                    const errorMessage = { content: '❌ Es gab einen Fehler!', ephemeral: true };
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(errorMessage);
                    } else {
                        await interaction.reply(errorMessage);
                    }
                }
            }
        }

        // Modals
        if (interaction.isModalSubmit()) {
            // Feature-Check für Modal
            const feature = getFeatureForModal(interaction.customId);
            if (feature && !hasBypass) {
                if (!GlobalSettings.isFeatureEnabled(feature)) {
                    const featureData = settings.features[feature];
                    const reason = featureData?.reason || 'Dieses Feature ist vorübergehend deaktiviert.';
                    
                    const embed = new EmbedBuilder()
                        .setColor('#FEE75C')
                        .setTitle('⚠️ Feature deaktiviert')
                        .setDescription(`**${feature}** ist derzeit deaktiviert.\n\n**Grund:** ${reason}`)
                        .setFooter({ text: 'Kontaktiere einen Administrator für weitere Informationen' })
                        .setTimestamp();
                    
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
            
            const modalId = interaction.customId.split('_')[0];
            const modal = client.modals.get(modalId);
            if (modal) {
                try {
                    await modal.execute(interaction, client);
                } catch (error) {
                    console.error(error);
                }
            }
        }

        // Select Menus
        if (interaction.isStringSelectMenu() || interaction.isUserSelectMenu()) {
            const selectMenu = client.selectMenus.get(interaction.customId);
            if (selectMenu) {
                try {
                    await selectMenu.execute(interaction, client);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
};
