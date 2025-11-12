const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Löscht eine Anzahl an Nachrichten')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Anzahl der zu löschenden Nachrichten (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Nur Nachrichten von diesem User löschen')
                .setRequired(false)),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');

        await interaction.deferReply({ ephemeral: true });

        try {
            let deleted = 0;
            
            if (targetUser) {
                // Lösche nur Nachrichten von einem bestimmten User
                let fetched;
                let totalDeleted = 0;
                
                do {
                    fetched = await interaction.channel.messages.fetch({ limit: 100 });
                    const userMessages = fetched.filter(msg => msg.author.id === targetUser.id);
                    const toDelete = Array.from(userMessages.values()).slice(0, amount - totalDeleted);
                    
                    if (toDelete.length === 0) break;
                    
                    const deletedMessages = await interaction.channel.bulkDelete(toDelete, true);
                    totalDeleted += deletedMessages.size;
                    
                    if (totalDeleted >= amount) break;
                } while (fetched.size >= 2 && totalDeleted < amount);
                
                deleted = totalDeleted;
            } else {
                // Lösche einfach die letzten X Nachrichten
                const deletedMessages = await interaction.channel.bulkDelete(amount, true);
                deleted = deletedMessages.size;
            }

            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setAuthor({ 
                    name: 'Nachrichten gelöscht',
                    iconURL: interaction.guild.iconURL()
                })
                .setDescription(`🗑️ **${deleted}** Nachricht${deleted !== 1 ? 'en' : ''} ${targetUser ? `von ${targetUser}` : ''} wurde${deleted !== 1 ? 'n' : ''} gelöscht.`)
                .addFields(
                    { name: '👮 Moderator', value: `${interaction.user}`, inline: true },
                    { name: '📝 Channel', value: `${interaction.channel}`, inline: true }
                )
                .setFooter({ text: `User-ID: ${interaction.user.id}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Lösche die Antwort nach 5 Sekunden
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (err) {
                    // Nachricht wurde bereits gelöscht
                }
            }, 5000);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Fehler beim Löschen der Nachrichten! (Nachrichten könnten älter als 14 Tage sein)' });
        }
    }
};
