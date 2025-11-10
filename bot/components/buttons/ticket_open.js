const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    id: 'ticket',
    async execute(interaction) {
        // Prüfen ob User bereits ein offenes Ticket hat
        const existingTicket = await Ticket.findOne({
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            status: 'open'
        });

        if (existingTicket) {
            return interaction.reply({ 
                content: '❌ Du hast bereits ein offenes Ticket!', 
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            
            // Ticket Channel erstellen
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: config?.ticketCategoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            // Ticket in DB speichern
            await Ticket.save({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                channelId: channel.id,
                type: 'support',
                status: 'open'
            });

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎫 Support Ticket')
                .setDescription(`Hallo ${interaction.user}!\n\nUnser Team wird sich bald um dein Anliegen kümmern.\nBitte beschreibe dein Problem.`)
                .setFooter({ text: 'Nutze /close um das Ticket zu schließen' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_close')
                        .setLabel('Ticket schließen')
                        .setEmoji('🔒')
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
            await interaction.editReply({ content: `✅ Ticket wurde erstellt: ${channel}` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Fehler beim Erstellen des Tickets!' });
        }
    }
};
