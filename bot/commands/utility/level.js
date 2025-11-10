const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Zeigt dein oder das Level eines anderen Users')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User')
                .setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        
        let userData = await User.findOne({ 
            userId: target.id, 
            guildId: interaction.guild.id 
        });

        if (!userData) {
            userData = { level: 0, xp: 0 };
        }

        const nextLevelXP = Math.pow((userData.level + 1) / 0.1, 2);
        const progress = (userData.xp / nextLevelXP * 100).toFixed(1);

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`⭐ Level von ${target.username}`)
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: '📊 Level', value: `${userData.level}`, inline: true },
                { name: '💎 XP', value: `${userData.xp}`, inline: true },
                { name: '🎯 Fortschritt', value: `${progress}%`, inline: true },
                { name: '🚀 Nächstes Level', value: `${Math.ceil(nextLevelXP - userData.xp)} XP fehlen`, inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
