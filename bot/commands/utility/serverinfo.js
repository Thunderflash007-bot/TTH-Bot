const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Zeigt Informationen über den Server'),
    
    async execute(interaction) {
        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📊 Server-Info: ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '🆔 Server ID', value: guild.id, inline: true },
                { name: '👑 Besitzer', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Erstellt am', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                { name: '👥 Mitglieder', value: `${guild.memberCount}`, inline: true },
                { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🎭 Rollen', value: `${guild.roles.cache.size}`, inline: true },
                { name: '😊 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`, inline: true }
            )
            .setFooter({ text: `Abgefragt von ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
