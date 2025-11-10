const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    id: 'application',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('application_modal')
            .setTitle('📋 Bewerbungsformular');

        const nameInput = new TextInputBuilder()
            .setCustomId('app_name')
            .setLabel('Dein Name / Nickname')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50);

        const ageInput = new TextInputBuilder()
            .setCustomId('app_age')
            .setLabel('Dein Alter')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(3);

        const positionInput = new TextInputBuilder()
            .setCustomId('app_position')
            .setLabel('Für welche Position bewirbst du dich?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        const experienceInput = new TextInputBuilder()
            .setCustomId('app_experience')
            .setLabel('Erfahrungen / Qualifikationen')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        const motivationInput = new TextInputBuilder()
            .setCustomId('app_motivation')
            .setLabel('Warum möchtest du bei uns mitmachen?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        const rows = [nameInput, ageInput, positionInput, experienceInput, motivationInput].map(
            input => new ActionRowBuilder().addComponents(input)
        );

        modal.addComponents(...rows);
        await interaction.showModal(modal);
    }
};
