const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-tickets')
        .setDescription('Erstellt das Ticket-Panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 Ticket & Bewerbungs-System')
            .setDescription('Klicke auf einen der Buttons unten, um:\n\n🎟️ **Ticket öffnen** - Support anfragen\n📋 **Bewerbung senden** - Für ein Team bewerben')
            .setFooter({ text: 'TTH-Bot Ticket System' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_open')
                    .setLabel('Ticket öffnen')
                    .setEmoji('🎟️')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('application_open')
                    .setLabel('Bewerbung senden')
                    .setEmoji('📋')
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Ticket-Panel wurde erstellt!', ephemeral: true });
    }
};
