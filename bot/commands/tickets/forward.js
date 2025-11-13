const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forward')
        .setDescription('Leitet ein Ticket an einen anderen Fachbereich weiter')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addRoleOption(option =>
            option.setName('fachbereich')
                .setDescription('Team-Rolle des Fachbereichs')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grund')
                .setDescription('Grund der Weiterleitung')
                .setRequired(false)),
    
    async execute(interaction) {
        // Prüfe ob in Ticket-Channel
        const ticket = Ticket.findOne({ channelId: interaction.channel.id });
        
        if (!ticket) {
            return await interaction.reply({ 
                content: '❌ Dieser Command kann nur in Ticket-Channels verwendet werden!', 
                ephemeral: true 
            });
        }
        
        const targetRole = interaction.options.getRole('fachbereich');
        const reason = interaction.options.getString('grund') || 'Weiterleitung an zuständigen Fachbereich';
        
        // Gebe neuer Rolle Zugriff
        await interaction.channel.permissionOverwrites.edit(targetRole, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });
        
        // Ping die neue Rolle
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🔄 Ticket weitergeleitet')
            .setDescription(`Dieses Ticket wurde an ${targetRole} weitergeleitet.`)
            .addFields(
                { name: '📝 Grund', value: reason, inline: false },
                { name: '👤 Weitergeleitet von', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();
        
        await interaction.channel.send({ 
            content: `${targetRole}`,
            embeds: [embed] 
        });
        
        await interaction.reply({ 
            content: `✅ Ticket wurde an ${targetRole} weitergeleitet!`, 
            ephemeral: true 
        });
    }
};
