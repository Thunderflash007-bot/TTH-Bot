const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    id: 'ticket_unclaim',
    async execute(interaction) {
        console.log('ticket_unclaim button clicked');
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

        // Prüfe ob Ticket claimed ist
        if (!ticket.claimedBy) {
            return interaction.reply({ 
                content: '❌ Dieses Ticket wurde nicht übernommen!', 
                ephemeral: true 
            });
        }

        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        
        // Nur der Claimer oder Admins können unclaimen
        const isClaimer = interaction.user.id === ticket.claimedBy;
        const hasManageChannels = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);

        if (!isClaimer && !hasManageChannels) {
            return interaction.reply({ 
                content: '❌ Nur der Bearbeiter oder ein Admin kann dieses Ticket freigeben!', 
                ephemeral: true 
            });
        }

        const previousClaimer = await interaction.guild.members.fetch(ticket.claimedBy).catch(() => null);

        // Ticket freigeben
        ticket.claimedBy = null;
        ticket.claimedAt = null;
        await Ticket.save(ticket);

        const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setAuthor({ 
                name: 'Ticket freigegeben',
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`🔓 ${interaction.user} hat das Ticket freigegeben.\n\n` +
                `Vorheriger Bearbeiter: ${previousClaimer || 'Unbekannt'}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Update Buttons - Claim aktivieren, Unclaim deaktivieren
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
                    .setDisabled(false)
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

        // Update erste Nachricht
        const messages = await interaction.channel.messages.fetch({ limit: 50 });
        const firstMessage = messages.last();
        if (firstMessage && firstMessage.author.id === interaction.client.user.id) {
            await firstMessage.edit({ components: [row1, row2] });
        }
    }
};
