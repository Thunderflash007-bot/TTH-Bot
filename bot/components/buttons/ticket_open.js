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
                .setAuthor({ 
                    name: 'Support Ticket erstellt',
                    iconURL: interaction.guild.iconURL()
                })
                .setDescription(`👋 Willkommen ${interaction.user}!\n\n` +
                    `Danke, dass du ein Ticket eröffnet hast. Unser Support-Team wurde benachrichtigt und wird sich schnellstmöglich um dein Anliegen kümmern.\n\n` +
                    `**📝 Bitte beschreibe dein Problem so detailliert wie möglich:**\n` +
                    `• Was ist passiert?\n` +
                    `• Wann ist es aufgetreten?\n` +
                    `• Hast du Screenshots oder weitere Infos?\n\n` +
                    `*Je mehr Informationen du gibst, desto schneller können wir dir helfen!*`)
                .addFields(
                    { name: '🎫 Ticket-ID', value: `\`${channel.id}\``, inline: true },
                    { name: '📅 Erstellt', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '👤 Ersteller', value: `${interaction.user}`, inline: true }
                )
                .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
                .setFooter({ text: 'Nutze /close <grund> um das Ticket zu schließen' })
                .setTimestamp();

            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_close')
                        .setLabel('Ticket schließen')
                        .setEmoji('🔒')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ticket_claim')
                        .setLabel('Ticket übernehmen')
                        .setEmoji('✋')
                        .setStyle(ButtonStyle.Success)
                );

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_unclaim')
                        .setLabel('Ticket freigeben')
                        .setEmoji('🔓')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('ticket_assign')
                        .setLabel('Ticket zuweisen')
                        .setEmoji('👤')
                        .setStyle(ButtonStyle.Primary)
                );

            // Support-Rolle erwähnen falls vorhanden
            let supportMention = '';
            if (config?.supportRoleId) {
                const supportRole = interaction.guild.roles.cache.get(config.supportRoleId);
                if (supportRole) {
                    supportMention = `${supportRole} `;
                }
            }

            await channel.send({ 
                content: `${supportMention}${interaction.user}`, 
                embeds: [embed], 
                components: [row1, row2] 
            });

            const successEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ **Ticket erfolgreich erstellt!**\n\n${channel}`)
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Fehler beim Erstellen des Tickets!' });
        }
    }
};
