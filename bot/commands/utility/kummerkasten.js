const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const Kummerkasten = require('../../models/Kummerkasten');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kummerkasten')
        .setDescription('Sendet eine anonyme Nachricht an das Support-Team'),
    
    async execute(interaction) {
        const config = GuildConfig.findOne({ guildId: interaction.guild.id });
        
        if (!config || !config.kummerkastenChannelId) {
            return await interaction.reply({
                content: '❌ Kummerkasten ist nicht eingerichtet!',
                ephemeral: true
            });
        }
        
        // Modal erstellen
        const modal = new ModalBuilder()
            .setCustomId('kummerkasten_modal')
            .setTitle('📬 Kummerkasten - Anonyme Nachricht');
        
        const messageInput = new TextInputBuilder()
            .setCustomId('kummerkasten_message')
            .setLabel('Deine Nachricht')
            .setPlaceholder('Schreibe hier deine anonyme Nachricht...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(2000);
        
        const row = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(row);
        
        await interaction.showModal(modal);
    }
};
