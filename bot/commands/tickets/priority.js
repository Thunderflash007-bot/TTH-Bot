const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('priority')
        .setDescription('Setzt die Priorität eines Tickets')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option.setName('stufe')
                .setDescription('Prioritätsstufe')
                .setRequired(true)
                .addChoices(
                    { name: '🟢 Niedrig', value: 'low' },
                    { name: '🟠 Mittel', value: 'medium' },
                    { name: '🔴 Hoch', value: 'high' }
                )),
    
    async execute(interaction) {
        // Prüfe ob in Ticket-Channel
        const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
        
        if (!ticket) {
            return await interaction.reply({ 
                content: '❌ Dieser Command kann nur in Ticket-Channels verwendet werden!', 
                ephemeral: true 
            });
        }
        
        const priority = interaction.options.getString('stufe');
        const priorityEmojis = { low: '🟢', medium: '🟠', high: '🔴' };
        const priorityNames = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' };
        
        // Update Ticket
        ticket.priority = priority;
        Ticket.save(ticket);
        
        // Update Channel Name
        const emoji = priorityEmojis[priority];
        const newName = `${emoji}ticket-${ticket.userId.slice(-4)}`;
        await interaction.channel.setName(newName);
        
        // Embed senden
        const embed = new EmbedBuilder()
            .setColor(priority === 'high' ? '#ED4245' : priority === 'medium' ? '#FEE75C' : '#57F287')
            .setDescription(`${emoji} Ticket-Priorität wurde auf **${priorityNames[priority]}** gesetzt!`)
            .setFooter({ text: `Gesetzt von ${interaction.user.tag}` })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
