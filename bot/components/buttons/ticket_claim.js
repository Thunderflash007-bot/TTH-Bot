const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../../models/Ticket');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    id: 'ticket_claim',
    async execute(interaction) {
        console.log('ticket_claim button clicked');
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
        
        // Prüfe ob User berechtigt ist (Support-Rolle oder Manage Channels)
        const hasManageChannels = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
        const hasSupportRole = config?.supportRoleId && 
            interaction.member.roles.cache.has(config.supportRoleId);

        if (!hasManageChannels && !hasSupportRole) {
            return interaction.reply({ 
                content: '❌ Du benötigst die Support-Rolle um Tickets zu übernehmen!', 
                ephemeral: true 
            });
        }

        // Prüfe ob Ticket bereits claimed ist
        if (ticket.claimedBy) {
            const claimedUser = await interaction.guild.members.fetch(ticket.claimedBy).catch(() => null);
            return interaction.reply({ 
                content: `❌ Dieses Ticket wurde bereits von ${claimedUser || 'jemandem'} übernommen!`, 
                ephemeral: true 
            });
        }

        // Ticket claimen
        ticket.claimedBy = interaction.user.id;
        ticket.claimedAt = new Date().toISOString();
        await Ticket.save(ticket);

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setAuthor({ 
                name: 'Ticket übernommen',
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`✅ ${interaction.user} hat dieses Ticket übernommen und wird sich darum kümmern!`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Update Buttons - Unclaim aktivieren, Claim deaktivieren
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
                    .setDisabled(true)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_unclaim')
                    .setLabel('Ticket freigeben')
                    .setEmoji('🔓')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(false),
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
