const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    id: 'ticket_close',
    async execute(interaction) {
        console.log('ticket_close button clicked');
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
        const isCreator = interaction.user.id === ticket.userId;
        const hasManageChannels = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
        const hasSupportRole = config?.supportRoleId && 
            interaction.member.roles.cache.has(config.supportRoleId);

        if (!isCreator && !hasManageChannels && !hasSupportRole) {
            return interaction.reply({ 
                content: '❌ Du hast keine Berechtigung dieses Ticket zu schließen!', 
                ephemeral: true 
            });
        }

        ticket.status = 'closed';
        ticket.closedBy = interaction.user.id;
        ticket.closedAt = new Date().toISOString();
        await Ticket.save(ticket);

        const ticketUser = await interaction.guild.members.fetch(ticket.userId).catch(() => null);

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setAuthor({ 
                name: 'Ticket wird geschlossen',
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription('📝 **Dieses Ticket wurde geschlossen**\n\nDer Channel wird in 10 Sekunden gelöscht.')
            .addFields(
                { name: '👤 Geschlossen von', value: `${interaction.user}`, inline: true },
                { name: '⏰ Geschlossen am', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            )
            .setFooter({ text: `Ticket von ${ticketUser?.user.tag || 'Unbekannt'}` })
            .setTimestamp();

        await interaction.update({ embeds: [embed], components: [] });

        // Sende DM an Ticket-Ersteller
        if (ticketUser && ticketUser.id !== interaction.user.id) {
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🔒 Dein Ticket wurde geschlossen')
                    .setDescription(`Dein Ticket auf **${interaction.guild.name}** wurde geschlossen.`)
                    .addFields(
                        { name: '👮 Geschlossen von', value: interaction.user.tag, inline: false }
                    )
                    .setTimestamp();
                await ticketUser.send({ embeds: [dmEmbed] });
            } catch (err) {
                // User hat DMs deaktiviert
            }
        }

        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (error) {
                console.error('Fehler beim Löschen des Channels:', error);
            }
        }, 10000);
    }
};
