const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    id: 'ticket_assign',
    async execute(interaction) {
        console.log('ticket_assign button clicked');
        const ticket = await Ticket.findOne({ 
            channelId: interaction.channel.id, 
            status: 'open' 
        });
        
        if (!ticket) {
            return interaction.reply({ 
                content: '❌ Dies ist kein offenes Ticket!', 
                ephemeral: true 
            });
        }

        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        
        // Prüfe ob User berechtigt ist
        const hasManageChannels = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
        const hasSupportRole = config?.supportRoleId && 
            interaction.member.roles.cache.has(config.supportRoleId);

        if (!hasManageChannels && !hasSupportRole) {
            return interaction.reply({ 
                content: '❌ Du benötigst die Support-Rolle um Tickets zuzuweisen!', 
                ephemeral: true 
            });
        }

        // Erstelle User Select Menu
        const row = new ActionRowBuilder()
            .addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId('ticket_assign_user')
                    .setPlaceholder('Wähle einen User aus')
                    .setMinValues(1)
                    .setMaxValues(1)
            );

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription('👤 **Wähle einen User aus**, dem dieses Ticket zugewiesen werden soll.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
