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
        const member = interaction.guild.members.cache.get(target.id);
        
        let userData = await User.findOne({ 
            userId: target.id, 
            guildId: interaction.guild.id 
        });

        if (!userData) {
            userData = { level: 0, xp: 0 };
        }

        const currentLevelXP = Math.pow(userData.level / 0.1, 2);
        const nextLevelXP = Math.pow((userData.level + 1) / 0.1, 2);
        const xpNeeded = nextLevelXP - currentLevelXP;
        const xpProgress = userData.xp - currentLevelXP;
        const progress = (xpProgress / xpNeeded * 100).toFixed(1);
        
        // Erstelle visuellen Fortschrittsbalken
        const progressBarLength = 20;
        const filledLength = Math.floor((xpProgress / xpNeeded) * progressBarLength);
        const emptyLength = progressBarLength - filledLength;
        const progressBar = '▰'.repeat(filledLength) + '▱'.repeat(emptyLength);

        // Berechne Rank (Position im Server)
        const allUsers = await User.find({ guildId: interaction.guild.id });
        const sortedUsers = allUsers.sort((a, b) => b.xp - a.xp);
        const rank = sortedUsers.findIndex(u => u.userId === target.id) + 1;

        // Level-Titel basierend auf Level
        const getLevelTitle = (level) => {
            if (level === 0) return '🌱 Neuling';
            if (level < 5) return '🌿 Anfänger';
            if (level < 10) return '⚡ Aktiv';
            if (level < 20) return '🔥 Fleißig';
            if (level < 30) return '💫 Fortgeschritten';
            if (level < 50) return '⭐ Experte';
            if (level < 75) return '💎 Meister';
            if (level < 100) return '👑 Champion';
            return '🏆 Legende';
        };

        const embed = new EmbedBuilder()
            .setColor(member?.displayHexColor || '#5865F2')
            .setAuthor({ 
                name: `${target.username}'s Level & XP`,
                iconURL: target.displayAvatarURL()
            })
            .setThumbnail(target.displayAvatarURL({ size: 256 }))
            .setDescription(`**${getLevelTitle(userData.level)}**`)
            .addFields(
                { name: '📊 Level', value: `\`${userData.level}\``, inline: true },
                { name: '💎 Gesamt XP', value: `\`${userData.xp.toLocaleString()}\``, inline: true },
                { name: '� Rang', value: rank > 0 ? `\`#${rank}\`` : '`Unranked`', inline: true },
                { 
                    name: '📈 Fortschritt zum nächsten Level', 
                    value: `${progressBar}\n\`${xpProgress.toLocaleString()}/${xpNeeded.toLocaleString()} XP (${progress}%)\``, 
                    inline: false 
                },
                { name: '🎯 XP bis Level ' + (userData.level + 1), value: `Noch \`${Math.ceil(nextLevelXP - userData.xp).toLocaleString()}\` XP benötigt`, inline: false }
            )
            .setFooter({ text: `Abgefragt von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
