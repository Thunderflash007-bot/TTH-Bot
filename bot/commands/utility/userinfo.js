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

        // Badges basierend auf Flags
        const badges = [];
        if (target.flags) {
            const flagsArray = target.flags.toArray();
            const badgeMap = {
                'Staff': '👨‍💼',
                'Partner': '🤝',
                'Hypesquad': '💎',
                'BugHunterLevel1': '🐛',
                'BugHunterLevel2': '🐞',
                'HypeSquadOnlineHouse1': '<:bravery:123>',
                'HypeSquadOnlineHouse2': '<:brilliance:123>',
                'HypeSquadOnlineHouse3': '<:balance:123>',
                'PremiumEarlySupporter': '⏰',
                'VerifiedDeveloper': '✅'
            };
            flagsArray.forEach(flag => {
                if (badgeMap[flag]) badges.push(badgeMap[flag]);
            });
        }

        // Status
        const statusMap = {
            'online': '🟢 Online',
            'idle': '🟡 Abwesend',
            'dnd': '🔴 Nicht stören',
            'offline': '⚫ Offline'
        };

        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor || '#5865F2')
            .setAuthor({ 
                name: `Userinfo für ${target.tag}`,
                iconURL: target.displayAvatarURL()
            })
            .setThumbnail(target.displayAvatarURL({ size: 512 }))
            .setDescription(badges.length > 0 ? badges.join(' ') : null)
            .addFields(
                { name: '👤 Erwähnung', value: `${target}`, inline: true },
                { name: '🆔 User ID', value: `\`${target.id}\``, inline: true },
                { name: '🤖 Bot?', value: target.bot ? '✅ Ja' : '❌ Nein', inline: true },
                { name: '📅 Account erstellt', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>\n<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Server beigetreten', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>\n<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '📊 Status', value: statusMap[member.presence?.status || 'offline'], inline: true },
                { name: '⭐ Level', value: `\`${userData?.level || 0}\``, inline: true },
                { name: '💎 XP', value: `\`${userData?.xp || 0}\``, inline: true },
                { name: '🎨 Höchste Rolle', value: member.roles.highest.toString(), inline: true },
                { name: `🎭 Rollen [${member.roles.cache.size - 1}]`, value: member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r).join(' ').slice(0, 1024) : 'Keine Rollen', inline: false }
            )
            .setFooter({ text: `Abgefragt von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (target.bannerURL()) {
            embed.setImage(target.bannerURL({ size: 1024 }));
        }

        await interaction.reply({ embeds: [embed] });
    }
};
