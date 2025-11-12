const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../../models/Ticket');

module.exports = {
    id: 'ticket_assign_user',
    async execute(interaction) {
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

        const selectedUserId = interaction.values[0];
        const selectedUser = await interaction.guild.members.fetch(selectedUserId);

        // Ticket zuweisen
        const previousClaimer = ticket.claimedBy;
        ticket.claimedBy = selectedUserId;
        ticket.claimedAt = new Date().toISOString();
        await Ticket.save(ticket);

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({ 
                name: 'Ticket zugewiesen',
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`📌 ${interaction.user} hat das Ticket an ${selectedUser} zugewiesen!`)
            .addFields(
                { name: '👤 Neuer Bearbeiter', value: `${selectedUser}`, inline: true },
                { name: '⏰ Zugewiesen am', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setTimestamp();

        await interaction.update({ embeds: [embed], components: [] });

        // Sende Nachricht im Ticket-Channel
        const channelEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setDescription(`📌 **Ticket wurde zugewiesen**\n\n${selectedUser} ist jetzt für dieses Ticket verantwortlich.`)
            .setTimestamp();

        await interaction.channel.send({ content: selectedUser.toString(), embeds: [channelEmbed] });

        // Update Buttons
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
