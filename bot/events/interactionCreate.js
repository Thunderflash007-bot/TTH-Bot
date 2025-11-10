module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
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
            const buttonId = interaction.customId.split('_')[0];
            const button = client.buttons.get(buttonId);
            if (button) {
                try {
                    await button.execute(interaction, client);
                } catch (error) {
                    console.error(error);
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
    }
};
