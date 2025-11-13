const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const BugReport = require('../../models/BugReport');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bugreport')
        .setDescription('Melde einen Bug oder Fehler im Bot'),
    
    async execute(interaction) {
        // Modal für Bug-Report erstellen
        const modal = new ModalBuilder()
            .setCustomId('bugreport_modal')
            .setTitle('🐛 Bug Report');

        const titleInput = new TextInputBuilder()
            .setCustomId('bug_title')
            .setLabel('Kurze Beschreibung des Bugs')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('z.B. Ticket lässt sich nicht schließen')
            .setRequired(true)
            .setMaxLength(100);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('bug_description')
            .setLabel('Detaillierte Beschreibung')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Was ist das Problem? Wie zeigt sich der Bug?')
            .setRequired(true)
            .setMaxLength(1000);

        const stepsInput = new TextInputBuilder()
            .setCustomId('bug_steps')
            .setLabel('Schritte zur Reproduktion (optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('1. Öffne...\n2. Klicke auf...\n3. ...')
            .setRequired(false)
            .setMaxLength(500);

        const expectedInput = new TextInputBuilder()
            .setCustomId('bug_expected')
            .setLabel('Erwartetes Verhalten (optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Was sollte eigentlich passieren?')
            .setRequired(false)
            .setMaxLength(300);

        const actualInput = new TextInputBuilder()
            .setCustomId('bug_actual')
            .setLabel('Tatsächliches Verhalten (optional)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Was passiert stattdessen?')
            .setRequired(false)
            .setMaxLength(300);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(stepsInput),
            new ActionRowBuilder().addComponents(expectedInput),
            new ActionRowBuilder().addComponents(actualInput)
        );

        await interaction.showModal(modal);
    }
};
