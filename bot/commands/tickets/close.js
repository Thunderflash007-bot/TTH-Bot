const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Schließt das aktuelle Ticket'),
    
    async execute(interaction) {
        const ticket = await Ticket.findOne({ channelId: interaction.channel.id, status: 'open' });
        
        if (!ticket) {
            return interaction.reply({ content: '❌ Dies ist kein offenes Ticket!', ephemeral: true });
        }

        ticket.status = 'closed';
        ticket.closedBy = interaction.user.id;
        ticket.closedAt = new Date().toISOString();
        await Ticket.save(ticket);

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🔒 Ticket geschlossen')
            .setDescription(`Ticket wurde von ${interaction.user} geschlossen.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (error) {
                console.error('Fehler beim Löschen des Channels:', error);
            }
        }, 5000);
    }
};
