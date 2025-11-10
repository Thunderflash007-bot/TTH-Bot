const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Löscht eine Anzahl an Nachrichten')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Anzahl der zu löschenden Nachrichten (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        try {
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `✅ ${amount} Nachrichten wurden gelöscht!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Fehler beim Löschen der Nachrichten!', ephemeral: true });
        }
    }
};
