const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Zeigt Informationen über einen User')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User')
                .setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id);
        const userData = await User.findOne({ userId: target.id, guildId: interaction.guild.id });

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📊 User-Info: ${target.tag}`)
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: '🆔 ID', value: target.id, inline: true },
                { name: '📅 Account erstellt', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Server beigetreten', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '⭐ Level', value: userData ? `${userData.level}` : '0', inline: true },
                { name: '💎 XP', value: userData ? `${userData.xp}` : '0', inline: true },
                { name: '🎭 Rollen', value: member.roles.cache.map(r => r).join(' ').slice(0, 1024) || 'Keine' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
