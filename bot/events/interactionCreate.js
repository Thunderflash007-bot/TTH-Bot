const { EmbedBuilder } = require('discord.js');
const GlobalSettings = require('../models/GlobalSettings');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Global Maintenance Mode Check
        const settings = GlobalSettings.getSettings();
        
        if (settings.maintenanceMode && interaction.user.id !== '465490004601151498') {
            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('🔧 Wartungsmodus')
                .setDescription(settings.maintenanceMessage || 'Der Bot befindet sich im Wartungsmodus.')
                .setFooter({ text: 'Bitte versuche es später erneut' });
            
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
